// We carefully work with unsafe message data within this class, so we will use `any` typed variables and arguments
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuid } from './util/uuid';

interface LiveryMessage {
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
  error: string;
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
  private deferredMap: Map<string, Deferred>;

  private handshakeId: string;

  private handshakePromise: Promise<void>;

  private listenerMap: Map<string, (value: any) => void>;

  private targetWindow: Window;

  private targetWindowUrl: string;

  private version = '__VERSION__';

  constructor(targetWindow: Window, targetWindowUrl: string) {
    this.deferredMap = new Map<string, Deferred>();
    this.listenerMap = new Map<string, (value: any) => void>();

    this.targetWindow = targetWindow;
    this.targetWindowUrl = targetWindowUrl;

    // Start listening for messages
    window.addEventListener('message', (e) => {
      if (LiveryBridge.isLiveryMessage(e.data)) {
        this.handleLiveryMessage(e.data);
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

  private static isCommandMessage<ArgType>(
    object: LiveryMessage,
  ): object is CommandMessage<ArgType> {
    const command = object as CommandMessage<ArgType>;
    const isCommand = object.type === 'command' && !!command.name;

    if (isCommand) {
      LiveryBridge.propertyTypeCheck(command.name, 'name', 'Command', 'string');
    }
    return isCommand;
  }

  private static isEventMessage<ArgType>(
    object: LiveryMessage,
  ): object is EventMessage<ArgType> {
    return object.type === 'event' && !!(object as EventMessage<ArgType>).value;
  }

  private static isHandshakeMessage(
    object: LiveryMessage,
  ): object is HandshakeMessage {
    const handshake = object as HandshakeMessage;
    const isHandshake = object.type === 'handshake' && !!handshake.version;
    if (isHandshake) {
      LiveryBridge.propertyTypeCheck(
        handshake.version,
        'version',
        'Handshake',
        'string',
      );
    }
    return isHandshake;
  }

  private static isLiveryMessage(object: any): object is LiveryMessage {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access -- Incoming object is any. */
    const isLivery =
      !!object && object.isLivery === true && !!object.type && !!object.id;
    if (isLivery) {
      LiveryBridge.propertyTypeCheck(object.type, 'type', 'Livery', 'string');
      LiveryBridge.propertyTypeCheck(object.id, 'id', 'Livery', 'string');
    }

    return isLivery;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access -- Incoming object is any. */
  }

  private static isRejectMessage(
    object: LiveryMessage,
  ): object is RejectMessage {
    const reject = object as RejectMessage;
    const isReject = object.type === 'reject' && !!reject.error;

    if (isReject) {
      LiveryBridge.propertyTypeCheck(reject.error, 'error', 'Reject', 'string');
    }

    return isReject;
  }

  private static isResolveMessage<ValueType>(
    object: LiveryMessage,
  ): object is ResolveMessage<ValueType> {
    return (
      object.type === 'resolve' && !!(object as ResolveMessage<ValueType>).value
    );
  }

  private static propertyTypeCheck(
    property: unknown,
    propertyName: string,
    messageName = '',
    correctType: string,
  ) {
    if (typeof property !== correctType) {
      throw new Error(
        `Received ${messageName} message with ${propertyName} property type: ${typeof property}, should be ${correctType}`,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars -- Overridable method
  protected handleCommand<ArgType>(
    message: CommandMessage<ArgType>,
  ): Promise<unknown> {
    return Promise.reject(
      new Error(
        `Received command message with unsupported name: ${message.name}`,
      ),
    );
  }

  protected sendCommand<ValueType, ArgType>(
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
      .catch((error) => Promise.reject(error));
  }

  protected sendEvent<ValueType>(id: string, value: ValueType) {
    return this.handshakePromise.then(() => {
      this.sendMessage('event', {
        value,
        id,
      });
    });
  }

  protected sendReject(id: string, error: string) {
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

  protected sendSubscribe<ValueType, ArgType>(
    name: string,
    listener: (value: ValueType) => void,
    arg?: ArgType,
  ) {
    const id = uuid();
    this.listenerMap.set(id, listener);
    return this.sendCommand<string, ArgType>(name, id, arg);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars -- Overridable method
  private handleCommandMessage<ArgType>(message: CommandMessage<ArgType>) {
    this.handleCommand(message).then(
      (value) => {
        this.sendResolve(message.id, value);
      },
      (error: Error) => {
        this.sendReject(message.id, error.message);
      },
    );
  }

  private handleEventMessage<ArgType>(message: EventMessage<ArgType>) {
    const listener = this.listenerMap.get(message.id);
    if (listener) {
      listener(message.value);
    }
  }

  private handleHandshake(message: HandshakeMessage) {
    if (message.version !== this.version) {
      this.sendReject(message.id, 'Versions do not correspond.');
    } else if (message.id !== this.handshakeId) {
      // Other side was last to send handshake
      this.sendResolve(message.id, this.version);
      const deferred = this.deferredMap.get(this.handshakeId);
      if (deferred) {
        deferred.resolve(this.version);
        this.deferredMap.delete(this.handshakeId);
      }
      this.handshakeId = message.id;
    }
  }

  private handleLiveryMessage(message: LiveryMessage) {
    if (LiveryBridge.isHandshakeMessage(message)) {
      this.handleHandshake(message);
    } else if (LiveryBridge.isResolveMessage(message)) {
      this.handleResolveMessage(message);
    } else if (LiveryBridge.isRejectMessage(message)) {
      this.handleRejectMessage(message);
    } else if (LiveryBridge.isCommandMessage(message)) {
      this.handleCommandMessage(message);
    } else if (LiveryBridge.isEventMessage(message)) {
      this.handleEventMessage(message);
    } else {
      // should always be last
      this.sendReject(message.id || 'unknown', 'Unknown Message');
    }
  }

  private handleRejectMessage(message: RejectMessage) {
    const deferred = this.deferredMap.get(message.id);
    if (deferred) {
      deferred.reject(new Error(message.error));
      this.deferredMap.delete(message.id);
    }
  }

  private handleResolveMessage<ValueType>(message: ResolveMessage<ValueType>) {
    const deferred = this.deferredMap.get(message.id);
    if (deferred) {
      deferred.resolve(message.value);
      this.deferredMap.delete(message.id);
    }
  }

  private sendHandshake(id: string, version: string) {
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

  private sendMessage(type: string, properties: Record<string, unknown>) {
    const message = { isLivery: true, type, ...properties };

    if (LiveryBridge.isLiveryMessage(message)) {
      this.targetWindow.postMessage(message, this.targetWindowUrl);
    } else {
      throw new Error('Message is not a livery message.');
    }
  }
}
