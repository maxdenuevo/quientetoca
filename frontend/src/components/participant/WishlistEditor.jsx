import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconGift, IconPlus, IconClose, IconSave, IconLoader } from '../../lib/icons';
import { Card, Button, Input } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * WishlistEditor Component
 *
 * Allows participants to add, edit, and remove wishlist items
 * Inline editing with save functionality
 */
export default function WishlistEditor({ participantId, initialItems = [], onUpdate }) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with initial items
  useEffect(() => {
    setItems(initialItems);
    setHasChanges(false);
  }, [initialItems]);

  // Add new item
  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    if (items.length >= 10) {
      toast.error('Máximo 10 items en tu wishlist');
      return;
    }

    setItems([...items, trimmed]);
    setNewItem('');
    setHasChanges(true);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Handle key press (Enter to add)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  // Save wishlist
  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateUserWishlist(participantId, items);
      setHasChanges(false);
      toast.success('Wishlist guardada');
      onUpdate?.(items);
    } catch (err) {
      console.error('Error saving wishlist:', err);
      toast.error('Error al guardar tu wishlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding="md">
      <Card.Header className="flex items-center justify-between">
        <Card.Title className="flex items-center gap-2">
          <IconGift className="w-5 h-5 text-brand-terracota" />
          Mi Wishlist
        </Card.Title>
        {hasChanges && (
          <Button
            variant="primary"
            size="sm"
            icon={saving ? IconLoader : IconSave}
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          >
            Guardar
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {/* Items List */}
        {items.length === 0 ? (
          <p className="text-accent-piedra dark:text-dark-text-secondary text-sm mb-4">
            Aún no tienes items. Agrega lo que te gustaría recibir.
          </p>
        ) : (
          <ul className="space-y-2 mb-4">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg group"
              >
                <span className="text-sm flex-1 text-brand-carbon dark:text-dark-text-primary">{item}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={IconClose}
                  onClick={() => handleRemoveItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-accent-piedra hover:text-accent-burdeos"
                  aria-label={`Eliminar ${item}`}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Add New Item */}
        {items.length < 10 && (
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Agregar item..."
              className="flex-1"
              fullWidth={false}
            />
            <Button
              variant="primary"
              icon={IconPlus}
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              aria-label="Agregar item"
            />
          </div>
        )}

        {/* Item Count */}
        <p className="text-xs text-accent-piedra dark:text-dark-text-secondary mt-2">
          {items.length}/10 items
        </p>
      </Card.Body>
    </Card>
  );
}

WishlistEditor.propTypes = {
  participantId: PropTypes.string.isRequired,
  initialItems: PropTypes.arrayOf(PropTypes.string),
  onUpdate: PropTypes.func,
};
