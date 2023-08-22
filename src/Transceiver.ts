/* eslint-disable @typescript-eslint/no-use-before-define */
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
    // delegate to port

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
  private port?: Port;

  constructor(ownWindow: Window, validOriginPattern: string) {
    super(undefined, ownWindow)
    this.port = new WindowPort(ownWindow);
    if (this.messageHandler) {
      this.port.setMessageHandler(this.messageHandler.bind(this))
    }
    this.port.listen(validOriginPattern)
  }

  override receive(message: LiveryMessage) {
    if (this.port) {
      this.port.receive(message, '')
    }
  }

  override setMessageHandler(messageHandler: MessageHandler): void {
      this.port?.setMessageHandler(messageHandler);
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






abstract class Target {
  abstract transmit(message: LiveryMessage): void;
}

class TransceiverTarget extends Target {
  targetTransceiver: Transceiver;

  constructor(targetTransceiver: Transceiver) {
    super()
    this.targetTransceiver = targetTransceiver;
  }

  transmit(message: LiveryMessage) {
    this.targetTransceiver.receive(message)
  }
}

class WindowTarget extends Target {
  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetOrigin: string, targetWindow: Window) {
    super()
    this.targetOrigin = targetOrigin;
    this.targetWindow = targetWindow;
  }

  transmit(message: LiveryMessage) {
    this.targetWindow.postMessage(message, this.targetOrigin);
  }
}





abstract class Port {
  protected messageHandler: (message: LiveryMessage) => void = ()=>{}

  abstract listen( originPattern: string ): void;

  abstract receive( message: LiveryMessage , origin: string ): void;

  abstract setMessageHandler(messageHandler: (message: LiveryMessage) => void): void;
}

class TransceiverPort extends Port {
  private validOriginPattern: string = '';

  listen( originPattern: string ){
    this.validOriginPattern = originPattern;
  }

  receive( message: LiveryMessage, origin: string ) {
    if (!this.isValidOrigin(origin)) { return; }
    this.messageHandler(message)
  }

  setMessageHandler(messageHandler: (message: LiveryMessage) => void) {
    this.messageHandler = messageHandler;
  }

  private isValidOrigin( origin: string ) {
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
    super()
    this.ownWindow = ownWindow
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

      if (LiveryBridge.isLiveryMessage(event.data) && this.messageHandler) {
        this.messageHandler(event.data)
      }
    })
  }

  receive(_message: LiveryMessage, _origin: string): void {
    // eslint-disable-next-line no-useless-return
    return;
  }

  setMessageHandler(messageHandler: (message: LiveryMessage) => void): void {
    this.messageHandler = messageHandler;
  }

  private isValidOrigin( origin: string ) {
    if (this.validOriginPattern === '*') {
      return true;
    }
    if (this.validOriginPattern === origin) {
      return true;
    }
    return false;
  }

  private isValidSourceWindow( sourceWindow: unknown ) {
    if (!this.validSourceWindow) {
      return true;
    }
    if (sourceWindow === this.validSourceWindow) {
      return true;
    }
    return false;
  }
}
