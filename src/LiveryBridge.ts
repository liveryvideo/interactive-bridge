// We carefully work with unsafe message data within this class, so we will use `any` typed variables and arguments
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuid } from './uuid';

interface Message {
  [key: string]: unknown;
  type: string;
}

const VERSION = '__VERSION__';

function toError(shouldBeError: any) {
  return shouldBeError instanceof Error
    ? shouldBeError
    : new Error(shouldBeError);
}

export class LiveryBridge {
  private deferredMap = new Map<
    string,
    {
      reject: (error: Error) => void;
      resolve: (value: any) => void;
    }
  >();

  private handshakeId = uuid();

  private listenersMap = new Map<string, ((value: any) => void)[]>();

  private messageQueue?: Message[] = [];

  private nrHandshakes = 0;

  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetWindow: Window, targetOrigin: string) {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;

    window.addEventListener('message', (event) => this.handleMessage(event));

    this.sendHandshake();
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars -- overridable method
  protected handleCommand(name: string, arg: unknown): Promise<unknown> {
    return Promise.reject(
      new Error(`Received command message with unsupported name: ${name}`),
    );
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars -- overridable method
  protected handleSubscribe(name: string, arg: unknown): Promise<unknown> {
    return Promise.reject(
      new Error(`Received subscribe message with unsupported name: ${name}`),
    );
  }

  protected sendCommand<ValueType>(name: string, arg: unknown) {
    return new Promise<ValueType>((resolve, reject) => {
      const id = uuid();

      this.deferredMap.set(id, { resolve, reject });

      this.sendMessage({ type: 'command', id, name, arg });
    });
  }

  protected sendEvent<ValueType>(name: string, value: ValueType) {
    this.sendMessage({ type: 'event', name, value });
  }

  protected sendSubscribe<ArgType, ValueType>(
    name: string,
    arg: ArgType,
    listener: (value: ValueType) => void,
  ) {
    return new Promise<ValueType>((resolve, reject) => {
      const id = uuid();

      this.deferredMap.set(id, { resolve, reject });

      const listeners = this.listenersMap.get(name);
      if (listeners) {
        listeners.push(listener);
      } else {
        this.listenersMap.set(name, [listener]);
      }

      this.sendMessage({ type: 'subscribe', id, name, arg });
    });
  }

  private handleCommandMessage(id: string, data: any) {
    const { name, arg } = data;

    if (typeof name !== 'string') {
      throw new Error(
        `Received command message with name property type: ${typeof name}, should be string`,
      );
    }

    this.handleCommand(name, arg).then(
      (value) => {
        this.sendResolve(id, value);
      },
      (error) => {
        this.sendReject(id, toError(error));
      },
    );
  }

  private handleEventMessage(id: string, data: any) {
    const { name, value } = data;

    if (typeof name !== 'string') {
      throw new Error(
        `Received event message with name property type: ${typeof name}, should be string`,
      );
    }

    const listeners = this.listenersMap.get(name);

    if (!listeners) {
      throw new Error('Received event message with unsubscribed name');
    }

    for (const listener of listeners) {
      listener(value);
    }
  }

  private handleHandshakeMessage(id: string, data: any) {
    const { version } = data;

    if (typeof version !== 'string') {
      throw new Error(
        `Received handshake message with version property type: ${typeof version}, should be string`,
      );
    }

    if (version !== VERSION) {
      throw new Error(
        `Received handshake message with different version: ${version}, should be: ${VERSION}`,
      );
    }

    // Other side was last to send handshake
    if (id !== this.handshakeId) {
      this.handshakeId = id;
      if (this.nrHandshakes < 2) {
        this.nrHandshakes += 1;
        this.sendHandshake();
      }
    }

    // Handshake done, send queued messages and remove queue
    const messages = this.messageQueue;
    this.messageQueue = undefined;
    if (messages) {
      for (const message of messages) {
        this.sendMessage(message);
      }
    }
  }

  private handleLiveryMessage(type: string, id: string, data: unknown) {
    if (type === 'command') {
      this.handleCommandMessage(id, data);
    } else if (type === 'event') {
      this.handleEventMessage(id, data);
    } else if (type === 'handshake') {
      this.handleHandshakeMessage(id, data);
    } else if (type === 'reject') {
      this.handleRejectMessage(id, data);
    } else if (type === 'resolve') {
      this.handleResolveMessage(id, data);
    } else if (type === 'subscribe') {
      this.handleSubscribeMessage(id, data);
    } else {
      throw new Error(`Received message with unsupported type: ${type}`);
    }
  }

  private handleMessage(event: MessageEvent) {
    const { data, origin } = event;
    if ((this.targetOrigin !== '*' && origin !== this.targetOrigin) || !data) {
      return;
    }

    const { id, isLivery, type } = data;
    if (!isLivery) {
      return;
    }

    if (typeof type !== 'string') {
      throw new Error(
        `Received message with type property type: ${typeof type}, should be string`,
      );
    }

    if (typeof id !== 'string' && type !== 'event') {
      throw new Error(
        `Received message with id property type: ${typeof id}, should be string`,
      );
    }

    if (this.messageQueue && type !== 'handshake') {
      throw new Error(`Received ${type} message before handshake`);
    }

    this.handleLiveryMessage(type, id, data);
  }

  private handleRejectMessage(id: string, data: any) {
    const deferred = this.deferredMap.get(id);

    if (!deferred) {
      throw new Error(`Received reject message with unknown id: ${id}`);
    }

    const { error } = data;

    if (typeof error !== 'object') {
      throw new Error(
        `Received reject message with error property type: ${typeof error}, should be object`,
      );
    }
    if (!(error instanceof Error)) {
      throw new Error(
        'Received reject message with error property that is not an instance of Error',
      );
    }

    deferred.reject(error);

    this.deferredMap.delete(id);
  }

  private handleResolveMessage(id: string, data: any) {
    const deferred = this.deferredMap.get(id);

    if (!deferred) {
      throw new Error(`Received resolve message with unknown id: ${id}`);
    }

    const { value } = data;

    deferred.resolve(value);

    this.deferredMap.delete(id);
  }

  private handleSubscribeMessage(id: string, data: any) {
    const { name, arg } = data;

    if (typeof name !== 'string') {
      throw new Error(
        `Received subscribe message with name property type: ${typeof name}, should be string`,
      );
    }

    this.handleSubscribe(name, arg).then(
      (value) => {
        this.sendResolve(id, value);
      },
      (error) => {
        this.sendReject(id, toError(error));
      },
    );
  }

  private sendHandshake() {
    this.sendMessage(
      { type: 'handshake', id: this.handshakeId, version: VERSION },
      true,
    );
  }

  private sendMessage(message: Message, immediate = false) {
    if (!immediate && this.messageQueue) {
      this.messageQueue.push(message);
    } else {
      this.targetWindow.postMessage(
        { isLivery: true, ...message },
        this.targetOrigin,
      );
    }
  }

  private sendReject(id: string, error: Error) {
    this.sendMessage({ type: 'reject', id, error });
  }

  private sendResolve<ValueType>(id: string, value: ValueType) {
    this.sendMessage({ type: 'resolve', id, value });
  }
}
