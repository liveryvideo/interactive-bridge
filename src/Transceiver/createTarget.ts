/* eslint-disable max-classes-per-file */
import type { Target } from './Target';
import type { Transceiver } from './Transceiver';
import { TransceiverTarget } from './TransceiverTarget';
import { WindowTarget } from './WindowTarget';

export interface TargetOptions {
  targetOrigin?: string;
  targetTransceiver?: Transceiver;
  targetWindow?: Window;
  type: 'direct' | 'postmessage';
}

export function createTarget(options: TargetOptions): Target {
  switch (options.type) {
    case 'direct':
      if (!options.targetTransceiver) {
        throw new Error(
          `When type is 'direct', a targetTransceiver option must be provided`,
        );
      }
      return new TransceiverTarget(options.targetTransceiver);
    case 'postmessage':
      if (!options.targetOrigin || !options.targetWindow) {
        throw new Error(
          `When type is 'postmessage', a targetOrigin and a targetWindow must be provided`,
        );
      }
      return new WindowTarget(options.targetOrigin, options.targetWindow);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid target type: ${options.type}`);
  }
}
