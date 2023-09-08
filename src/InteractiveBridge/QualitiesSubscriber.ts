// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { QualitiesParser } from './QualitiesParser';
import type { Quality } from './VideoCommands';

export class QualitiesSubscriber extends StrategicSubscriber<
  (Quality | undefined)[],
  Quality[]
> {
  constructor(sendCommand: SendCommand<(Quality | undefined)[]>) {
    super('subscribeQualities', new QualitiesParser(), sendCommand);
  }
}
