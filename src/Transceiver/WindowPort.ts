import type { LiveryMessage } from '../LiveryBridgeTypes';
import { isLiveryMessage } from '../LiveryBridgeTypes';
import { Port } from './Port';

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
      if (isLiveryMessage(event.data)) {
        this.messageHandler(event.data);
      }
    });
  }

  receive(): void {}

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
