import { useNavigate } from 'react-router-dom';
import { IconHome, IconArrowLeft, IconGift } from '../lib/icons';
import { Button, Card } from '../components/ui';

/**
 * NotFound Page - Neon Editorial Design
 *
 * 404 error page with neon styling.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neon-base">
      <Card padding="lg" variant="outlined" className="max-w-2xl w-full text-center">
        <Card.Body>
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="p-8 border-2 border-accent-magenta bg-accent-magenta/10">
                <IconGift className="w-24 h-24 text-accent-magenta" />
              </div>
              <div className="absolute -top-3 -right-3 bg-accent px-4 py-2">
                <span className="font-display text-3xl text-neon-base">404</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="font-display text-5xl uppercase tracking-wide text-accent mb-4">
            Ups
          </h1>
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-4">
            Pagina No Encontrada
          </h2>
          <p className="text-lg mb-8 text-text-secondary font-body max-w-md mx-auto">
            La pagina que buscas no existe o fue movida. Te perdiste en el camino?
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={IconArrowLeft}
            >
              Volver Atras
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate('/')}
              icon={IconHome}
            >
              Ir al Inicio
            </Button>
          </div>

          {/* Helpful Info */}
          <div className="mt-10 pt-8 border-t border-neon-border">
            <p className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4">
              Buscabas algo especifico?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-neon-border bg-neon-surface font-mono text-sm uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent transition-colors"
              >
                Crear Grupo
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-neon-border bg-neon-surface font-mono text-sm uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent transition-colors"
              >
                Como Funciona
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
