import type { LiveryMessage } from "./LiveryBridge";
import { LiveryBridge } from "./LiveryBridge";

export interface Message {
  data: any;
  origin: string;
  source: any;
}

type TargetDescriptor = {
  origin: string;
  window: Window;
}

type MessageHandler = (event: LiveryMessage) => void

export class Transceiver {
  target?: LiveryBridge | TargetDescriptor

  private messageHandler?: MessageHandler

  constructor( target?: LiveryBridge | TargetDescriptor, ownBridge?: LiveryBridge, messageHandler?: MessageHandler ) {
    this.target = target;
    if (target instanceof LiveryBridge) {
      target.setTarget(ownBridge)
    }
    this.messageHandler = messageHandler
  }

  handleMessage(event: LiveryMessage) {
    // check the origin
    // extract the data
    if (this.messageHandler) {
      this.messageHandler(event);
    }
  }

  sendMessage(
    sourceId: string,
    type: string,
    id: string,
    properties: Record<string, unknown>,
  ) {
    if (!this.target) {
      throw new Error('target undefined');
    }

    const message: LiveryMessage = {
      isLivery: true,
      sourceId,
      type,
      id,
      ...properties,
    };

    if (this.target instanceof LiveryBridge) {
      this.target.transceiver.handleMessage(message);
    } else {
      this.target.window.postMessage(message, this.target.origin);
    }
  }
}
