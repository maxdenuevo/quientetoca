import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IconAlert, IconLoader, IconGift } from '../../lib/icons';
import { apiClient } from '../../lib/api-client';
import { validateGroupSimplified } from '../../utils/validation';
import { formatDate } from '../../utils/formatters';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Register Spanish locale
registerLocale('es', es);

import { Card, Button, Input, PriceRangeSlider } from '../ui';
import { useAuth } from '../auth/AuthProvider';
import LoginButton from '../auth/LoginButton';

/**
 * CreateGroupForm - Neon Editorial Design
 *
 * Simplified group creation form with neon styling.
 * Collects: name, event date, deadline, budget, participation preference
 */
const CreateGroupForm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [groupName, setGroupName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [priceRange, setPriceRange] = useState({
    min: '10000',
    max: '20000'
  });
  const [participateAsOrg, setParticipateAsOrg] = useState(true);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para crear un grupo');
      return;
    }

    try {
      const groupData = {
        name: groupName.trim(),
        eventDate: eventDate ? eventDate.toISOString().split('T')[0] : null,
        deadline: deadline ? deadline.toISOString().split('T')[0] : null,
        budgetMin: parseInt(priceRange.min) || 10000,
        budgetMax: parseInt(priceRange.max) || 20000,
        participateAsOrg,
      };

      // Validate form data
      const validation = validateGroupSimplified(groupData);
      if (!validation.isValid) {
        validation.errors.forEach(err => toast.error(err));
        return;
      }

      setLoading(true);
      setError(null);

      const result = await apiClient.createGroupSimplified(groupData, user);

      toast.success('Grupo creado exitosamente');
      navigate(`/group/${result.join_code}`);

    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message);
      toast.error(err.message || 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto">
        <Card padding="lg" variant="outlined">
          <Card.Body className="text-center">
            <div className="w-16 h-16 border-2 border-accent flex items-center justify-center mx-auto mb-4">
              <IconGift className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-text-primary mb-2">
              Crea tu grupo
            </h2>
            <p className="text-text-secondary font-body mb-6">
              Inicia sesión para crear un grupo de amigo secreto
            </p>
            <div className="space-y-3 max-w-xs mx-auto">
              <LoginButton provider="google" className="w-full" />
              <LoginButton provider="microsoft" className="w-full" />
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Group Name */}
      <Card padding="lg" variant="outlined">
        <Card.Header>
          <Card.Title>Nombre del Grupo</Card.Title>
        </Card.Header>
        <Card.Body>
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={`ej., Navidad Familiar ${new Date().getFullYear()}`}
            required
            maxLength={100}
          />
          <p className="text-xs text-text-secondary mt-2 font-mono">
            Este nombre lo verán todos los participantes
          </p>
        </Card.Body>
      </Card>

      {/* Dates Section - Inline Calendar */}
      <Card padding="lg" variant="outlined">
        <Card.Header>
          <Card.Title>Fechas</Card.Title>
        </Card.Header>
        <Card.Body>
          <p className="text-sm text-text-secondary mb-4 font-body">
            Selecciona el rango: primero el día del sorteo, luego el día del evento
          </p>

          {/* Inline Range Calendar */}
          <div className="flex justify-center mb-4">
            <DatePicker
              selectsRange
              startDate={deadline}
              endDate={eventDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setDeadline(start);
                setEventDate(end);
              }}
              inline
              monthsShown={2}
              minDate={new Date()}
              locale="es"
              calendarStartDay={1}
              calendarClassName="neon-calendar"
            />
          </div>

          {/* Selected Dates Legend */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neon-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-magenta" />
              <div>
                <p className="text-xs font-mono text-text-secondary uppercase">Sorteo</p>
                <p className="font-headline text-text-primary">
                  {deadline ? formatDate(deadline) : 'Selecciona'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-pernod" />
              <div>
                <p className="text-xs font-mono text-text-secondary uppercase">Evento</p>
                <p className="font-headline text-text-primary">
                  {eventDate ? formatDate(eventDate) : 'Selecciona'}
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Budget Section */}
      <Card padding="lg" variant="outlined">
        <Card.Header>
          <Card.Title>Presupuesto Sugerido</Card.Title>
        </Card.Header>
        <Card.Body>
          <PriceRangeSlider
            minPrice={parseInt(priceRange.min) || 10000}
            maxPrice={parseInt(priceRange.max) || 20000}
            onMinChange={(val) => setPriceRange({ ...priceRange, min: val.toString() })}
            onMaxChange={(val) => setPriceRange({ ...priceRange, max: val.toString() })}
            disabled={loading}
          />
          <p className="text-xs text-text-secondary mt-4 font-mono">
            Los participantes podrán votar para ajustar este rango
          </p>
        </Card.Body>
      </Card>

      {/* Participation Checkbox */}
      <Card padding="lg" variant="outlined">
        <Card.Body>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={participateAsOrg}
              onChange={(e) => setParticipateAsOrg(e.target.checked)}
              className="mt-1 w-5 h-5 border-2 border-neon-border bg-neon-elevated focus:ring-2 focus:ring-offset-0 accent-[var(--accent-color)]"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <div>
              <span className="font-headline font-medium text-text-primary">
                Quiero participar en el sorteo
              </span>
              <p className="text-sm text-text-secondary mt-0.5 font-body">
                Si no marcas esta opción, solo serás el organizador y no recibirás un match
              </p>
            </div>
          </label>
        </Card.Body>
      </Card>

      {/* Connected As */}
      <div className="text-center text-sm text-text-secondary font-mono">
        Creando como <span className="font-headline text-text-primary">{user?.user_metadata?.full_name || user?.email}</span>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          glow
          disabled={loading}
          loading={loading}
          icon={loading ? IconLoader : IconGift}
        >
          {loading ? 'Creando grupo...' : 'Crear Grupo'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="outlined" className="border-accent-hotbrick bg-accent-hotbrick/10">
          <Card.Body className="flex items-center gap-2 text-accent-hotbrick">
            <IconAlert className="w-5 h-5 flex-shrink-0" />
            <p className="font-headline font-medium">{error}</p>
          </Card.Body>
        </Card>
      )}

      {/* Help Text */}
      <p className="text-center text-sm text-text-secondary font-body">
        Después de crear el grupo, comparte el link para que los participantes se unan
      </p>
    </form>
  );
};

export default CreateGroupForm;
