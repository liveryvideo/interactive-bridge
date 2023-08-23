import type { LiveryMessage } from '../LiveryBridgeTypes';
import { Port } from './Port';

export class TransceiverPort extends Port {
  private validOriginPattern: string = '';

  listen(originPattern: string) {
    this.validOriginPattern = originPattern;
  }

  receive(message: LiveryMessage, origin: string) {
    if (!this.isValidOrigin(origin)) {
      return;
    }
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
