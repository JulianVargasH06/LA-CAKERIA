/**
 * Dynamic English → Spanish translation for external content (TheMealDB).
 *
 * Engines, tried in this order:
 *  1. The browser's built-in Translator API (Chrome / Edge desktop) when its
 *     en→es model is on the device: free, no limits, nothing leaves the PC.
 *  2. MyMemory (https://mymemory.translated.net), a public translation API:
 *     free, no key, 5,000 characters/day per IP — 50,000 if a contact email is
 *     set in VITE_MYMEMORY_EMAIL (see .env.example).
 *
 * Every translation is cached (memory + localStorage), so a text is only
 * translated once per browser. Pages render with `toSpanish(text)`, which
 * reads that cache and falls back to the original text.
 */
const SOURCE = 'en'
const TARGET = 'es'
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'
const CONTACT_EMAIL = import.meta.env.VITE_MYMEMORY_EMAIL
const MAX_BYTES = 450 // MyMemory accepts up to 500 bytes per request
const CACHE_KEY = 'ck-translations-v1'

export class TranslationError extends Error {}

const normalize = (text) => String(text ?? '').replace(/\s+/g, ' ').trim()
const needsTranslation = (text) => /[a-z]/i.test(text)
const byteLength = (text) => new TextEncoder().encode(text).length

/* ---------- cache ---------- */
let cache
function getCache() {
  if (cache) return cache
  cache = new Map()
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
    for (const [en, es] of Object.entries(saved)) cache.set(en, es)
  } catch {
    // storage unavailable (private mode…): memory cache only
  }
  return cache
}

let saveTimer
function persistCache() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(getCache())))
    } catch {
      // quota exceeded or storage blocked: keep working in memory
    }
  }, 300)
}

/** True once `text` has a Spanish version in the cache. */
export function hasSpanish(text) {
  return getCache().has(normalize(text))
}

/** Spanish version of `text` if it has been translated, otherwise the original. */
export function toSpanish(text) {
  return getCache().get(normalize(text)) ?? text
}

/* ---------- engine 1: browser built-in Translator API ---------- */
let deviceTranslator = null
let deviceCheck = null

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))])

async function checkDeviceTranslator() {
  const options = { sourceLanguage: SOURCE, targetLanguage: TARGET }
  // availability() can hang in some embedded browsers: never wait more than 2 s
  const availability = await withTimeout(globalThis.Translator.availability(options), 2000).catch(() => null)
  if (availability === 'available') {
    deviceTranslator = await withTimeout(globalThis.Translator.create(options), 4000).catch(() => null)
    return deviceTranslator
  }
  // the model must be downloaded first, which the browser only allows right after
  // a user gesture (e.g. the click that opened the recipe): start it in the
  // background and use MyMemory meanwhile
  if ((availability === 'downloadable' || availability === 'downloading') && navigator.userActivation?.isActive) {
    globalThis.Translator.create(options).then(
      (translator) => {
        deviceTranslator = translator
      },
      () => {},
    )
  }
  return null
}

async function getDeviceTranslator() {
  if (deviceTranslator) return deviceTranslator
  if (!('Translator' in globalThis)) return null
  deviceCheck ??= checkDeviceTranslator().finally(() => {
    deviceCheck = null
  })
  return deviceCheck
}

/* ---------- engine 2: MyMemory ---------- */
function decodeEntities(text) {
  return new DOMParser().parseFromString(text, 'text/html').documentElement.textContent ?? text
}

async function myMemoryRequest(text, signal) {
  const params = new URLSearchParams({ q: text, langpair: `${SOURCE}|${TARGET}` })
  if (CONTACT_EMAIL) params.set('de', CONTACT_EMAIL)
  const response = await fetch(`${MYMEMORY_URL}?${params}`, { signal })
  if (!response.ok) throw new TranslationError(`el traductor respondió con el código ${response.status}`)
  const data = await response.json()
  const translated = data.responseData?.translatedText ?? ''
  const quotaHit = data.quotaFinished || Number(data.responseStatus) === 429 || /MYMEMORY WARNING/i.test(translated)
  if (quotaHit) throw new TranslationError('se alcanzó el límite diario del traductor gratuito')
  if (Number(data.responseStatus) !== 200 || !translated) {
    throw new TranslationError(data.responseDetails || 'el traductor no pudo procesar el texto')
  }
  return decodeEntities(translated)
}

/** Long single texts are split into sentences that fit one request. */
function splitLong(text) {
  const parts = []
  let current = ''
  for (const sentence of text.split(/(?<=[.!?;:])\s+/)) {
    const next = current ? `${current} ${sentence}` : sentence
    if (byteLength(next) <= MAX_BYTES) current = next
    else {
      if (current) parts.push(current)
      current = sentence.slice(0, MAX_BYTES) // a single huge sentence is truncated rather than rejected
    }
  }
  if (current) parts.push(current)
  return parts
}

/** Short texts are grouped one per line (MyMemory keeps line breaks) to save requests. */
function groupLines(texts) {
  const groups = []
  let current = []
  for (const text of texts) {
    const candidate = [...current, text].join('\n')
    if (current.length && byteLength(candidate) > MAX_BYTES) {
      groups.push(current)
      current = [text]
    } else current.push(text)
  }
  if (current.length) groups.push(current)
  return groups
}

async function translateWithMyMemory(texts, signal, store) {
  const short = texts.filter((t) => byteLength(t) <= MAX_BYTES)
  const long = texts.filter((t) => byteLength(t) > MAX_BYTES)

  for (const group of groupLines(short)) {
    const lines = (await myMemoryRequest(group.join('\n'), signal)).split('\n')
    if (lines.length === group.length) {
      group.forEach((text, i) => store.set(text, lines[i].trim()))
    } else {
      // the service merged or split lines: translate this group one by one
      for (const text of group) store.set(text, (await myMemoryRequest(text, signal)).trim())
    }
  }

  for (const text of long) {
    const pieces = []
    for (const part of splitLong(text)) pieces.push((await myMemoryRequest(part, signal)).trim())
    store.set(text, pieces.join(' '))
  }
}

/**
 * Translates `texts` to Spanish and stores the results in the cache.
 * Resolves with the engine used: 'device' | 'mymemory' | 'cache'.
 * Throws TranslationError (or a network error) if the texts could not be
 * translated; anything translated before the failure stays cached.
 */
export async function translateToSpanish(texts, signal) {
  const store = getCache()
  const pending = [...new Set(texts.map(normalize))].filter((t) => t && needsTranslation(t) && !store.has(t))
  if (pending.length === 0) return 'cache'

  try {
    const translator = await getDeviceTranslator()
    if (translator) {
      try {
        for (const text of pending) {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
          store.set(text, await translator.translate(text))
        }
        return 'device'
      } catch (error) {
        if (error.name === 'AbortError') throw error
        deviceTranslator = null // on-device engine failed: finish with MyMemory
      }
    }
    await translateWithMyMemory(
      pending.filter((t) => !store.has(t)),
      signal,
      store,
    )
    return 'mymemory'
  } finally {
    persistCache()
  }
}
