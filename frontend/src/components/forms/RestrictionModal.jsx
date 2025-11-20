import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, Ban, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function RestrictionModal({ isOpen, onClose, participants, restrictions, onAddRestriction, onRemoveRestriction }) {
  const { t } = useTranslation();
  const [person1Id, setPerson1Id] = useState('');
  const [person2Id, setPerson2Id] = useState('');

  if (!isOpen) return null;

  const handleAddRestriction = () => {
    if (!person1Id || !person2Id) {
      toast.error(t('restrictions.selectBothParticipants'));
      return;
    }

    if (person1Id === person2Id) {
      toast.error(t('restrictions.cannotRestrictSelf'));
      return;
    }

    // Check if restriction already exists (bidirectional)
    const exists = restrictions.some(
      r => (r.participant1 === person1Id && r.participant2 === person2Id) ||
           (r.participant1 === person2Id && r.participant2 === person1Id)
    );

    if (exists) {
      toast.error(t('restrictions.alreadyExists'));
      return;
    }

    onAddRestriction({ participant1: person1Id, participant2: person2Id });
    setPerson1Id('');
    setPerson2Id('');
    toast.success(t('restrictions.added'));
  };

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant?.name || t('createGroup.unnamedParticipant');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restriction-modal-title"
      aria-describedby="restriction-modal-description"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2
            id="restriction-modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            {t('createGroup.manageRestrictions')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Cerrar modal de restricciones"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div
            id="restriction-modal-description"
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {t('restrictions.info')}
            </p>
          </div>

          {/* Add Restriction Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('restrictions.addNew')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="person1-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('restrictions.person1')}
                </label>
                <select
                  id="person1-select"
                  value={person1Id}
                  onChange={(e) => setPerson1Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
                  aria-label={t('restrictions.person1')}
                >
                  <option value="">{t('restrictions.selectParticipant')}</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || t('createGroup.unnamedParticipant')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="person2-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('restrictions.person2')}
                </label>
                <select
                  id="person2-select"
                  value={person2Id}
                  onChange={(e) => setPerson2Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
                  aria-label={t('restrictions.person2')}
                >
                  <option value="">{t('restrictions.selectParticipant')}</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || t('createGroup.unnamedParticipant')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddRestriction}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Ban className="w-4 h-4" />
              {t('restrictions.addButton')}
            </button>
          </div>

          {/* Current Restrictions */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('restrictions.current')} ({restrictions.length})
            </h3>

            {restrictions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                {t('restrictions.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {restrictions.map((restriction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Ban className="w-4 h-4 text-red-500" />
                      <span className="text-gray-900 dark:text-white">
                        {getParticipantName(restriction.participant1)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">↔</span>
                      <span className="text-gray-900 dark:text-white">
                        {getParticipantName(restriction.participant2)}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveRestriction(index)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      aria-label="Remove restriction"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
}

RestrictionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  restrictions: PropTypes.arrayOf(
    PropTypes.shape({
      participant1: PropTypes.string.isRequired,
      participant2: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddRestriction: PropTypes.func.isRequired,
  onRemoveRestriction: PropTypes.func.isRequired,
};

export default RestrictionModal;
