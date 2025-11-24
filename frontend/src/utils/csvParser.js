/**
 * CSV Parser for importing participants
 * Supports format: UserNumber,Nombre,Email,Exclusiones
 */

export class CSVParser {
  /**
   * Parse CSV text into participants and restrictions
   * @param {string} csvText - Raw CSV content
   * @returns {Object} { participants, restrictions, errors }
   */
  static parse(csvText) {
    const errors = [];
    const participants = [];
    const restrictions = [];

    try {
      // Split into lines and remove empty lines
      const lines = csvText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        errors.push('El archivo CSV está vacío');
        return { participants, restrictions, errors };
      }

      // Check if first line is header
      const firstLine = lines[0];
      const hasHeader = firstLine.toLowerCase().includes('nombre') ||
                        firstLine.toLowerCase().includes('email');

      const dataLines = hasHeader ? lines.slice(1) : lines;

      if (dataLines.length === 0) {
        errors.push('No se encontraron datos en el CSV');
        return { participants, restrictions, errors };
      }

      // Parse each line
      dataLines.forEach((line, index) => {
        const lineNum = hasHeader ? index + 2 : index + 1;

        // Split by comma, handling quoted fields
        const fields = this.parseCSVLine(line);

        if (fields.length < 3) {
          errors.push(`Línea ${lineNum}: Faltan columnas (se esperan al menos 3: UserNumber, Nombre, Email)`);
          return;
        }

        const [userNumber, name, email, exclusions] = fields;

        // Validate fields
        if (!name || name.trim() === '') {
          errors.push(`Línea ${lineNum}: El nombre no puede estar vacío`);
          return;
        }

        if (!email || email.trim() === '') {
          errors.push(`Línea ${lineNum}: El email no puede estar vacío`);
          return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.push(`Línea ${lineNum}: Email inválido (${email})`);
          return;
        }

        // Create participant with temporary ID (will be replaced)
        const participantId = parseInt(userNumber) || (index + 1);
        participants.push({
          id: participantId,
          name: name.trim(),
          email: email.trim(),
          csvLineNumber: lineNum,
          originalUserNumber: userNumber
        });

        // Parse exclusions (can be comma-separated list)
        if (exclusions && exclusions.trim()) {
          const excludedNumbers = exclusions
            .split(',')
            .map(num => num.trim())
            .filter(num => num.length > 0)
            .map(num => parseInt(num))
            .filter(num => !isNaN(num));

          excludedNumbers.forEach(excludedNum => {
            restrictions.push({
              participant1UserNumber: parseInt(userNumber) || (index + 1),
              participant2UserNumber: excludedNum
            });
          });
        }
      });

      // Validate restrictions reference valid participants
      const validUserNumbers = participants.map(p => parseInt(p.originalUserNumber) || p.id);

      restrictions.forEach(restriction => {
        if (!validUserNumbers.includes(restriction.participant1UserNumber)) {
          errors.push(`Restricción inválida: Usuario ${restriction.participant1UserNumber} no existe`);
        }
        if (!validUserNumbers.includes(restriction.participant2UserNumber)) {
          errors.push(`Restricción inválida: Usuario ${restriction.participant2UserNumber} no existe`);
        }
      });

      // Map restrictions from user numbers to participant IDs
      const userNumberToId = new Map(
        participants.map(p => [parseInt(p.originalUserNumber) || p.id, p.id])
      );

      const mappedRestrictions = restrictions
        .filter(r =>
          userNumberToId.has(r.participant1UserNumber) &&
          userNumberToId.has(r.participant2UserNumber)
        )
        .flatMap(r => [
          {
            participant1Id: userNumberToId.get(r.participant1UserNumber),
            participant2Id: userNumberToId.get(r.participant2UserNumber)
          },
          // Add reverse restriction
          {
            participant1Id: userNumberToId.get(r.participant2UserNumber),
            participant2Id: userNumberToId.get(r.participant1UserNumber)
          }
        ]);

      return {
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email
        })),
        restrictions: mappedRestrictions,
        errors
      };

    } catch (error) {
      errors.push(`Error al procesar CSV: ${error.message}`);
      return { participants: [], restrictions: [], errors };
    }
  }

  /**
   * Parse a single CSV line, handling quoted fields
   * @param {string} line - CSV line
   * @returns {Array<string>} Parsed fields
   */
  static parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }

    fields.push(currentField);
    return fields.map(f => f.trim());
  }

  /**
   * Generate CSV template string
   * @returns {string} CSV template
   */
  static generateTemplate() {
    return `UserNumber,Nombre,Email,Exclusiones
1,Juan Pérez,juan@example.com,2
2,María García,maria@example.com,1
3,Carlos López,carlos@example.com,4
4,Ana Martínez,ana@example.com,3`;
  }

  /**
   * Validate CSV before parsing
   * @param {File} file - File object
   * @returns {Promise<Object>} { valid, error }
   */
  static async validateFile(file) {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return { valid: false, error: 'El archivo debe ser .csv' };
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return { valid: false, error: 'El archivo es demasiado grande (máx 1MB)' };
    }

    return { valid: true };
  }
}
