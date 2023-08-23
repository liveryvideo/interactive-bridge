/* eslint-disable max-classes-per-file */
import { Port } from "./Port";
import type { LiveryMessage } from "../LiveryBridgeTypes";
import { isLiveryMessage } from "../LiveryBridgeTypes";

class TransceiverPort extends Port {
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

class WindowPort extends Port {
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


