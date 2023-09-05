/* eslint-disable max-classes-per-file */
export class InvalidTypeError extends Error {
  details: unknown;

  override name = 'InvalidTypeError';

  constructor(value: unknown, message?: string) {
    super(message);
    this.details = value;
  }
}

export class SubscriptionError extends Error {
  override name = 'SubscriptionError';
}
