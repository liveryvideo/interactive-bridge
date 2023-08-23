/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { LiveryMessage } from "../LiveryBridgeTypes";
import { createPort } from "./createPort";
import { createTarget } from "./createTarget"
import type { PortOptions as ConcretePortOptions } from "./createPort";
import type { TargetOptions } from "./createTarget";
import type { Target } from "./Target";
import type { Port } from "./Port";

export type TargetDescriptor = {
  origin: string;
  window: Window;
}

export type TransceiverTargetSpec = TargetDescriptor | Transceiver

interface PortOptions extends ConcretePortOptions {
  originPattern: string;
}

type MessageHandler = (event: LiveryMessage) => void

export class Transceiver {

  protected messageHandler?: MessageHandler

  protected ownWindow: Window | undefined;

  protected port?: Port;

  protected target?: Target;


  constructor( ownWindow?: Window ) {
    this.ownWindow = ownWindow;
  }

  receive(message: LiveryMessage) {
    if (this.port) {
      this.port.receive(message, '')
    }
  }

  setMessageHandler(messageHandler: MessageHandler): void {
    this.port?.setMessageHandler(messageHandler);
  }

  setPort( options: PortOptions ) {
    this.port = createPort(options)
    if (this.messageHandler) {
      this.port.setMessageHandler(this.messageHandler.bind(this))
    }
    this.port.listen(options.originPattern)
  }

  setTarget( target?: TransceiverTargetSpec ) {
    // noop
  }

  setTargetWithOptions( options: TargetOptions ) {
    this.target = createTarget(options)
  }

  transmit(message : LiveryMessage) {
    if (!this.target) {
      throw new Error('target undefined');
    }
    this.target?.transmit(message)
  }
}
