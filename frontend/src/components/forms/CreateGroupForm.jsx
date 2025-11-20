import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X, Plus, AlertCircle, Ban } from 'lucide-react';
import { MatchingService } from '../../utils/matching';
import { useGroupData } from '../../hooks/useGroupData';
import { validateGroup } from '../../utils/validation';
import RestrictionModal from './RestrictionModal';

const CreateGroupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createGroup, loading, error } = useGroupData();

  // Group details state
  const [groupName, setGroupName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Initialize state with two empty participants
  const [participants, setParticipants] = useState([
    { id: 1, name: '', email: '' },
    { id: 2, name: '', email: '' }
  ]);
  const [restrictions, setRestrictions] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
    currency: 'USD'
  });
  const [deadline, setDeadline] = useState('');
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  // Add a new participant to the group
  const addParticipant = () => {
    if (participants.length >= 20) {
      toast.error(t('createGroup.maxParticipantsReached'));
      return;
    }
    const newId = Math.max(...participants.map(p => p.id)) + 1;
    setParticipants([...participants, { id: newId, name: '', email: '' }]);
  };

  // Remove a participant and their associated restrictions
  const removeParticipant = (id) => {
    if (participants.length <= 2) {
      toast.error(t('createGroup.minTwoParticipants'));
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
    setRestrictions(restrictions.filter(r =>
      r.participant1 !== id && r.participant2 !== id
    ));
  };

  // Update participant information
  const updateParticipant = (id, field, value) => {
    setParticipants(participants.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Add a restriction
  const addRestriction = (restriction) => {
    setRestrictions([...restrictions, restriction]);
  };

  // Remove a restriction by index
  const removeRestriction = (index) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const groupData = {
        name: groupName,
        adminEmail: adminEmail,
        participants,
        restrictions,
        priceRange,
        deadline
      };

      const validation = validateGroup(groupData);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      const matches = MatchingService.generateMatches(participants, restrictions);
      
      if (!MatchingService.validateMatching(matches, participants, restrictions)) {
        throw new Error(t('createGroup.matchingError'));
      }

      const result = await createGroup({
        ...groupData,
        matches: Array.from(matches.entries())
      });

      toast.success('Group created successfully!');
      navigate(`/group/${result.id}/${result.admin_token}`);

    } catch (err) {
      toast.error(err.message || t('createGroup.generalError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Group Details Section */}
      <div className="card-brutal p-6 space-y-4 hover:shadow-brutal-lg transition-shadow">
        <h2 className="text-2xl font-bold">
          {t('createGroup.title')}
        </h2>

        <div>
          <label className="block text-sm font-bold mb-2">
            {t('createGroup.groupName')} *
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('createGroup.groupNamePlaceholder')}
            required
            className="input-brutal"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">
            {t('createGroup.adminEmail')} *
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder={t('createGroup.adminEmailPlaceholder')}
            required
            className="input-brutal"
          />
        </div>
      </div>

      {/* Participants Section */}
      <div className="card-brutal p-6 space-y-6 hover:shadow-brutal-lg transition-shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {t('createGroup.participants')}
          </h2>
          <button
            type="button"
            onClick={addParticipant}
            className="btn-secondary flex items-center px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} />
            {t('createGroup.addParticipant')}
          </button>
        </div>

        <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.id} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                  placeholder={t('createGroup.namePlaceholder')}
                  className="input-brutal"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  value={participant.email}
                  onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                  placeholder={t('createGroup.emailPlaceholder')}
                  className="input-brutal"
                />
              </div>
              <button
                type="button"
                onClick={() => removeParticipant(participant.id)}
                className="p-2 rounded-brutal border-2 border-black dark:border-white bg-white dark:bg-christmas-black hover:bg-red-100 dark:hover:bg-red-900 text-christmas-black dark:text-white transition-colors"
                aria-label={t('createGroup.removeParticipant')}
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow">
        <h3 className="text-xl font-bold mb-4">{t('createGroup.priceRange')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              {t('createGroup.minPrice')}
            </label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="input-brutal"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">
              {t('createGroup.maxPrice')}
            </label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="input-brutal"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">
              {t('createGroup.currency')}
            </label>
            <select
              value={priceRange.currency}
              onChange={(e) => setPriceRange({ ...priceRange, currency: e.target.value })}
              className="input-brutal"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CLP">CLP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deadline Section */}
      <div className="card-brutal p-6 hover:shadow-brutal-lg transition-shadow">
        <label className="block text-sm font-bold mb-2">
          {t('createGroup.deadline')}
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input-brutal"
        />
      </div>

      {/* Restrictions Section */}
      <div className="card-brutal p-6 space-y-3 hover:shadow-brutal-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {t('createGroup.restrictions')}
            </h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
              {t('restrictions.info')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowRestrictionModal(true)}
          className="flex items-center gap-2 px-4 py-3 border-brutal border-dashed border-black dark:border-white rounded-brutal hover:bg-christmas-yellow hover:border-solid transition-all w-full justify-center font-bold shadow-brutal-sm hover:shadow-brutal"
        >
          <Ban className="w-5 h-5" strokeWidth={2.5} />
          <span>
            {restrictions.length === 0
              ? t('createGroup.manageRestrictions')
              : `${restrictions.length} ${t('restrictions.current')}`}
          </span>
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 py-4 text-lg"
        >
          {loading ? t('common.loading') : t('createGroup.createButton')}
        </button>
      </div>

      {error && (
        <div className="card-brutal p-4 bg-christmas-red/10 border-christmas-red">
          <div className="flex items-center gap-2 text-christmas-red dark:text-red-400">
            <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Restriction Modal */}
      <RestrictionModal
        isOpen={showRestrictionModal}
        onClose={() => setShowRestrictionModal(false)}
        participants={participants}
        restrictions={restrictions}
        onAddRestriction={addRestriction}
        onRemoveRestriction={removeRestriction}
      />
    </form>
  );
};

export default CreateGroupForm;