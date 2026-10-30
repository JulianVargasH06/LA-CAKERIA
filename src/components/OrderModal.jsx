import { useState } from 'react'
import { Button, Dropdown, Form, Input, Modal, TextArea } from 'semantic-ui-react'
import { cartTotal, itemPrice, itemSize, useCart } from '../context/cart'
import { CURRENCY, ORDER_SIZES, PRODUCTS } from '../data/products'
import { SITE } from '../data/site'
import { FlowerIcon } from './Icons'

const PRODUCT_OPTIONS = [
  ...PRODUCTS.map((p) => ({ key: p.id, value: p.name, text: p.name })),
  { key: 'custom', value: 'Torta personalizada', text: 'Torta personalizada' },
]

const SIZE_OPTIONS = ORDER_SIZES.map((size) => ({ key: size, value: size, text: size }))

const EMPTY = { name: '', phone: '', date: '', size: '8 porciones', notes: '' }

/**
 * Order request form. It does NOT send anything to a server: on submit it
 * shows a summary and offers to continue by e-mail / WhatsApp with the
 * request pre-filled (contact data from src/data/site.js).
 *
 * `cart` = check out the cart items; otherwise a general request where the
 * product and size are picked in the form.
 */
export default function OrderModal({ open, onClose, product, details, cart }) {
  return (
    <Modal open={open} onClose={onClose} size="small" className="ck-modal" closeIcon>
      {/* remount the form each time the modal opens with a new product */}
      {open && (
        <OrderForm key={`${cart}|${product}|${details}`} product={product} details={details} fromCart={cart} onClose={onClose} />
      )}
    </Modal>
  )
}

const cartLine = (item) =>
  `• ${item.name} (${itemSize(item)}) — ${CURRENCY}${itemPrice(item)}${item.details ? `
  ${item.details}` : ''}`

function OrderForm({ product, details, fromCart, onClose }) {
  const cart = useCart()
  const items = fromCart ? cart.items : []
  const total = cartTotal(items)
  const [values, setValues] = useState({
    ...EMPTY,
    product: product || PRODUCTS[0].name,
    notes: details ? `Mi combinación: ${details}` : '',
  })
  const [sent, setSent] = useState(false)
  const [touched, setTouched] = useState(false)

  const set = (field) => (_, { value }) => setValues((v) => ({ ...v, [field]: value }))
  const valid = values.name.trim() && values.phone.trim() && values.date

  const summary = [
    ...(fromCart
      ? ['Pedido:', ...items.map(cartLine), `Total estimado: ${CURRENCY}${total}`]
      : [`Pedido: ${values.product} (${values.size})`]),
    `Fecha: ${values.date}`,
    `Nombre: ${values.name}`,
    `Teléfono: ${values.phone}`,
    values.notes && `Notas: ${values.notes}`,
  ]
    .filter(Boolean)
    .join('\n')

  const submit = () => {
    setTouched(true)
    if (valid) setSent(true)
  }

  if (sent) {
    return (
      <>
        <Modal.Header>
          <FlowerIcon size={20} /> ¡Solicitud lista!
        </Modal.Header>
        <Modal.Content>
          <p className="ck-modal__lead">
            Esta web todavía no procesa pedidos en línea. Envíanos tu solicitud por el canal que
            prefieras y te confirmaremos disponibilidad y precio final.
          </p>
          <pre className="ck-modal__summary">{summary}</pre>
        </Modal.Content>
        <Modal.Actions>
          <Button
            as="a"
            className="ck-btn ck-btn--outline"
            href={`mailto:${SITE.email}?subject=${encodeURIComponent('Pedido La Cakería')}&body=${encodeURIComponent(summary)}`}
          >
            Enviar por correo
          </Button>
          <Button
            as="a"
            className="ck-btn ck-btn--red"
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noreferrer"
          >
            Enviar por WhatsApp
          </Button>
          {fromCart ? (
            <Button
              className="ck-btn ck-btn--link"
              onClick={() => {
                cart.clear()
                onClose()
              }}
            >
              Vaciar carrito y cerrar
            </Button>
          ) : (
            <Button className="ck-btn ck-btn--link" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Modal.Actions>
      </>
    )
  }

  return (
    <>
      <Modal.Header>
        <FlowerIcon size={20} /> {fromCart ? 'Finalizar pedido' : 'Solicitar pedido'}
      </Modal.Header>
      <Modal.Content>
        <Form id="order-form" onSubmit={submit} className="ck-form" noValidate>
          {fromCart ? (
            <div className="ck-order-items">
              <ul>
                {items.map((item) => (
                  <li key={item.uid}>
                    <span>
                      {item.name} <small>{itemSize(item)}</small>
                    </span>
                    <b>
                      {CURRENCY}
                      {itemPrice(item)}
                    </b>
                  </li>
                ))}
              </ul>
              <p className="ck-order-items__total">
                Total estimado
                <b>
                  {CURRENCY}
                  {total}
                </b>
              </p>
            </div>
          ) : (
            <Form.Field required>
              <label htmlFor="order-product">Producto</label>
              <Dropdown
                id="order-product"
                selection
                options={PRODUCT_OPTIONS}
                value={values.product}
                onChange={set('product')}
              />
            </Form.Field>
          )}
          <Form.Group widths="equal">
            {!fromCart && (
              <Form.Field required>
                <label htmlFor="order-size">Tamaño</label>
                <Dropdown id="order-size" selection options={SIZE_OPTIONS} value={values.size} onChange={set('size')} />
              </Form.Field>
            )}
            <Form.Field required error={touched && !values.date}>
              <label htmlFor="order-date">Fecha de entrega</label>
              <Input id="order-date" type="date" value={values.date} onChange={set('date')} />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field required error={touched && !values.name.trim()}>
              <label htmlFor="order-name">Nombre</label>
              <Input id="order-name" placeholder="¿Cómo te llamas?" value={values.name} onChange={set('name')} autoComplete="name" />
            </Form.Field>
            <Form.Field required error={touched && !values.phone.trim()}>
              <label htmlFor="order-phone">Teléfono</label>
              <Input id="order-phone" type="tel" placeholder="Para confirmar tu pedido" value={values.phone} onChange={set('phone')} autoComplete="tel" />
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <label htmlFor="order-notes">Notas o dedicatoria</label>
            <TextArea id="order-notes" rows={3} placeholder="Alergias, mensaje en la torta…" value={values.notes} onChange={set('notes')} />
          </Form.Field>
          {touched && !valid && <p className="ck-form__error">Completa nombre, teléfono y fecha para continuar.</p>}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button className="ck-btn ck-btn--link" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="order-form" className="ck-btn ck-btn--red">
          Preparar solicitud
        </Button>
      </Modal.Actions>
    </>
  )
}
