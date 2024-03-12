import { isSemVerCompatible } from './util/semver';
import { uuid } from './util/uuid';

interface LiveryMessage extends Record<string, unknown> {
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
  value: unknown;
}

interface RejectMessage extends LiveryMessage {
  error: string;
  type: 'reject';
}

interface CommandMessage extends LiveryMessage {
  arg: unknown;
  name: string;
  type: 'command';
}

interface CustomCommandMessage extends LiveryMessage {
  arg: unknown;
  name: string;
  type: 'customCommand';
}

interface EventMessage extends LiveryMessage {
  type: 'event';
  value: unknown;
}

type Spy = (message: LiveryMessage) => void;

const version = __VERSION__;

// eslint-disable-next-line @typescript-eslint/ban-types -- used to narrow down unknown object ({}) type
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return Object.hasOwnProperty.call(obj, prop);
}

/**
 * Returns true if specified target is a LiveryBridge instance.
 *
 * This package can be loaded multiple times so unfortunately we can't simply use `instanceof LiveryBridge`.
 */
function isLiveryBridge(
  target: undefined | LiveryBridge | { origin: string; window: Window },
): target is LiveryBridge {
  if (!target) {
    return false;
  }
  const { constructor } = target;
  return 'isLiveryBridge' in constructor && constructor.isLiveryBridge === true;
}

/**
 * Base Livery bridge class, to be extended by {@link InteractiveBridge} and {@link AbstractPlayerBridge}.
 */
export class LiveryBridge {
  static readonly isLiveryBridge = true;

  private customCommandMap = new Map<
    string,
    (arg: unknown, listener: (value: unknown) => void) => unknown
  >();

  private deferredMap = new Map<
    string,
    {
      reject: (error: Error) => void;
      resolve: (value: unknown) => void;
    }
  >();

  private handshakePromise: Promise<unknown>;

  private listenerMap = new Map<string, (value: unknown) => void>();

  private sourceId = uuid();

  private spies: Spy[] = [];

  private target:
    | undefined
    | LiveryBridge
    | {
        origin: string;
        window: Window;
      };

  /**
   * Constructs a LiveryBridge.
   *
   * Target can be either undefined, a LiveryBridge instance or a window and origin.
   * If undefined this waits for the other bridge to be passed this instance
   * and for that in turn to pass it's reference here.
   *
   * @param target - LiveryBridge target
   */
  constructor(target?: LiveryBridge['target']) {
    this.target = target;

    this.handshakePromise = new Promise<unknown>((resolve, reject) => {
      this.deferredMap.set(this.sourceId, { resolve, reject });
    });

    if (target) {
      if (isLiveryBridge(target)) {
        target.target = this;
      } else {
        window.addEventListener('message', (event) =>
          this.handleMessage(event),
        );
      }

      this.sendMessage('handshake', this.sourceId, { version });
    }
  }

  private static assertMessagePropertyType(
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

  private static isLiveryMessage(object: unknown): object is LiveryMessage {
    if (
      typeof object !== 'object' ||
      object === null ||
      !hasOwnProperty(object, 'isLivery') ||
      object.isLivery !== true
    ) {
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

  /**
   * Spy on LiveryMessages handled by this bridge.
   *
   * @internal
   * @param callback - Callback to call with message
   * @returns Method to remove callback from spies
   */
  spy(callback: Spy) {
    this.spies.push(callback);
    return () => {
      this.spies = this.spies.filter((candidate) => candidate !== callback);
    };
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

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   */
  protected registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    this.customCommandMap.set(name, handler);
  }

  protected sendCommand(
    name: string,
    arg?: unknown,
    listener?: (value: unknown) => void,
    custom = false,
  ) {
    return this.handshakePromise.then(() => {
      const id = uuid();

      const promise = new Promise<unknown>((resolve, reject) => {
        this.deferredMap.set(id, { resolve, reject });
      });

      if (listener) {
        this.listenerMap.set(id, listener);
      }

      this.sendMessage(custom ? 'customCommand' : 'command', id, { name, arg });

      return promise;
    });
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   */
  protected sendCustomCommand(
    name: string,
    arg?: unknown,
    listener?: (value: unknown) => void,
  ) {
    return this.sendCommand(name, arg, listener, true);
  }

  /**
   * Unregister custom command by name.
   */
  protected unregisterCustomCommand(name: string) {
    this.customCommandMap.delete(name);
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
        resolve(
          handler(message.arg, (value: unknown) => {
            this.sendEvent(message.id, value);
          }),
        );
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
    if (!isSemVerCompatible(message.version, version)) {
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

    for (const spy of this.spies) {
      try {
        spy(message);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('LiveryBridge spy callback threw error', error);
      }
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
    if (!this.target || isLiveryBridge(this.target)) {
      throw new Error('Use handleMessage only when target is a window');
    }

    const { origin, window } = this.target;
    if (
      event.source !== window ||
      (origin !== '*' && event.origin !== origin)
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
    if (!this.target) {
      throw new Error('target undefined');
    }

    const message: LiveryMessage = {
      isLivery: true,
      sourceId: this.sourceId,
      type,
      id,
      ...properties,
    };

    if (isLiveryBridge(this.target)) {
      this.target.handleLiveryMessage(message);
    } else {
      this.target.window.postMessage(message, this.target.origin);
    }
  }

  private sendReject(id: string, error: string) {
    this.sendMessage('reject', id, { error });
  }

  private sendResolve(id: string, value: unknown) {
    this.sendMessage('resolve', id, { value });
  }
}
