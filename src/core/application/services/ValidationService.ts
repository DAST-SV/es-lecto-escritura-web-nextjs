/**
 * UBICACIÓN: src/core/application/services/ValidationService.ts
 * 
 * Servicio compartido de validaciones
 */

export class ValidationService {
  /**
   * Valida que un string no esté vacío
   */
  static isNotEmpty(value: string, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} no puede estar vacío`);
    }
  }

  /**
   * Valida que un array no esté vacío
   */
  static isNotEmptyArray<T>(value: T[], fieldName: string): void {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`${fieldName} debe tener al menos un elemento`);
    }
  }

  /**
   * Valida longitud de string
   */
  static validateLength(
    value: string, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): void {
    const length = value.length;

    if (min !== undefined && length < min) {
      throw new Error(`${fieldName} debe tener al menos ${min} caracteres`);
    }

    if (max !== undefined && length > max) {
      throw new Error(`${fieldName} no debe exceder ${max} caracteres`);
    }
  }

  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida número en rango
   */
  static isInRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName} debe estar entre ${min} y ${max}`);
    }
  }

  /**
   * Valida extensión de archivo
   */
  static isValidFileExtension(
    filename: string, 
    allowedExtensions: string[]
  ): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedExtensions.includes(ext) : false;
  }

  /**
   * Valida tamaño de archivo (en bytes)
   */
  static isValidFileSize(
    fileSize: number, 
    maxSizeInMB: number
  ): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  }

  /**
   * Sanitiza HTML básico
   */
  static sanitizeHTML(html: string): string {
    // Implementación básica - en producción usar una librería como DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  /**
   * Valida que un valor sea un número positivo
   */
  static isPositiveNumber(value: number, fieldName: string): void {
    if (value < 0) {
      throw new Error(`${fieldName} debe ser un número positivo`);
    }
  }

  /**
   * Valida que un ID sea válido
   */
  static isValidId(id: string | null | undefined, fieldName: string): void {
    if (!id || id.trim() === '') {
      throw new Error(`${fieldName} inválido`);
    }
  }

  /**
   * Valida formato de fecha
   */
  static isValidDate(date: Date | string, fieldName: string): void {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`${fieldName} tiene un formato de fecha inválido`);
    }
  }

  /**
   * Combina múltiples validaciones
   */
  static combine(validations: Array<() => void>): void {
    const errors: string[] = [];

    for (const validation of validations) {
      try {
        validation();
      } catch (error: any) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }
}