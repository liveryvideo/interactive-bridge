/* eslint-disable max-classes-per-file */
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
  get target() {
    return this._target;
  }

  protected messageHandler?: MessageHandler

  protected ownBridge?: LiveryBridge

  protected ownWindow: Window | undefined;

  private _target?: LiveryBridge | TargetDescriptor

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
    this._target = target
  }

  transmit(message : LiveryMessage) {
    if (!this.target) {
      throw new Error('target undefined');
    }
  }
}



export class PostMessageTransceiver extends Transceiver {
  constructor(ownWindow: Window) {
    super(undefined, ownWindow)
  }

  override setTarget( target?: LiveryBridge | TargetDescriptor ) {
    super.setTarget(target)
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

  override transmit(message:LiveryMessage) {
    super.transmit(message)
    this.target.window.postMessage(message, this.target.origin);

  }
}



export class DirectCallTransceiver extends Transceiver {
  override setTarget(target?: LiveryBridge | TargetDescriptor | undefined): void {
      super.setTarget(target)
      if (target instanceof LiveryBridge && target.transceiver.target !== this.ownBridge) {
        target.setTarget(this.ownBridge)
      }
  }

  override transmit(message:LiveryMessage) {
    super.transmit(message)
    this.target.transceiver.receive(message);
  }
}
