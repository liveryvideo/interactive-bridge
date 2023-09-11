// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { Subscriber } from '../util/Subscriber';
import type { StreamPhase } from './StreamPhaseParser';
import { StreamPhaseParser } from './StreamPhaseParser';

export class StreamPhaseSubscriber extends Subscriber<
  StreamPhase,
  StreamPhase
> {
  constructor(sendCommand: SendCommand<StreamPhase>) {
    super('subscribeStreamPhase', new StreamPhaseParser(), sendCommand);
  }
}
