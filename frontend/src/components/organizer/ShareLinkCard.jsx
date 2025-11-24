import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconLink, IconCopy, IconCheck, IconWhatsapp, IconQrCode } from '../../lib/icons';
import { Card, Button } from '../ui';
import toast from 'react-hot-toast';

/**
 * ShareLinkCard Component
 *
 * Shows the group join link with copy and share options
 */
export default function ShareLinkCard({ joinCode, groupName }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const joinUrl = `${window.location.origin}/join/${joinCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success('Link copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying:', err);
      toast.error('Error al copiar');
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🎁 ¡Te invito a nuestro Amigo Secreto!\n\n` +
      `Grupo: ${groupName}\n\n` +
      `Únete aquí: ${joinUrl}\n\n` +
      `Haz click en el link, inicia sesión con Google y listo.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Card padding="lg">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconLink className="w-5 h-5 text-brand-terracota" />
          Link de Invitación
        </Card.Title>
      </Card.Header>

      <Card.Body>
        {/* Join Code Display */}
        <div className="text-center mb-4">
          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-1">Código del grupo</p>
          <p className="text-4xl font-mono font-black tracking-wider text-brand-terracota">
            {joinCode}
          </p>
        </div>

        {/* URL Display */}
        <div className="bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg p-3 mb-4">
          <p className="text-xs text-accent-piedra dark:text-dark-text-secondary mb-1">URL completa</p>
          <p className="font-mono text-sm break-all select-all text-brand-carbon dark:text-dark-text-primary">
            {joinUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={copied ? 'primary' : 'secondary'}
            icon={copied ? IconCheck : IconCopy}
            onClick={handleCopy}
            className="py-3"
          >
            {copied ? 'Copiado' : 'Copiar'}
          </Button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-soft font-medium hover:bg-[#128C7E] transition-colors shadow-soft"
          >
            <IconWhatsapp className="w-5 h-5" />
            WhatsApp
          </button>
        </div>

        {/* QR Code Toggle */}
        <Button
          variant="ghost"
          icon={IconQrCode}
          onClick={() => setShowQR(!showQR)}
          fullWidth
          className="mt-3"
          size="sm"
        >
          {showQR ? 'Ocultar QR' : 'Mostrar QR'}
        </Button>

        {showQR && (
          <div className="mt-3 flex justify-center">
            <div className="p-4 bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border shadow-soft">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`}
                alt="QR Code"
                className="w-36 h-36"
              />
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-accent-piedra dark:text-dark-text-secondary text-center mt-4">
          Comparte este link con los participantes. Pueden unirse con Google o Microsoft.
        </p>
      </Card.Body>
    </Card>
  );
}

ShareLinkCard.propTypes = {
  joinCode: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
};
