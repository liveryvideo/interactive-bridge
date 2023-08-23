import type { LiveryMessage } from '../LiveryBridgeTypes';
import { Target } from './Target';
import type { Transceiver } from './Transceiver';

export class TransceiverTarget extends Target {
  targetTransceiver: Transceiver;

  constructor(targetTransceiver: Transceiver) {
    super();
    this.targetTransceiver = targetTransceiver;
  }

  transmit(message: LiveryMessage) {
    this.targetTransceiver.receive(message);
  }
}
