// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { Subscriber } from '../util/Subscriber';
import { StreamPhaseParser } from './StreamPhaseParser';
import type { StreamPhase } from './VideoCommands';

export class StreamPhaseSubscriber extends Subscriber<
  StreamPhase,
  StreamPhase
> {
  constructor(sendCommand: SendCommand<StreamPhase>) {
    super('subscribeStreamPhase', new StreamPhaseParser(), sendCommand);
  }
}
