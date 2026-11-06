import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import { ArrowIcon } from '../components/Icons'
import PageHeader from '../components/PagePanel'

/** Any unknown route (and unknown product ids). */
export default function NotFoundPage() {
  return (
    <>
      <title>Página no encontrada — La Cakería</title>
      <PageHeader
        id="notfound-title"
        eyebrow="Error 404"
        title={
          <>
            Esta página se nos <em>quemó</em>
          </>
        }
        intro="No encontramos lo que buscabas. Quizá cambió de nombre o ya no está en el menú."
        badge="Volvemos enseguida · "
      >
        <div className="page-head__actions">
          <Button as={Link} to="/" className="ck-btn ck-btn--dark ck-btn--lg">
            Ir al inicio <ArrowIcon />
          </Button>
          <Button as={Link} to="/menu" className="ck-btn ck-btn--outline ck-btn--lg">
            Ver el menú
          </Button>
        </div>
      </PageHeader>
    </>
  )
}
