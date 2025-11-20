import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      welcome: 'Welcome to quienteto.ca',
      secretSanta: 'Secret Santa',
      createGroup: 'Create Group',
      participants: 'Participants',
      priceRange: 'Price Range'
    }
  },
  es: {
    common: {
      welcome: 'Bienvenido a quienteto.ca',
      secretSanta: 'Amigo Secreto',
      createGroup: 'Crear Grupo',
      participants: 'Participantes',
      priceRange: 'Rango de Precio'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    ns: ['common'],
    defaultNS: 'common'
  });

export default i18n;