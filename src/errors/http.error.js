import BaseError from './base.error.js';

export class NotFoundError extends BaseError {
  constructor(message = 'Resource not found', code = 'COMMON_RESOURCE_NOT_FOUND') {
    super(message, 404, code);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = 'Invalid input', code = 'COMMON_INVALID_INPUT') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized', code = 'COMMON_UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden', code = 'COMMON_FORBIDDEN_ACCESS') {
    super(message, 403, code);
  }
}

export class ConflictError extends BaseError {
  constructor(message = 'Conflict', code = 'COMMON_CONFLICT') {
    super(message, 409, code);
  }
} 