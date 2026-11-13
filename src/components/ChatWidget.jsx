import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { Button, Input } from 'semantic-ui-react'
import { reply, welcomeMessage } from '../chatbot/engine'
import { useCart } from '../context/cart'
import { CURRENCY, getProduct } from '../data/products'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { ChatIcon, FlowerIcon, RefreshIcon, SendIcon } from './Icons'

const STORAGE_KEY = 'ck-chat-v1'
const EASE = [0.22, 1, 0.36, 1]

// the conversation survives closing the panel, changing page and reloading (same tab session)
function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.messages?.length) return saved
  } catch {
    // storage unavailable: start fresh
  }
  return { messages: [], context: undefined, nextId: 1 }
}

/** "**bold**" → <strong> (the only markup the assistant uses). */
function RichText({ text }) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))
}

function ProductChip({ id, note, onNavigate, onAdd }) {
  const product = getProduct(id)
  if (!product) return null
  const from = Math.min(...product.sizes.map((s) => s.price))
  return (
    <li className="chat-product">
      <Link to={`/menu/${id}`} className="chat-product__thumb" onClick={onNavigate} tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt="" loading="lazy" />
      </Link>
      <div className="chat-product__body">
        <Link to={`/menu/${id}`} className="chat-product__name" onClick={onNavigate}>
          {product.name}
        </Link>
        <span className="chat-product__note">{note || `desde ${CURRENCY}${from}`}</span>
        <div className="chat-product__actions">
          <Link to={`/menu/${id}`} onClick={onNavigate}>
            Ver producto
          </Link>
          <button type="button" onClick={() => onAdd(product)}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </li>
  )
}

/**
 * Floating assistant (bottom-right). Rule/intent based: answers come from
 * src/chatbot/engine.js, built only from the project's data.
 */
export default function ChatWidget() {
  const cart = useCart()
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(loadSession)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [hintSeen, setHintSeen] = useState(() => {
    try {
      return sessionStorage.getItem(`${STORAGE_KEY}-hint`) === '1'
    } catch {
      return false
    }
  })
  const logRef = useRef(null)
  const inputRef = useRef(null)
  const launcherRef = useRef(null)
  const timerRef = useRef(null)

  // persist the conversation for this browser session
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // ignore storage errors
    }
  }, [session])

  // keep the latest message in view
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [session.messages, typing, open, reduced])

  // focus the field on open, Escape closes, focus returns to the launcher
  useEffect(() => {
    if (!open) return
    const launcher = launcherRef.current
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      launcher?.focus()
    }
  }, [open])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const openChat = () => {
    setOpen(true)
    if (!hintSeen) {
      setHintSeen(true)
      try {
        sessionStorage.setItem(`${STORAGE_KEY}-hint`, '1')
      } catch {
        // ignore
      }
    }
    // first visit: the assistant greets and offers suggestions
    setSession((s) => (s.messages.length ? s : { ...s, messages: [{ id: 0, from: 'bot', ...welcomeMessage() }] }))
  }

  const send = (raw) => {
    const text = raw.trim()
    if (!text || typing) return
    setDraft('')
    setSession((s) => ({ ...s, messages: [...s.messages, { id: s.nextId, from: 'user', text: [text] }], nextId: s.nextId + 1 }))
    setTyping(true)
    // a short pause so the answer feels like a conversation, not a page swap
    const delay = reduced ? 120 : Math.min(450 + text.length * 12, 1100)
    timerRef.current = setTimeout(() => {
      setSession((s) => {
        const { message, context } = reply(text, s.context)
        return { messages: [...s.messages, { id: s.nextId, from: 'bot', ...message }], context, nextId: s.nextId + 1 }
      })
      setTyping(false)
    }, delay)
  }

  const restart = () => {
    clearTimeout(timerRef.current)
    setTyping(false)
    setSession({ messages: [{ id: 0, from: 'bot', ...welcomeMessage() }], context: undefined, nextId: 1 })
  }

  // on phones the panel covers the page: close it when the user goes somewhere
  const afterNavigate = () => isMobile && setOpen(false)
  const addToCart = (product) => {
    if (isMobile) setOpen(false)
    cart.addProduct(product)
  }
  const openCart = () => {
    if (isMobile) setOpen(false)
    cart.show()
  }

  const last = session.messages.at(-1)
  const suggestions = !typing && last?.from === 'bot' ? last.suggestions ?? [] : []

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            className="chat-panel"
            role="dialog"
            aria-label="Asistente virtual de La Cakería"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span className="chat-panel__grain" aria-hidden="true" />
            <header className="chat-panel__head">
              <span className="chat-panel__avatar" aria-hidden="true">
                <FlowerIcon size={20} />
              </span>
              <div className="chat-panel__title">
                <h2>Asistente La Cakería</h2>
                <p>Respuestas automáticas · siempre en línea</p>
              </div>
              <button type="button" className="chat-panel__icon" onClick={restart} aria-label="Empezar una nueva conversación" title="Nueva conversación">
                <RefreshIcon />
              </button>
              <button type="button" className="chat-panel__icon chat-panel__close" onClick={() => setOpen(false)} aria-label="Cerrar el asistente">
                <span />
                <span />
              </button>
            </header>

            <div className="chat-panel__log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
              {session.messages.map((m) => (
                <motion.div
                  key={m.id}
                  className={`chat-msg chat-msg--${m.from}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="sr-only">{m.from === 'bot' ? 'Asistente:' : 'Tú:'}</span>
                  <div className="chat-msg__bubble">
                    {m.text.map((t, i) => (
                      <p key={i}>
                        <RichText text={t} />
                      </p>
                    ))}
                  </div>
                  {m.products?.length > 0 && (
                    <ul className="chat-msg__products">
                      {m.products.map((p) => (
                        <ProductChip key={p.id} id={p.id} note={p.note} onNavigate={afterNavigate} onAdd={addToCart} />
                      ))}
                    </ul>
                  )}
                  {m.actions?.length > 0 && (
                    <div className="chat-msg__actions">
                      {m.actions.map((a) =>
                        a.type === 'cart' ? (
                          <button key={a.label} type="button" onClick={openCart}>
                            {a.label}
                          </button>
                        ) : (
                          <Link key={a.label} to={a.to} onClick={afterNavigate}>
                            {a.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="chat-msg chat-msg--bot" aria-label="El asistente está escribiendo">
                  <div className="chat-msg__bubble chat-typing" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="chat-panel__suggestions" aria-label="Preguntas sugeridas">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-panel__form"
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
            >
              <Input
                className="chat-panel__input"
                placeholder="Escribe tu pregunta…"
                value={draft}
                onChange={(_, { value }) => setDraft(value)}
                maxLength={300}
                aria-label="Escribe tu mensaje para el asistente"
                input={{ ref: inputRef, autoComplete: 'off' }}
              />
              <Button type="submit" className="ck-btn ck-btn--red chat-panel__send" disabled={!draft.trim() || typing} aria-label="Enviar mensaje">
                <SendIcon />
              </Button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <div className={`chat-launcher ${open ? 'is-open' : ''}`}>
        <AnimatePresence>
          {!open && !hintSeen && (
            <motion.span
              className="chat-launcher__hint"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
              aria-hidden="true"
            >
              ¿Te ayudo a elegir?
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          ref={launcherRef}
          className="chat-launcher__button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-expanded={open}
          aria-label={open ? 'Cerrar el asistente' : 'Abrir el asistente virtual'}
        >
          {open ? (
            <span className="chat-launcher__x" aria-hidden="true">
              <span />
              <span />
            </span>
          ) : (
            <ChatIcon />
          )}
        </button>
      </div>
    </>
  )
}
