export class RepositoryError extends Error {
  constructor(operation: string, entity: string, originalError: any) {
    super(`Failed to ${operation} ${entity}: ${originalError.message}`);
    this.name = 'RepositoryError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RepositoryError);
    }
  }
}
