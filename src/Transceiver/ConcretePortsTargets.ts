/* eslint-disable max-classes-per-file */
import type { Transceiver } from "./Transceiver";
import { Port } from "./Port";
import { Target } from "./Target";
import type { LiveryMessage } from "../LiveryBridgeTypes";
import { isLiveryMessage } from "../LiveryBridgeTypes";

export class TransceiverTarget extends Target {
  targetTransceiver: Transceiver;

  constructor(targetTransceiver: Transceiver) {
    super();
    this.targetTransceiver = targetTransceiver;
  }

  transmit(message: LiveryMessage) {
    this.targetTransceiver.receive(message);
  }
}

export class WindowTarget extends Target {
  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetOrigin: string, targetWindow: Window) {
    super();
    this.targetOrigin = targetOrigin;
    this.targetWindow = targetWindow;
  }

  transmit(message: LiveryMessage) {
    this.targetWindow.postMessage(message, this.targetOrigin);
  }
}

export interface TargetOptions {
  targetOrigin?: string;
  targetTransceiver?: Transceiver;
  targetWindow?: Window;
  type: 'direct' | 'postmessage';
}

export function createTarget(options:TargetOptions): Target {
  switch (options.type) {
    case 'direct':
      if (!options.targetTransceiver) {
        throw new Error(`When type is 'direct', a targetTransceiver option must be provided`)
      }
      return new TransceiverTarget(options.targetTransceiver)
    case 'postmessage':
      if (!options.targetOrigin || !options.targetWindow) {
        throw new Error(`When type is 'postmessage', a targetOrigin and a targetWindow must be provided`)
      }
      return new WindowTarget(options.targetOrigin, options.targetWindow)
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid target type: ${options.type}`)
  }
}




export class TransceiverPort extends Port {
  private validOriginPattern: string = '';

  listen(originPattern: string) {
    this.validOriginPattern = originPattern;
  }

  receive(message: LiveryMessage, origin: string) {
    if (!this.isValidOrigin(origin)) { return; }
    this.messageHandler(message);
  }

  setMessageHandler(messageHandler: (message: LiveryMessage) => void) {
    this.messageHandler = messageHandler;
  }

  private isValidOrigin(origin: string) {
    if (this.validOriginPattern === '') {
      return false;
    }
    if (this.validOriginPattern === '*') {
      return true;
    }
    if (this.validOriginPattern === origin) {
      return true;
    }
    return false;
  }
}

export class WindowPort extends Port {
  private ownWindow: Window;

  private validOriginPattern: string = '';

  private validSourceWindow?: Window;

  constructor(ownWindow: Window, sourceWindow?: Window) {
    super();
    this.ownWindow = ownWindow;
    this.validSourceWindow = sourceWindow;
  }

  listen(originPattern: string): void {
    this.validOriginPattern = originPattern;
    this.ownWindow.addEventListener('message', (event) => {
      if (!this.isValidSourceWindow(event.source)) {
        return;
      }
      if (!this.isValidOrigin(event.origin)) {
        return;
      }
      if (isLiveryMessage(event.data) && this.messageHandler) {
        this.messageHandler(event.data);
      }
    });
  }

  receive(_message: LiveryMessage, _origin: string): void {
    // eslint-disable-next-line no-useless-return
    return;
  }

  setMessageHandler(messageHandler: (message: LiveryMessage) => void): void {
    this.messageHandler = messageHandler;
  }

  private isValidOrigin(origin: string) {
    if (this.validOriginPattern === '*') {
      return true;
    }
    if (this.validOriginPattern === origin) {
      return true;
    }
    return false;
  }

  private isValidSourceWindow(sourceWindow: unknown) {
    if (!this.validSourceWindow) {
      return true;
    }
    if (sourceWindow === this.validSourceWindow) {
      return true;
    }
    return false;
  }
}

export interface PortOptions {
  ownWindow?: Window;
  sourceWindow?: Window;
  type: 'direct' | 'postmessage';
}

export function createPort(options: PortOptions): Port {
  switch (options.type) {
    case 'direct':
      return new TransceiverPort()
    case 'postmessage':
      if (!options.ownWindow) {
        throw new Error(`When type is 'postmessage', an ownWindow option must be provided`)
      }
      return new WindowPort(options.ownWindow, options.sourceWindow)
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid port type: ${options.type}`)
  }
}


