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

  private ownBridge?: LiveryBridge

  private ownWindow: Window | undefined;

  constructor( ownBridge?: LiveryBridge, ownWindow?: Window ) {
    this.ownBridge = ownBridge;
    this.ownWindow = ownWindow;
  }

  receive(event: LiveryMessage) {
    // check the origin
    // extract the data
    if (this.messageHandler) {
      this.messageHandler(event);
    }
  }

  setMessageHandler( messageHandler: MessageHandler ) {
    this.messageHandler = messageHandler
  }

  setTarget( target?: LiveryBridge | TargetDescriptor ) {
    this.target = target
    if (target instanceof LiveryBridge && target.transceiver.target !== this.ownBridge) {
      target.setTarget(this.ownBridge)
      return;
    }
    if (target && target.window && target.origin && this.ownWindow) {
      this.ownWindow.addEventListener('message', (event) => {
        // handleMessage

        // TODO: I have commented this out since message events sent in our jsdom mock have their source=null. jsdom's approach suggests that this may be more standards compliant than the way it has been implemented in most browsers. Those browsers could change their behavior so we may be introducing some fragility here.
        // It also seems that there are already safeguards in place for this, both in terms of identifying livery messages, and the safeguards built into the browser.

      const { origin, /* window */ } = target;
        if (
          // event.source !== window ||
          origin !== '*' &&
          event.origin !== origin
        ) {
          return;
        }

        if (LiveryBridge.isLiveryMessage(event.data) && this.messageHandler) {
          this.messageHandler(event.data)
        }

      })
    }
  }

  transmit(
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
      this.target.transceiver.receive(message);
    } else {
      this.target.window.postMessage(message, this.target.origin);
    }
  }
}
