import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconHome, IconArrowLeft, IconGift } from '../lib/icons';
import { Button, Card } from '../components/ui';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-marfil dark:bg-dark-bg">
      <Card padding="lg" className="max-w-2xl w-full text-center">
        <Card.Body>
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="p-6 bg-accent-arcilla/10 rounded-soft-lg border border-accent-arcilla/30">
                <IconGift className="w-24 h-24 text-accent-arcilla" />
              </div>
              <div className="absolute -top-2 -right-2 bg-brand-terracota rounded-soft px-3 py-1 shadow-soft">
                <span className="text-2xl font-bold text-white">404</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold mb-4 text-brand-terracota">
            ¡Ups!
          </h1>
          <h2 className="text-2xl font-bold mb-4 text-brand-carbon dark:text-dark-text-primary">
            Página No Encontrada
          </h2>
          <p className="text-lg mb-8 text-accent-piedra dark:text-dark-text-secondary max-w-md mx-auto">
            La página que buscas no existe o fue movida. ¿Te perdiste en el camino?
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={IconArrowLeft}
            >
              Volver Atrás
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
          <div className="mt-10 pt-8 border-t border-brand-arena dark:border-dark-border">
            <p className="text-sm font-medium text-accent-piedra dark:text-dark-text-secondary mb-4">
              ¿Buscabas algo específico?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-soft border border-brand-arena dark:border-dark-border bg-white dark:bg-dark-surface font-medium text-sm text-brand-carbon dark:text-dark-text-primary hover:bg-brand-arena/30 dark:hover:bg-dark-surface-hover transition-colors shadow-soft"
              >
                Crear Grupo
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-soft border border-brand-arena dark:border-dark-border bg-white dark:bg-dark-surface font-medium text-sm text-brand-carbon dark:text-dark-text-primary hover:bg-brand-arena/30 dark:hover:bg-dark-surface-hover transition-colors shadow-soft"
              >
                Cómo Funciona
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
