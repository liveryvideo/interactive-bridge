/* eslint-disable max-classes-per-file */
import {
  TransceiverPort,
  WindowPort,
  WindowTarget,
  TransceiverTarget,
 } from "./ConcretePortsTargets";
import type { TransceiverTargetSpec } from "./Transceiver";
import { Transceiver } from "./Transceiver";


export class PostMessageTransceiver extends Transceiver {
  constructor(ownWindow: Window, validOriginPattern: string) {
    super(ownWindow)
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
