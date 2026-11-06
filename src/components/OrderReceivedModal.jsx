import { Button, Modal } from 'semantic-ui-react'
import { FlowerIcon } from './Icons'

/** Shown after "Confirmar pedido" in the cart: a simple confirmation, nothing else. */
export default function OrderReceivedModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="tiny" className="ck-modal ck-modal--received">
      <Modal.Content>
        <span className="ck-modal__icon" aria-hidden="true">
          <FlowerIcon size={30} />
        </span>
        <h2 className="ck-modal__title">¡Pedido recibido!</h2>
        <p className="ck-modal__lead">Gracias por elegir La Cakería.</p>
        <Button className="ck-btn ck-btn--red ck-btn--lg" onClick={onClose} autoFocus>
          Aceptar
        </Button>
      </Modal.Content>
    </Modal>
  )
}
