/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-classes-per-file */
import type { LiveryMessage } from "./LiveryBridge";
import { LiveryBridge } from "./LiveryBridge";


type TargetDescriptor = {
  origin: string;
  window: Window;
}

type TransceiverTargetSpec = TargetDescriptor | Transceiver

type MessageHandler = (event: LiveryMessage) => void

export class Transceiver {
  get targetSpec() {
    return this._targetSpec;
  }

  protected messageHandler?: MessageHandler

  protected ownWindow: Window | undefined;

  protected port?: Port;

  protected target?: Target;

  private _targetSpec?: TransceiverTargetSpec

  constructor( ownBridge?: LiveryBridge, ownWindow?: Window ) {
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

  setTarget( target?: TransceiverTargetSpec ) {
    this._targetSpec = target
  }

  transmit(message : LiveryMessage) {
    if (!this.targetSpec) {
      throw new Error('target undefined');
    }
    this.target?.transmit(message)
  }
}



export class PostMessageTransceiver extends Transceiver {
  constructor(ownWindow: Window, validOriginPattern: string) {
    super(undefined, ownWindow)
    this.port = new WindowPort(ownWindow);
    if (this.messageHandler) {
      this.port.setMessageHandler(this.messageHandler.bind(this))
    }
    this.port.listen(validOriginPattern)
  }

  override setTarget( target?: TransceiverTargetSpec ) {
    super.setTarget(target)
    if (target && target.window && target.origin && this.ownWindow) {
      this.target = new WindowTarget(target.origin, target.window)
    }
  }
}




export class DirectCallTransceiver extends Transceiver {
  constructor() {
    super()
    this.port = new TransceiverPort()
    if (this.messageHandler) {
      this.port.setMessageHandler(this.messageHandler.bind(this))
    }
    this.port.listen('*')
  }

  override setTarget(target?: TransceiverTargetSpec): void {
      super.setTarget(target)
      if (target instanceof Transceiver) {
        this.target = new TransceiverTarget(target)
        if (target.targetSpec !== this) {
          target.setTarget(this)
        }
      }
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
