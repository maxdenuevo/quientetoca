/**
 * Validates group data before submission
 * @param {Object} groupData - The group data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateGroup = (groupData) => {
  const errors = [];

  // Validate participants
  if (!groupData.participants || groupData.participants.length < 2) {
    errors.push('Minimum two participants required');
  }

  if (groupData.participants && groupData.participants.length > 20) {
    errors.push('Maximum 20 participants allowed');
  }

  // Validate participant data
  if (groupData.participants) {
    groupData.participants.forEach((participant, index) => {
      if (!participant.name?.trim()) {
        errors.push(`Participant ${index + 1} name is required`);
      }

      if (!participant.email?.trim()) {
        errors.push(`Participant ${index + 1} email is required`);
      } else if (!isValidEmail(participant.email)) {
        errors.push(`Participant ${index + 1} email is invalid`);
      }
    });

    // Check for duplicate emails
    const emails = groupData.participants.map(p => p.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      errors.push('Duplicate email addresses found');
    }
  }

  // Validate price range
  if (groupData.priceRange) {
    const { min, max, currency } = groupData.priceRange;

    if (!min || min < 0) {
      errors.push('Minimum price must be a positive number');
    }

    if (!max || max <= 0) {
      errors.push('Maximum price must be greater than zero');
    }

    if (Number(max) <= Number(min)) {
      errors.push('Maximum price must be greater than minimum price');
    }

    if (!currency) {
      errors.push('Currency is required');
    }
  } else {
    errors.push('Price range is required');
  }

  // Validate deadline
  if (!groupData.deadline) {
    errors.push('Event date is required');
  } else {
    const deadlineDate = new Date(groupData.deadline);
    const now = new Date();
    
    if (deadlineDate <= now) {
      errors.push('Event date must be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates participant restrictions
 * @param {Array} participants - Array of participant objects
 * @param {Array} restrictions - Array of restriction objects
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateRestrictions = (participants, restrictions) => {
  if (!restrictions || !Array.isArray(restrictions)) {
    return { isValid: false, error: 'Invalid restrictions format' };
  }

  const participantIds = participants.map(p => p.id);

  for (const restriction of restrictions) {
    // Check if both participants exist
    if (!participantIds.includes(restriction.participant1) || 
        !participantIds.includes(restriction.participant2)) {
      return { 
        isValid: false, 
        error: 'Restriction contains invalid participant ID' 
      };
    }

    // Check for self-restrictions
    if (restriction.participant1 === restriction.participant2) {
      return { 
        isValid: false, 
        error: 'Self-restrictions are not allowed' 
      };
    }
  }

  // Check if restrictions don't make matching impossible
  // This is a basic check, the actual matching algorithm will do a more thorough check
  for (const participantId of participantIds) {
    const restrictedWith = restrictions
      .filter(r => r.participant1 === participantId || r.participant2 === participantId)
      .map(r => r.participant1 === participantId ? r.participant2 : r.participant1);

    if (restrictedWith.length >= participants.length - 1) {
      return { 
        isValid: false, 
        error: 'Restrictions make matching impossible' 
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validates simplified group data (v2.1 flow)
 * @param {Object} groupData - The simplified group data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateGroupSimplified = (groupData) => {
  const errors = [];

  // Validate group name
  if (!groupData.name?.trim()) {
    errors.push('El nombre del grupo es requerido');
  }

  if (groupData.name && groupData.name.length > 100) {
    errors.push('El nombre no puede tener más de 100 caracteres');
  }

  // Validate event date
  if (!groupData.eventDate) {
    errors.push('La fecha del evento es requerida');
  }

  // Validate deadline
  if (!groupData.deadline) {
    errors.push('La fecha límite para unirse es requerida');
  }

  // Validate date relationships
  if (groupData.deadline && groupData.eventDate) {
    const deadlineDate = new Date(groupData.deadline);
    const eventDate = new Date(groupData.eventDate);
    const now = new Date();

    // Clear time components for date comparison
    now.setHours(0, 0, 0, 0);

    if (deadlineDate < now) {
      errors.push('La fecha límite debe ser hoy o en el futuro');
    }

    if (deadlineDate >= eventDate) {
      errors.push('La fecha límite debe ser antes del evento');
    }
  }

  // Validate budget range (if provided)
  if (groupData.budgetMin !== undefined && groupData.budgetMax !== undefined) {
    const min = Number(groupData.budgetMin);
    const max = Number(groupData.budgetMax);

    if (isNaN(min) || min < 0) {
      errors.push('El presupuesto mínimo debe ser un número positivo');
    }

    if (isNaN(max) || max <= 0) {
      errors.push('El presupuesto máximo debe ser mayor a cero');
    }

    if (max <= min) {
      errors.push('El presupuesto máximo debe ser mayor al mínimo');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};