import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useParticipant } from '../hooks/useParticipant';
import { Gift, Plus, X, DollarSign, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';

export default function ParticipantView() {
  const { participantId } = useParams();
  const { t } = useTranslation();
  const { 
    participant, 
    loading, 
    error, 
    fetchParticipant,
    updateParticipantData 
  } = useParticipant(participantId);

  const [wishlistItem, setWishlistItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (participantId) {
      fetchParticipant(participantId);
    }
  }, [participantId, fetchParticipant]);

  const handleAddWishlistItem = async () => {
    if (!wishlistItem.trim()) return;

    try {
      const updatedWishlist = [...(participant.wishlist || []), wishlistItem.trim()];
      await updateParticipantData(participantId, { wishlist: updatedWishlist });
      setWishlistItem('');
    } catch (err) {
      console.error('Error adding wishlist item:', err);
    }
  };

  const handleRemoveWishlistItem = async (index) => {
    try {
      const updatedWishlist = participant.wishlist.filter((_, i) => i !== index);
      await updateParticipantData(participantId, { wishlist: updatedWishlist });
    } catch (err) {
      console.error('Error removing wishlist item:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(t('common.locale'), {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={t('common.loading')} />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title={t('participantView.error.title')}
        message={error}
        showRefresh
        showHome
      />
    );
  }

  if (!participant) return null;

  return (
    <div className="min-h-screen p-4 pb-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with Match Info */}
        <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-christmas-green rounded-brutal border-2 border-black dark:border-white">
              <Gift className="w-8 h-8 text-christmas-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('participantView.yourMatch')}</h1>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {t('participantView.buyingGiftFor')}
              </p>
            </div>
          </div>
          <div className="text-center p-8 bg-christmas-red/10 border-brutal border-christmas-red rounded-brutal-lg">
            <h2 className="text-4xl font-bold text-christmas-red">
              {participant.assignedTo.name}
            </h2>
          </div>
        </div>

        {/* Event Details */}
        <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow">
          <h3 className="text-2xl font-bold mb-6">{t('participantView.eventDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-christmas-yellow/20 border-2 border-christmas-yellow rounded-brutal">
              <Calendar className="w-6 h-6 text-christmas-black" strokeWidth={2.5} />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('participantView.eventDate')}
                </p>
                <p className="font-bold text-lg">{formatDate(participant.group.eventDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-christmas-green/20 border-2 border-christmas-green rounded-brutal">
              <DollarSign className="w-6 h-6 text-christmas-black" strokeWidth={2.5} />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('participantView.priceRange')}
                </p>
                <p className="font-bold text-lg">
                  {formatCurrency(participant.group.priceRange.min, participant.group.priceRange.currency)} -
                  {formatCurrency(participant.group.priceRange.max, participant.group.priceRange.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Match's Wishlist */}
        {participant.assignedTo.wishlist?.length > 0 && (
          <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow bg-christmas-green/5">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-christmas-green" strokeWidth={2.5} />
              {t('participantView.matchWishlist')}
            </h3>
            <ul className="space-y-3">
              {participant.assignedTo.wishlist.map((item, index) => (
                <li
                  key={index}
                  className="p-4 bg-white dark:bg-christmas-black border-2 border-christmas-green rounded-brutal flex items-center shadow-brutal-sm"
                >
                  <Gift className="w-5 h-5 text-christmas-green mr-4" strokeWidth={2.5} />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Your Wishlist */}
        <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow bg-christmas-yellow/5">
          <h3 className="text-2xl font-bold mb-6">{t('participantView.yourWishlist')}</h3>

          {/* Add Wishlist Item */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={wishlistItem}
              onChange={(e) => setWishlistItem(e.target.value)}
              placeholder={t('participantView.wishlistPlaceholder')}
              className="input-brutal flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddWishlistItem()}
            />
            <button
              onClick={handleAddWishlistItem}
              className="btn-accent flex items-center gap-2 px-6"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              {t('participantView.addItem')}
            </button>
          </div>

          {/* Wishlist Items */}
          {participant.wishlist?.length > 0 ? (
            <ul className="space-y-3">
              {participant.wishlist.map((item, index) => (
                <li
                  key={index}
                  className="p-4 bg-white dark:bg-christmas-black border-2 border-christmas-yellow rounded-brutal flex items-center justify-between shadow-brutal-sm"
                >
                  <span className="font-semibold">{item}</span>
                  <button
                    onClick={() => handleRemoveWishlistItem(index)}
                    className="p-2 rounded-brutal border-2 border-black dark:border-white hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-white dark:bg-christmas-black border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-brutal text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {t('participantView.emptyWishlist')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}