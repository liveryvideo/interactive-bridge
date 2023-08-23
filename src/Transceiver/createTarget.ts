/* eslint-disable max-classes-per-file */
import type { Transceiver } from "./Transceiver";
import { Target } from "./Target";
import type { LiveryMessage } from "../LiveryBridgeTypes";

class TransceiverTarget extends Target {
  targetTransceiver: Transceiver;

  constructor(targetTransceiver: Transceiver) {
    super();
    this.targetTransceiver = targetTransceiver;
  }

  transmit(message: LiveryMessage) {
    this.targetTransceiver.receive(message);
  }
}

class WindowTarget extends Target {
  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetOrigin: string, targetWindow: Window) {
    super();
    this.targetOrigin = targetOrigin;
    this.targetWindow = targetWindow;
  }

  transmit(message: LiveryMessage) {
    this.targetWindow.postMessage(message, this.targetOrigin);
  }
}

export interface TargetOptions {
  targetOrigin?: string;
  targetTransceiver?: Transceiver;
  targetWindow?: Window;
  type: 'direct' | 'postmessage';
}

export function createTarget(options:TargetOptions): Target {
  switch (options.type) {
    case 'direct':
      if (!options.targetTransceiver) {
        throw new Error(`When type is 'direct', a targetTransceiver option must be provided`)
      }
      return new TransceiverTarget(options.targetTransceiver)
    case 'postmessage':
      if (!options.targetOrigin || !options.targetWindow) {
        throw new Error(`When type is 'postmessage', a targetOrigin and a targetWindow must be provided`)
      }
      return new WindowTarget(options.targetOrigin, options.targetWindow)
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid target type: ${options.type}`)
  }
}
