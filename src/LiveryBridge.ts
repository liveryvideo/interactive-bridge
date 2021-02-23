/* eslint-disable @typescript-eslint/no-explicit-any --- MessageEvent returns an any object. The maps we use also use any, as multiple data types are allowed. */

import { uuid } from './livery-interactive/util/uuid';

export interface LiveryMessage {
  id?: string;
  isLivery: true;
  type: string;
}

export interface HandshakeMessage extends LiveryMessage {
  id: string;
  type: 'handshake';
  version: string;
}

export interface ResolveMessage<ValueType> extends LiveryMessage {
  id: string;
  type: 'resolve';
  value: ValueType;
}

export interface RejectMessage extends LiveryMessage {
  error: Error;
  id: string;
  type: 'reject';
}

export interface CommandMessage extends LiveryMessage {
  arg?: string;
  id: string;
  name: string;
  type: 'command';
}

export interface EventMessage<ValueType> extends LiveryMessage {
  id: string;
  type: 'event';
  value: ValueType;
}

export interface ResolveReject {
  reject: (error: Error) => void;
  resolve: (value: any) => void;
}

export class LiveryBridge {
  protected deferredMap: Map<string, ResolveReject>;

  protected handshakeComplete: boolean;

  protected handshakeId!: string;

  protected listenerMap: Map<string, (value: any) => void>;

  protected targetWindow: Window;

  protected targetWindowUrl: string;

  protected version: string;

  constructor(targetWindow: Window, targetWindowUrl: string, version: string) {
    this.deferredMap = new Map<string, ResolveReject>();
    this.listenerMap = new Map<string, (value: any) => void>();

    this.handshakeComplete = false;

    this.targetWindow = targetWindow;
    this.targetWindowUrl = targetWindowUrl;
    this.version = version;

    this.init();
  }

  static isCommandMessage(object: LiveryMessage): object is CommandMessage {
    const command = object as CommandMessage;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  public sendCommand<ValueType>(
    name: string,
    id?: string,
    arg?: string,
  ): Promise<ValueType> {
    const message: CommandMessage = {
      isLivery: true,
      type: 'command',
      name,
      id: id || uuid(),
      arg,
    };
    this.sendMessage(message);

    return new Promise<ValueType>((resolve, reject) => {
      this.deferredMap.set(message.id, {
        resolve: (value: ValueType) => {
          resolve(value);
        },
        reject: (error: Error) => {
          reject(error);
        },
      });
    });
  }

  public sendSubscribe<ValueType>(
    name: string,
    listener: (value: ValueType) => void,
    arg?: string,
  ) {
    const id = uuid();
    this.listenerMap.set(id, listener);
    return this.sendCommand<string>(name, id, arg);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected handleCommand(message: CommandMessage) {
    // TODO:implement
  }

  protected handleHandshake(message: HandshakeMessage) {
    if (message.version !== this.version) {
      this.sendReject(message.id, new Error('Versions do not correspond.'));
    } else {
      const resolveReject = this.deferredMap.get(this.handshakeId);
      if (resolveReject) {
        resolveReject.reject(new Error('Received new handshake.'));
      }
      this.sendResolve(message.id, this.version);
    }
    this.handshakeComplete = true;
  }

  protected handleMessage(message: LiveryMessage) {
    console.log('ℹ️[Livery-Interactive] Incoming Message:', message);
    if (LiveryBridge.isHandshakeMessage(message)) {
      this.handleHandshake(message);
      return;
    }
    if (LiveryBridge.isResolveMessage(message)) {
      const resolveReject = this.deferredMap.get(message.id);
      if (resolveReject) {
        resolveReject.resolve(message.value);
        this.deferredMap.delete(message.id);
      }
      return;
    }
    if (LiveryBridge.isRejectMessage(message)) {
      const resolveReject = this.deferredMap.get(message.id);
      if (resolveReject) {
        resolveReject.reject(message.error);
        this.deferredMap.delete(message.id);
      }
      return;
    }

    // Should we check this here?
    if (!this.handshakeComplete) {
      this.sendReject(
        message.id || 'unknown',
        new Error('Handshake not complete.'),
      );
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

  protected init() {
    // Start listening for messages
    window.addEventListener('message', (e) => {
      if (LiveryBridge.isLiveryMessage(e.data)) {
        this.handleMessage(e.data);
      }
    });

    // Attempt to handshake.
    this.handshakeId = uuid();
    this.sendHandshake(this.handshakeId, this.version)
      .then(() => {
        this.handshakeComplete = true;
      })
      .catch(() => {
        this.handshakeComplete = false;
      });
  }

  protected sendEvent<ValueType>(id: string, value: ValueType) {
    const messagse: EventMessage<ValueType> = {
      isLivery: true,
      type: 'event',
      value,
      id,
    };
    this.sendMessage(messagse);
  }

  protected sendHandshake(id: string, version: string) {
    const message: HandshakeMessage = {
      isLivery: true,
      type: 'handshake',
      id,
      version,
    };
    this.sendMessage(message);

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

  protected sendMessage(message: LiveryMessage) {
    console.log('ℹ️[Livery-Interactive] Outgoing Message:', message);
    this.targetWindow.postMessage(message, this.targetWindowUrl);
  }

  protected sendReject(id: string, error: Error) {
    const message: RejectMessage = {
      isLivery: true,
      type: 'reject',
      error,
      id,
    };

    this.sendMessage(message);
  }

  protected sendResolve<ValueType>(id: string, value: ValueType) {
    const messagse: ResolveMessage<ValueType> = {
      isLivery: true,
      type: 'resolve',
      value,
      id,
    };
    this.sendMessage(messagse);
  }
}
