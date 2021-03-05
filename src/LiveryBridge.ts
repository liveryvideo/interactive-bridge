/* eslint-disable @typescript-eslint/no-explicit-any --- MessageEvent returns an any object. The maps we use also use any, as multiple data types are allowed. */

import { uuid } from './livery-interactive/util/uuid';

export interface LiveryMessage {
  id: string;
  isLivery: true;
  type: string;
}

interface HandshakeMessage extends LiveryMessage {
  id: string;
  type: 'handshake';
  version: string;
}

interface ResolveMessage<ValueType> extends LiveryMessage {
  id: string;
  type: 'resolve';
  value: ValueType;
}

interface RejectMessage extends LiveryMessage {
  error: Error;
  id: string;
  type: 'reject';
}

interface CommandMessage<ArgType> extends LiveryMessage {
  arg?: ArgType;
  id: string;
  name: string;
  type: 'command';
}

interface EventMessage<ValueType> extends LiveryMessage {
  id: string;
  type: 'event';
  value: ValueType;
}

interface Deferred {
  reject: (error: Error) => void;
  resolve: (value: any) => void;
}

export class LiveryBridge {
  protected deferredMap: Map<string, Deferred>;

  protected handshakeId: string;

  protected handshakePromise: Promise<void>;

  protected listenerMap: Map<string, (value: any) => void>;

  protected messageListener?: (message: string) => void;

  protected targetWindow: Window;

  protected targetWindowUrl: string;

  protected version: string;

  constructor(
    targetWindow: Window,
    targetWindowUrl: string,
    version: string,
    messageListener?: (message: string) => void,
  ) {
    this.deferredMap = new Map<string, Deferred>();
    this.listenerMap = new Map<string, (value: any) => void>();

    this.targetWindow = targetWindow;
    this.targetWindowUrl = targetWindowUrl;
    this.version = version;

    this.messageListener = messageListener;

    // Start listening for messages
    window.addEventListener('message', (e) => {
      if (LiveryBridge.isLiveryMessage(e.data)) {
        this.handleMessage(e.data);
      }
    });

    // Attempt to handshake.
    this.handshakeId = uuid();
    this.handshakePromise = this.sendHandshake(
      this.handshakeId,
      this.version,
    ).catch((error: Error) => {
      throw error;
    });
  }

  static isCommandMessage<ArgType>(
    object: LiveryMessage,
  ): object is CommandMessage<ArgType> {
    const command = object as CommandMessage<ArgType>;
    return object.type === 'command' && !!object.id && !!command.name;
  }

  static isEventMessage(
    object: LiveryMessage,
  ): object is EventMessage<unknown> {
    const event = object as EventMessage<unknown>;
    return object.type === 'event' && !!event.id && !!event.value;
  }

  static isHandshakeMessage(object: LiveryMessage): object is HandshakeMessage {
    return (
      object.type === 'handshake' &&
      !!(object as HandshakeMessage).version &&
      !!object.id
    );
  }

  static isLiveryMessage(object: any): object is LiveryMessage {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Incoming object is any.
    return !!object && object.isLivery === true && !!object.type;
  }

  static isRejectMessage(object: LiveryMessage): object is RejectMessage {
    return (
      object.type === 'reject' &&
      !!object.id &&
      !!(object as RejectMessage).error
    );
  }

  static isResolveMessage<ValueType>(
    object: LiveryMessage,
  ): object is ResolveMessage<ValueType> {
    return (
      object.type === 'resolve' &&
      !!object.id &&
      !!(object as ResolveMessage<ValueType>).value
    );
  }

  public sendCommand<ValueType, ArgType>(
    name: string,
    id = uuid(),
    arg?: ArgType,
  ): Promise<ValueType> {
    return this.handshakePromise
      .then(() => {
        this.sendMessage('command', {
          isLivery: true,
          type: 'command',
          name,
          id,
          arg,
        });

        return new Promise<ValueType>((resolve, reject) => {
          this.deferredMap.set(id, { resolve, reject });
        });
      })
      .catch(() => Promise.reject(new Error('Handshake not complete.')));
  }

  public sendSubscribe<ValueType, ArgType>(
    name: string,
    listener: (value: ValueType) => void,
    arg?: ArgType,
  ) {
    const id = uuid();
    this.listenerMap.set(id, listener);
    return this.sendCommand<string, ArgType>(name, id, arg);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars -- Not implemented here.
  protected handleCommand<ArgType>(message: CommandMessage<ArgType>) {
    // Should be implemented in child class.
  }

  protected handleHandshake(message: HandshakeMessage) {
    if (message.version !== this.version) {
      this.sendReject(message.id, new Error('Versions do not correspond.'));
    } else {
      const deferred = this.deferredMap.get(this.handshakeId);
      if (deferred) {
        deferred.reject(new Error('Received new handshake.'));
      }
      this.sendResolve(message.id, this.version);
    }
  }

  protected handleMessage(message: LiveryMessage) {
    if (this.messageListener) {
      this.messageListener(
        `Incoming Message:${JSON.stringify(message, null, 1)} \n\n`,
      );
    }
    if (LiveryBridge.isHandshakeMessage(message)) {
      this.handleHandshake(message);
      return;
    }
    if (LiveryBridge.isResolveMessage(message)) {
      const deferred = this.deferredMap.get(message.id);
      if (deferred) {
        deferred.resolve(message.value);
        this.deferredMap.delete(message.id);
      }
      return;
    }
    if (LiveryBridge.isRejectMessage(message)) {
      const deferred = this.deferredMap.get(message.id);
      if (deferred) {
        deferred.reject(message.error);
        this.deferredMap.delete(message.id);
      }
      return;
    }

    if (LiveryBridge.isCommandMessage(message)) {
      this.handleCommand(message);
    }

    if (LiveryBridge.isEventMessage(message)) {
      const listener = this.listenerMap.get(message.id);
      if (listener) {
        listener(message.value);
      }
      return;
    }

    // should always be last
    this.sendReject(message.id || 'unknown', new Error('Unknown Command'));
  }

  protected sendEvent<ValueType>(id: string, value: ValueType) {
    return this.handshakePromise.then(() => {
      this.sendMessage('event', {
        value,
        id,
      });
    });
  }

  protected sendHandshake(id: string, version: string) {
    this.sendMessage('handshake', {
      type: 'handshake',
      id,
      version,
    });

    return new Promise<void>((resolve, reject) => {
      this.deferredMap.set(id, {
        resolve: () => {
          resolve();
        },
        reject: (error: Error) => {
          reject(error);
        },
      });
    });
  }

  protected sendMessage(type: string, properties: Record<string, unknown>) {
    const message = { isLivery: true, type, ...properties };

    if (LiveryBridge.isLiveryMessage(message)) {
      if (this.messageListener) {
        this.messageListener(
          `Outgoing Message:${JSON.stringify(message, null, 1)} \n\n`,
        );
      }
      this.targetWindow.postMessage(message, this.targetWindowUrl);
    } else {
      throw new Error('Message is not a livery message.');
    }
  }

  protected sendReject(id: string, error: Error) {
    this.sendMessage('reject', {
      error,
      id,
    });
  }

  protected sendResolve<ValueType>(id: string, value: ValueType) {
    this.sendMessage('resolve', {
      value,
      id,
    });
  }
}
