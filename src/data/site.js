/**
 * Editable brand & contact information (placeholders — replace with real data).
 * Nothing here connects to a real ordering or payment system.
 */
export const SITE = {
  name: 'La Cakería',
  slogan: 'Pastelería de autor',
  address: 'Calle de las Moras 214, Centro',
  city: 'Tu ciudad',
  phone: '+00 000 000 000',
  whatsapp: '00000000000',
  email: 'hola@lacakeria.com',
  hours: [
    { days: 'Martes a viernes', time: '9:00 – 19:00' },
    { days: 'Sábado y domingo', time: '10:00 – 16:00' },
  ],
  socials: [
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/' },
    { name: 'Pinterest', icon: 'pinterest p', url: 'https://pinterest.com/' },
    { name: 'Facebook', icon: 'facebook f', url: 'https://facebook.com/' },
    { name: 'WhatsApp', icon: 'whatsapp', url: 'https://wa.me/00000000000' },
  ],
  storyImage:
    'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1000&q=75',
  storyImageAlt:
    'https://images.unsplash.com/photo-1513844316321-dd2466411c4c?auto=format&fit=crop&w=700&q=75',
}

// `to` = page route; `href` = in-page anchor (the contact block lives in the
// shared footer, so "#contacto" works on every page).
export const NAV_LINKS = [
  { to: '/menu', label: 'Menú' },
  { to: '/personaliza', label: 'Personaliza' },
  { to: '/nosotros', label: 'Nuestra historia' },
  { href: '#contacto', label: 'Contacto' },
]
