import { hasOwnProperty } from './util/hasOwnProperty';

export interface LiveryMessage extends Record<string, any> {
  id: string;
  isLivery: true;
  sourceId: string;
  type: string;
}

export function assertMessagePropertyType(
  // eslint-disable-next-line @typescript-eslint/ban-types -- used to narrow down unknown object ({}) type
  message: {},
  key: string,
  type: string,
) {
  const messageType =
    hasOwnProperty(message, 'type') && typeof message.type === 'string'
      ? message.type
      : '';
  if (!hasOwnProperty(message, key)) {
    throw new Error(`${messageType} message does not have property: ${key}`);
  }
  const actualType = typeof message[key];
  if (actualType !== type) {
    throw new Error(
      `${messageType} message with ${key} property type: ${actualType}, should be: ${type}`,
    );
  }
}

export function isLiveryMessage(object: unknown): object is LiveryMessage {
  if (
    typeof object !== 'object' ||
    object === null ||
    !hasOwnProperty(object, 'isLivery') ||
    object.isLivery !== true
  ) {
    return false;
  }
  assertMessagePropertyType(object, 'id', 'string');
  assertMessagePropertyType(object, 'sourceId', 'string');
  assertMessagePropertyType(object, 'type', 'string');
  return true;
}
