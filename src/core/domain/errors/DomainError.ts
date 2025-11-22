/**
 * UBICACIÓN: src/core/domain/errors/DomainError.ts
 * 
 * Errores personalizados del dominio
 */

/**
 * Error base del dominio
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Error de validación de entidad
 */
export class EntityValidationError extends DomainError {
  constructor(entityName: string, validationErrors: string[]) {
    super(`Validación fallida en ${entityName}: ${validationErrors.join(', ')}`);
    this.name = 'EntityValidationError';
    Object.setPrototypeOf(this, EntityValidationError.prototype);
  }
}

/**
 * Error de entidad no encontrada
 */
export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} con ID ${id} no encontrado`);
    this.name = 'EntityNotFoundError';
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}

/**
 * Error de negocio
 */
export class BusinessRuleError extends DomainError {
  constructor(rule: string, details?: string) {
    super(details ? `Regla de negocio violada: ${rule}. ${details}` : `Regla de negocio violada: ${rule}`);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

/**
 * Error de permisos
 */
export class UnauthorizedError extends DomainError {
  constructor(action: string) {
    super(`No autorizado para realizar la acción: ${action}`);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error de límite excedido
 */
export class LimitExceededError extends DomainError {
  constructor(limitType: string, limit: number, actual: number) {
    super(`Límite de ${limitType} excedido: ${actual}/${limit}`);
    this.name = 'LimitExceededError';
    Object.setPrototypeOf(this, LimitExceededError.prototype);
  }
}

/**
 * Error de estado inválido
 */
export class InvalidStateError extends DomainError {
  constructor(currentState: string, action: string) {
    super(`No se puede realizar ${action} en el estado actual: ${currentState}`);
    this.name = 'InvalidStateError';
    Object.setPrototypeOf(this, InvalidStateError.prototype);
  }
}