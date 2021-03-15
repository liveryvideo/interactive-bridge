// We carefully work with unsafe message data within this class, so we will use `any` typed variables and arguments
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isSemVerCompatible } from './util/semver';
import { uuid } from './util/uuid';

type TypeName = 'bigint' | 'boolean' | 'number' | 'string' | 'undefined';

type NamedType<T> = T extends 'bigint'
  ? bigint
  : T extends 'boolean'
  ? boolean
  : T extends 'number'
  ? number
  : T extends 'string'
  ? string
  : T extends 'undefined'
  ? undefined
  : never;

interface LiveryMessage extends Record<string, any> {
  id: string;
  isLivery: true;
  sourceId: string;
  type: string;
}

interface HandshakeMessage extends LiveryMessage {
  type: 'handshake';
  version: string;
}

interface ResolveMessage extends LiveryMessage {
  type: 'resolve';
  value: any;
}

interface RejectMessage extends LiveryMessage {
  error: string;
  type: 'reject';
}

interface CommandMessage extends LiveryMessage {
  arg: any;
  name: string;
  type: 'command';
}

interface CustomCommandMessage extends LiveryMessage {
  arg: any;
  name: string;
  type: 'customCommand';
}

interface EventMessage extends LiveryMessage {
  type: 'event';
  value: any;
}

const version = '__VERSION__';

export class LiveryBridge {
  private customCommandMap = new Map<string, (arg: unknown) => unknown>();

  private deferredMap = new Map<
    string,
    {
      reject: (error: Error) => void;
      resolve: (value: any) => void;
    }
  >();

  private handshakePromise: Promise<void>;

  private listenerMap = new Map<string, (value: any) => void>();

  private sourceId = uuid();

  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetWindow: Window, targetOrigin: string) {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;

    // Start listening for messages
    window.addEventListener('message', (event) => this.handleMessage(event));

    // Send handshake
    this.handshakePromise = new Promise<void>((resolve, reject) => {
      this.deferredMap.set(this.sourceId, { resolve, reject });
    });
    this.sendMessage('handshake', this.sourceId, { version });
  }

  public static validatePrimitive<T extends TypeName>(value: any, type: T) {
    if (typeof value !== type) {
      throw new Error(`Value type: ${typeof value}, should be: ${type}`);
    }
    return value as NamedType<T>;
  }

  private static assertMessagePropertyType(
    message: LiveryMessage,
    key: string,
    type: string,
  ) {
    const actualType = typeof message[key];
    if (actualType !== type) {
      throw new Error(
        `${message.type} message with ${key} property type: ${actualType}, should be ${type}`,
      );
    }
  }

  private static isCommandMessage(
    message: LiveryMessage,
  ): message is CommandMessage {
    if (message.type !== 'command') {
      return false;
    }
    LiveryBridge.assertMessagePropertyType(message, 'name', 'string');
    return true;
  }

  private static isCustomCommandMessage(
    message: LiveryMessage,
  ): message is CustomCommandMessage {
    if (message.type !== 'customCommand') {
      return false;
    }
    LiveryBridge.assertMessagePropertyType(message, 'name', 'string');
    return true;
  }

  private static isEventMessage(
    message: LiveryMessage,
  ): message is EventMessage {
    return message.type === 'event';
  }

  private static isHandshakeMessage(
    message: LiveryMessage,
  ): message is HandshakeMessage {
    if (message.type !== 'handshake') {
      return false;
    }
    LiveryBridge.assertMessagePropertyType(message, 'version', 'string');
    return true;
  }

  private static isLiveryMessage(object: any): object is LiveryMessage {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Incoming object is any */
    if (!object || object.isLivery !== true) {
      return false;
    }
    LiveryBridge.assertMessagePropertyType(object, 'id', 'string');
    LiveryBridge.assertMessagePropertyType(object, 'sourceId', 'string');
    LiveryBridge.assertMessagePropertyType(object, 'type', 'string');
    return true;
  }

  private static isRejectMessage(
    message: LiveryMessage,
  ): message is RejectMessage {
    if (message.type !== 'reject') {
      return false;
    }
    LiveryBridge.assertMessagePropertyType(message, 'error', 'string');
    return true;
  }

  private static isResolveMessage(
    message: LiveryMessage,
  ): message is ResolveMessage {
    return message.type === 'resolve';
  }

  public registerCustomCommand(
    name: string,
    handler: (arg: unknown) => unknown,
  ) {
    this.customCommandMap.set(name, handler);
  }

  public sendCustomCommand<T>({
    arg,
    listener,
    name,
    validate,
  }: {
    arg?: unknown;
    listener?: (value: T) => void;
    name: string;
    validate: (value: unknown) => T;
  }) {
    return this.sendCommand({
      arg,
      listener,
      name,
      type: 'customCommand',
      validate,
    });
  }

  public unregisterCustomCommand(name: string) {
    this.customCommandMap.delete(name);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // eslint-disable-next-line class-methods-use-this -- Overridable method
  protected handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ): unknown {
    throw new Error(`Unsupported command: ${name}`);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  protected sendCommand<T>({
    arg,
    listener,
    name,
    type = 'command',
    validate,
  }: {
    arg?: unknown;
    listener?: (value: T) => void;
    name: string;
    type?: 'command' | 'customCommand';
    validate: (value: unknown) => T;
  }) {
    return this.handshakePromise.then(() => {
      const id = uuid();

      const promise = new Promise<T>((resolve, reject) => {
        this.deferredMap.set(id, {
          resolve: (value) => {
            try {
              resolve(validate(value));
            } catch (error) {
              reject(error);
            }
          },
          reject,
        });
      });

      if (listener) {
        this.listenerMap.set(id, (value) => {
          listener(validate(value));
        });
      }

      this.sendMessage(type, id, { name, arg });

      return promise;
    });
  }

  private handleCommandMessage(message: CommandMessage) {
    new Promise((resolve) => {
      resolve(
        this.handleCommand(message.name, message.arg, (value: unknown) => {
          this.sendEvent(message.id, value);
        }),
      );
    }).then(
      (value) => {
        this.sendResolve(message.id, value);
      },
      (error: Error) => {
        this.sendReject(message.id, error.message);
      },
    );
  }

  private handleCustomCommandMessage(message: CustomCommandMessage) {
    new Promise((resolve, reject) => {
      const handler = this.customCommandMap.get(message.name);
      if (handler) {
        resolve(handler(message.arg));
      } else {
        reject(new Error(`Unregistered custom command: ${message.name}`));
      }
    }).then(
      (value) => {
        this.sendResolve(message.id, value);
      },
      (error: Error) => {
        this.sendReject(message.id, error.message);
      },
    );
  }

  private handleEventMessage(message: EventMessage) {
    const listener = this.listenerMap.get(message.id);
    if (listener) {
      listener(message.value);
    }
  }

  // Called when target bridge was last to be constructed or restarted
  private handleHandshake(message: HandshakeMessage) {
    // To support development version values ('__VERSION__') also check for non-semver equal version
    if (
      message.version !== version &&
      !isSemVerCompatible(message.version, version)
    ) {
      this.sendReject(
        message.id,
        `Remote version: ${message.version} is incompatible with: ${version}`,
      );
      return;
    }

    // Resolve our handshake promise if it wasn't already
    const deferred = this.deferredMap.get(this.sourceId);
    if (deferred) {
      deferred.resolve(version);
      this.deferredMap.delete(this.sourceId);
    }

    this.sendResolve(message.id, version);
  }

  private handleLiveryMessage(message: LiveryMessage) {
    if (message.sourceId === this.sourceId) {
      return;
    }

    if (LiveryBridge.isCommandMessage(message)) {
      this.handleCommandMessage(message);
    } else if (LiveryBridge.isCustomCommandMessage(message)) {
      this.handleCustomCommandMessage(message);
    } else if (LiveryBridge.isEventMessage(message)) {
      this.handleEventMessage(message);
    } else if (LiveryBridge.isHandshakeMessage(message)) {
      this.handleHandshake(message);
    } else if (LiveryBridge.isRejectMessage(message)) {
      this.handleRejectMessage(message);
    } else if (LiveryBridge.isResolveMessage(message)) {
      this.handleResolveMessage(message);
    } else {
      throw new Error(`Invalid message type: ${message.type}`);
    }
  }

  private handleMessage(event: MessageEvent) {
    if (
      event.source !== this.targetWindow ||
      (this.targetOrigin !== '*' && event.origin !== this.targetOrigin)
    ) {
      return;
    }

    if (LiveryBridge.isLiveryMessage(event.data)) {
      this.handleLiveryMessage(event.data);
    }
  }

  private handleRejectMessage(message: RejectMessage) {
    const deferred = this.deferredMap.get(message.id);
    if (deferred) {
      deferred.reject(new Error(message.error));
      this.deferredMap.delete(message.id);
    }
  }

  private handleResolveMessage(message: ResolveMessage) {
    const deferred = this.deferredMap.get(message.id);
    if (deferred) {
      deferred.resolve(message.value);
      this.deferredMap.delete(message.id);
    }
  }

  private sendEvent(id: string, value: unknown) {
    this.sendMessage('event', id, { value });
  }

  private sendMessage(
    type: string,
    id: string,
    properties: Record<string, unknown>,
  ) {
    const message = {
      isLivery: true,
      sourceId: this.sourceId,
      type,
      id,
      ...properties,
    };
    this.targetWindow.postMessage(message, this.targetOrigin);
  }

  private sendReject(id: string, error: string) {
    this.sendMessage('reject', id, { error });
  }

  private sendResolve(id: string, value: unknown) {
    this.sendMessage('resolve', id, { value });
  }
}
