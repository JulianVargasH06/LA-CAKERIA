/**
 * Content for /nosotros. Demonstration copy — replace it with the bakery's
 * real story. It deliberately avoids founders, dates or figures presented as
 * facts. Photos: Unsplash (free Unsplash License).
 */
const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

export const ABOUT_HERO_IMAGE = {
  src: unsplash('1612884610549-ce221d92514a', 1000),
  alt: 'Manos amasando sobre una mesa con harina',
}

export const ESSENCE = {
  quote: 'Hornear pocas cosas, pero hacerlas extraordinarias.',
  paragraphs: [
    'La Cakería es una pastelería de autor: un taller pequeño donde cada torta se piensa como una pieza única y no como un producto en serie.',
    'Preferimos un menú corto y cuidado a una vitrina interminable. Así cada receta recibe el tiempo que necesita y cada encargo, la atención que merece.',
  ],
  image: {
    src: unsplash('1537734796389-e1fc293cf856'),
    alt: 'Bola de masa enharinada sobre la mesa de trabajo',
  },
}

export const PROCESS = [
  {
    title: 'Elegir',
    text: 'Empezamos por la materia prima: fruta en su punto, chocolate con carácter y lácteos frescos.',
    image: unsplash('1603292270400-d06b3fda2878', 700),
    alt: 'Tarta con frutos rojos frescos',
  },
  {
    title: 'Hornear',
    text: 'Bizcochos horneados en pequeños lotes y sin prisas, para conseguir una miga húmeda y pareja.',
    image: unsplash('1595801105145-795f1927c0fc', 700),
    alt: 'Harina espolvoreada sobre la mesa',
  },
  {
    title: 'Montar',
    text: 'Capa a capa, a mano: rellenos, cremas y coberturas se equilibran para que cada bocado tenga de todo.',
    image: unsplash('1586788680434-30d324b2d46f', 700),
    alt: 'Porción de red velvet mostrando sus capas',
  },
  {
    title: 'Terminar',
    text: 'El último gesto es el detalle: frutas, rulos de chocolate y brillo justo antes de entregar.',
    image: unsplash('1771415788844-f20f43b984d9', 700),
    alt: 'Porción de torta decorada con frambuesas',
  },
]

export const INGREDIENTS = [
  { name: 'Cacao de origen', text: 'Chocolate intenso para bizcochos y ganaches con sabor profundo.', tone: 'dark' },
  { name: 'Frutas de temporada', text: 'Frambuesas y frutos rojos elegidos según lo que da cada época.', tone: 'red' },
  { name: 'Mantequilla de verdad', text: 'Sin sustitutos: la base de masas, cremas y frostings.', tone: 'caramel' },
  { name: 'Sin conservantes', text: 'Postres pensados para disfrutarse frescos, el mismo día o al siguiente.', tone: 'pink' },
]

export const PRINCIPLES = [
  { title: 'Sabor primero', text: 'La decoración acompaña; nunca tapa una receta.' },
  { title: 'Presentación editorial', text: 'Cada pieza se piensa para verse tan bien como sabe.' },
  { title: 'Hecho para compartir', text: 'Tortas que se convierten en el centro de la mesa.' },
]

export const GALLERY = [
  { src: unsplash('1622621746668-59fb299bc4d7', 800), alt: 'Cheesecake con fresas' },
  { src: unsplash('1563729784474-d77dbb933a9e', 800), alt: 'Cupcakes con crema rosa' },
  { src: unsplash('1602630209855-dceac223adfe', 800), alt: 'Torta red velvet entera con una porción cortada' },
  { src: unsplash('1614174486496-344ef3e9d870', 800), alt: 'Tarta de limón con frutos rojos' },
  { src: unsplash('1771415759744-7a3c0972801e', 800), alt: 'Porción de torta vista desde arriba' },
  { src: unsplash('1606854428857-5121b55a2661', 800), alt: 'Harina y utensilios sobre la mesa de trabajo' },
]
