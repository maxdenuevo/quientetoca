import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Gift } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-christmas-green/10 via-white to-christmas-yellow/10 dark:from-christmas-black dark:to-christmas-black">
      <div className="card-brutal p-8 max-w-2xl w-full text-center hover:shadow-brutal-xl transition-shadow">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="p-6 bg-christmas-yellow/10 rounded-brutal border-brutal border-christmas-yellow">
              <Gift
                className="w-24 h-24 text-christmas-yellow"
                strokeWidth={2.5}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-christmas-red rounded-brutal border-2 border-black dark:border-white px-3 py-1">
              <span className="text-2xl font-bold text-white">404</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-gradient">¡Ups!</span>
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Página No Encontrada
        </h2>
        <p className="text-lg font-semibold mb-8 text-gray-700 dark:text-gray-300 max-w-md mx-auto">
          La página que buscas no existe o fue movida. ¿Te perdiste en el camino?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary px-6 py-3 text-base flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            <span>Volver Atrás</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-primary px-6 py-3 text-base flex items-center gap-2"
          >
            <Home className="w-5 h-5" strokeWidth={2.5} />
            <span>Ir al Inicio</span>
          </button>
        </div>

        {/* Helpful Info */}
        <div className="mt-10 pt-8 border-t-2 border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            ¿Buscabas algo específico?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-brutal border-2 border-black dark:border-white bg-white dark:bg-christmas-black font-bold text-sm hover:bg-christmas-yellow transition-colors shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              🎁 Crear Grupo
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-brutal border-2 border-black dark:border-white bg-white dark:bg-christmas-black font-bold text-sm hover:bg-christmas-green transition-colors shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              ℹ️ Cómo Funciona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
