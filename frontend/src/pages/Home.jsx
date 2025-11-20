import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gift, Users, Lock, Globe } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Feature cards data structure to make maintenance easier
  const features = [
    {
      icon: <Gift className="w-10 h-10" strokeWidth={2.5} />,
      color: 'christmas-red',
      title: t('home.features.secret.title'),
      description: t('home.features.secret.description')
    },
    {
      icon: <Users className="w-10 h-10" strokeWidth={2.5} />,
      color: 'christmas-green',
      title: t('home.features.groups.title'),
      description: t('home.features.groups.description')
    },
    {
      icon: <Lock className="w-10 h-10" strokeWidth={2.5} />,
      color: 'christmas-yellow',
      title: t('home.features.restrictions.title'),
      description: t('home.features.restrictions.description')
    },
    {
      icon: <Globe className="w-10 h-10" strokeWidth={2.5} />,
      color: 'christmas-green',
      title: t('home.features.bilingual.title'),
      description: t('home.features.bilingual.description')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">quien</span>
            <span className="text-christmas-green">te</span>
            <span className="text-gradient">to.ca</span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-10 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary px-10 py-5 text-xl"
          >
            {t('home.hero.createButton')}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-12">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-brutal p-6 hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
              >
                <div className={`mb-4 text-${feature.color}`}>{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-12">
            {t('home.howItWorks.title')}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex-1 max-w-md">
              <ol className="space-y-6">
                {[1, 2, 3].map((step) => {
                  const colors = ['christmas-red', 'christmas-green', 'christmas-yellow'];
                  const bgColor = colors[(step - 1) % 3];
                  return (
                    <li key={step} className="flex gap-4">
                      <span className={`flex-shrink-0 w-12 h-12 rounded-brutal bg-${bgColor} text-white border-2 border-black dark:border-white flex items-center justify-center font-bold text-xl shadow-brutal-sm`}>
                        {step}
                      </span>
                      <div>
                        <h3 className="font-bold mb-2 text-lg">
                          {t(`home.howItWorks.step${step}.title`)}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          {t(`home.howItWorks.step${step}.description`)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}