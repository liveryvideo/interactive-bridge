import type { LiveryMessage } from '../LiveryBridgeTypes';
import type { Port } from './Port';
import type { Target } from './Target';
import type { PortOptions as ConcretePortOptions } from './createPort';
import { createPort } from './createPort';
import type { TargetOptions } from './createTarget';
import { createTarget } from './createTarget';

export type TargetDescriptor = {
  origin: string;
  window: Window;
};

export type TransceiverTargetSpec = TargetDescriptor | Transceiver;

interface PortOptions extends ConcretePortOptions {
  originPattern: string;
}

type MessageHandler = (event: LiveryMessage) => void;

export class Transceiver {
  protected messageHandler?: MessageHandler;

  protected ownWindow: Window | undefined;

  protected port?: Port;

  protected target?: Target;

  constructor(ownWindow?: Window) {
    this.ownWindow = ownWindow;
  }

  receive(message: LiveryMessage) {
    if (this.port) {
      this.port.receive(message, '');
    }
  }

  setMessageHandler(messageHandler: MessageHandler): void {
    this.messageHandler = messageHandler;
    this.port?.setMessageHandler(messageHandler);
  }

  setPort(options: PortOptions) {
    this.port = createPort(options);
    if (this.messageHandler) {
      this.port.setMessageHandler(this.messageHandler);
    }
    this.port.listen(options.originPattern);
  }

  setTarget(options: TargetOptions) {
    this.target = createTarget(options);
  }

  transmit(message: LiveryMessage) {
    if (!this.target) {
      throw new Error('target undefined');
    }
    this.target.transmit(message);
  }
}
