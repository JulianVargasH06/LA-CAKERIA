import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import { cartTotal, itemPrice, useCart } from '../context/cart'
import { CURRENCY } from '../data/products'
import { ArrowIcon, FlowerIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1]

function CartLine({ item, onSize, onRemove }) {
  return (
    <motion.li
      className="cart-line"
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="cart-line__thumb">
        {item.image ? <img src={item.image} alt="" /> : <FlowerIcon size={26} />}
      </div>
      <div className="cart-line__body">
        <div className="cart-line__head">
          <h3>{item.name}</h3>
          <span className="cart-line__price">
            {CURRENCY}
            {itemPrice(item)}
          </span>
        </div>
        {item.details && <p className="cart-line__details">{item.details}</p>}
        <div className="cart-line__sizes" role="group" aria-label={`Tamaño de ${item.name}`}>
          {item.sizes.map((size, i) => (
            <Button
              key={size.label}
              type="button"
              className={`ck-size ${i === item.sizeIndex ? 'is-active' : ''}`}
              aria-pressed={i === item.sizeIndex}
              onClick={() => onSize(i)}
            >
              {size.label}
              <small>
                {CURRENCY}
                {size.price}
              </small>
            </Button>
          ))}
        </div>
        <button type="button" className="cart-line__remove" onClick={onRemove}>
          Quitar
        </button>
      </div>
    </motion.li>
  )
}

/** Side panel with the cart contents; "Finalizar pedido" hands off to the order modal. */
export default function CartPanel({ onCheckout }) {
  const cart = useCart()
  const { items, open, close } = cart
  const closeRef = useRef(null)
  const returnFocus = useRef(null)
  const total = cartTotal(items)

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnFocus.current?.focus?.()
    }
  }, [open, close])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cart-overlay"
            onClick={cart.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="cart-panel__grain" aria-hidden="true" />
            <header className="cart-panel__head">
              <h2 id="cart-title">
                Tu pedido <span className="cart-panel__count">{items.length}</span>
              </h2>
              <button
                type="button"
                ref={closeRef}
                className="ck-round cart-panel__close"
                aria-label="Cerrar carrito"
                onClick={cart.close}
              >
                <span />
                <span />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="cart-panel__empty">
                <FlowerIcon size={34} />
                <p>Tu carrito está vacío… por ahora.</p>
                <Button as={Link} to="/menu" className="ck-btn ck-btn--dark" onClick={cart.close}>
                  Ver el menú <ArrowIcon />
                </Button>
                <Button as={Link} to="/personaliza" className="ck-btn ck-btn--outline" onClick={cart.close}>
                  Crear mi torta
                </Button>
              </div>
            ) : (
              <>
                <ul className="cart-panel__list">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartLine
                        key={item.uid}
                        item={item}
                        onSize={(sizeIndex) => cart.setSize(item.uid, sizeIndex)}
                        onRemove={() => cart.remove(item.uid)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="cart-panel__foot">
                  <div className="cart-panel__total">
                    <span>Total estimado</span>
                    <strong>
                      {CURRENCY}
                      {total}
                    </strong>
                  </div>
                  <p className="cart-panel__note">
                    Precios de referencia según el tamaño elegido; se confirman al procesar tu
                    solicitud.
                  </p>
                  <Button className="ck-btn ck-btn--red ck-btn--lg cart-panel__checkout" onClick={onCheckout}>
                    Finalizar pedido <ArrowIcon />
                  </Button>
                  <button type="button" className="cart-panel__continue" onClick={cart.close}>
                    Seguir comprando
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
