/* eslint-disable max-classes-per-file */
import type { Port } from './Port';
import { TransceiverPort } from './TransceiverPort';
import { WindowPort } from './WindowPort';

export interface PortOptions {
  ownWindow?: Window;
  sourceWindow?: Window;
  type: 'direct' | 'postmessage';
}

export function createPort(options: PortOptions): Port {
  switch (options.type) {
    case 'direct':
      return new TransceiverPort();
    case 'postmessage':
      if (!options.ownWindow) {
        throw new Error(
          `When type is 'postmessage', an ownWindow option must be provided`,
        );
      }
      return new WindowPort(options.ownWindow, options.sourceWindow);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid port type: ${options.type}`);
  }
}
