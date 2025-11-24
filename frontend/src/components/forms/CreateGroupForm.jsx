import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IconClose, IconPlus, IconAlert, IconBan, IconUpload, IconChevronDown, IconLoader } from '../../lib/icons';
import { MatchingService } from '../../utils/matching';
import { apiClient } from '../../lib/api-client';
import { validateGroup } from '../../utils/validation';
import { formatPriceInput, parsePriceInput } from '../../utils/formatters';
import ChileanDatePicker from '../ui/ChileanDatePicker';
import { CSVParser } from '../../utils/csvParser';
import { Card, Button, Input } from '../ui';

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
    min: '10000',
    max: '20000'
  });
  const [deadline, setDeadline] = useState(null);
  // Track which participants have expanded restrictions
  const [expandedRestrictions, setExpandedRestrictions] = useState(new Set());

  // Handle price increment/decrement with arrow keys
  const handlePriceKeyDown = (e, field) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseInt(priceRange[field]) || 0;
      const step = 1000;
      const newValue = e.key === 'ArrowUp' ? currentValue + step : Math.max(0, currentValue - step);
      setPriceRange({ ...priceRange, [field]: newValue.toString() });
    }
  };

  // Add a new participant to the group
  const addParticipant = () => {
    if (participants.length >= 20) {
      toast.error('Máximo 20 personas por grupo');
      return;
    }
    const newId = Math.max(...participants.map(p => p.id)) + 1;
    setParticipants([...participants, { id: newId, name: '', email: '' }]);
  };

  // Remove a participant and their associated restrictions
  const removeParticipant = (id) => {
    if (participants.length <= 2) {
      toast.error('Necesitas al menos 2 personas para jugar');
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

  // Toggle restriction between two participants
  const toggleRestriction = (participantId, targetId) => {
    const hasRestriction = restrictions.some(
      r => (r.participant1Id === participantId && r.participant2Id === targetId)
    );

    if (hasRestriction) {
      // Remove restriction (both directions)
      setRestrictions(restrictions.filter(r =>
        !(r.participant1Id === participantId && r.participant2Id === targetId) &&
        !(r.participant1Id === targetId && r.participant2Id === participantId)
      ));
    } else {
      // Add restriction (both directions)
      setRestrictions([
        ...restrictions,
        { participant1Id: participantId, participant2Id: targetId },
        { participant1Id: targetId, participant2Id: participantId }
      ]);
    }
  };

  // Check if participant has restriction with target
  const hasRestriction = (participantId, targetId) => {
    return restrictions.some(
      r => (r.participant1Id === participantId && r.participant2Id === targetId)
    );
  };

  // Get restricted participants for a given participant (unique list)
  const getRestrictedFor = (participantId) => {
    const restrictedIds = new Set(
      restrictions
        .filter(r => r.participant1Id === participantId)
        .map(r => r.participant2Id)
    );

    return Array.from(restrictedIds)
      .map(id => participants.find(p => p.id === id))
      .filter(Boolean);
  };

  // Toggle restrictions section expansion
  const toggleRestrictionsExpanded = (participantId) => {
    setExpandedRestrictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  // Handle CSV file selection
  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = await CSVParser.validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result;
      if (typeof csvText !== 'string') return;

      // Parse CSV
      const result = CSVParser.parse(csvText);

      // Show errors if any
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        if (result.participants.length === 0) return;
      }

      // Generate new IDs for imported participants
      const maxId = participants.length > 0
        ? Math.max(...participants.map(p => p.id))
        : 0;

      const importedParticipants = result.participants.map((p, index) => ({
        ...p,
        id: maxId + index + 1
      }));

      // Map restrictions to new IDs
      const idMapping = new Map();
      result.participants.forEach((p, index) => {
        idMapping.set(p.id, maxId + index + 1);
      });

      const importedRestrictions = result.restrictions.map(r => ({
        participant1Id: idMapping.get(r.participant1Id),
        participant2Id: idMapping.get(r.participant2Id)
      }));

      // Update state
      setParticipants(importedParticipants);
      setRestrictions(importedRestrictions);

      toast.success(`${importedParticipants.length} participantes importados`);
    };

    reader.onerror = () => {
      toast.error('Error al leer el archivo');
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
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
        priceRange: {
          ...priceRange,
          currency: 'CLP'
        },
        deadline: deadline ? deadline.toISOString().split('T')[0] : ''
      };

      const validation = validateGroup(groupData);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      const matches = MatchingService.generateMatches(participants, restrictions);

      if (!MatchingService.validateMatching(matches, participants, restrictions)) {
        throw new Error('No pudimos hacer el sorteo con estas restricciones. Intenta con menos restricciones.');
      }

      setLoading(true);
      setError(null);

      const result = await apiClient.createGroup({
        ...groupData,
        matches: Array.from(matches.entries())
      });

      toast.success('¡Grupo creado exitosamente!');
      navigate(`/group/${result.id}/${result.admin_token}`);

    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Group Details Section */}
      <Card padding="lg">
        <Card.Header>
          <Card.Title>Detalles del Grupo</Card.Title>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Input
            label="Nombre del Grupo *"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="ej., Navidad Familiar 2025"
            required
          />
          <Input
            label="Tu Email *"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="tucorreo@gmail.com"
            required
          />
        </Card.Body>
      </Card>

      {/* Participants Section */}
      <Card padding="lg">
        <Card.Header className="flex justify-between items-center flex-wrap gap-2">
          <Card.Title>¿Quiénes Participan?</Card.Title>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={IconUpload}
              onClick={handleImportClick}
            >
              Importar CSV
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={IconPlus}
              onClick={addParticipant}
            >
              Agregar Persona
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />

          <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.id} className="space-y-2">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="email"
                    value={participant.email}
                    onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                    placeholder="mail@ejemplo.cl"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  icon={IconClose}
                  onClick={() => removeParticipant(participant.id)}
                  aria-label="Quitar participante"
                  className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-500"
                />
              </div>

              {/* Collapsible Restrictions with Badges */}
              {participants.filter(p => p.id !== participant.id && p.name).length > 0 && (
                <div className="ml-4">
                  {/* Toggle button with count */}
                  <button
                    type="button"
                    onClick={() => toggleRestrictionsExpanded(participant.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <IconBan className="w-4 h-4" />
                    <span>
                      {getRestrictedFor(participant.id).length > 0
                        ? `${getRestrictedFor(participant.id).length} ${getRestrictedFor(participant.id).length === 1 ? 'restricción' : 'restricciones'}`
                        : 'Sin restricciones'}
                    </span>
                    <IconChevronDown
                      className={`w-4 h-4 transition-transform ${expandedRestrictions.has(participant.id) ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Badges - Always visible if there are restrictions */}
                  {getRestrictedFor(participant.id).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getRestrictedFor(participant.id).map(restricted => (
                        <button
                          key={restricted.id}
                          type="button"
                          onClick={() => toggleRestriction(participant.id, restricted.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-accent-burdeos text-white rounded-soft text-xs font-medium hover:bg-accent-burdeos/80 transition-colors"
                        >
                          {restricted.name}
                          <IconClose className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Checkboxes - Only visible when expanded */}
                  {expandedRestrictions.has(participant.id) && (
                    <div className="mt-3 p-3 bg-brand-arena/30 dark:bg-dark-surface rounded-soft-lg border border-dashed border-brand-arena dark:border-dark-border space-y-2">
                      {participants
                        .filter(p => p.id !== participant.id && p.name)
                        .map(p => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-brand-arena/50 dark:hover:bg-dark-surface-hover p-2 rounded-soft transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={hasRestriction(participant.id, p.id)}
                              onChange={() => toggleRestriction(participant.id, p.id)}
                              className="w-4 h-4 rounded border border-brand-arena dark:border-dark-border text-brand-terracota focus:ring-2 focus:ring-brand-terracota/20"
                            />
                            <span className="text-sm font-medium text-brand-carbon dark:text-dark-text-primary">
                              {p.name}
                            </span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        </Card.Body>
      </Card>

      {/* Price Range Section */}
      <Card padding="lg">
        <Card.Header>
          <Card.Title>Rango de Precios</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Desde"
              type="text"
              value={formatPriceInput(priceRange.min)}
              onChange={(e) => setPriceRange({ ...priceRange, min: parsePriceInput(e.target.value) })}
              onKeyDown={(e) => handlePriceKeyDown(e, 'min')}
              placeholder="10.000"
            />
            <Input
              label="Hasta"
              type="text"
              value={formatPriceInput(priceRange.max)}
              onChange={(e) => setPriceRange({ ...priceRange, max: parsePriceInput(e.target.value) })}
              onKeyDown={(e) => handlePriceKeyDown(e, 'max')}
              placeholder="20.000"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Deadline Section */}
      <Card padding="lg">
        <Card.Header>
          <Card.Title>¿Cuándo es el Evento?</Card.Title>
        </Card.Header>
        <Card.Body>
          <ChileanDatePicker
            selected={deadline}
            onChange={(date) => setDeadline(date)}
            className="input-brutal w-full"
            placeholderText="Selecciona una fecha"
            minDate={new Date()}
          />
        </Card.Body>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          loading={loading}
          icon={loading ? IconLoader : null}
        >
          {loading ? 'Cargando...' : 'Crear Grupo y Sortear'}
        </Button>
      </div>

      {error && (
        <Card className="bg-accent-burdeos/10 border-accent-burdeos">
          <Card.Body className="flex items-center gap-2 text-accent-burdeos dark:text-accent-burdeos-light">
            <IconAlert className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </Card.Body>
        </Card>
      )}

    </form>
  );
};

export default CreateGroupForm;
