// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { QualityParser } from './QualityParser';

export class QualitySubscriber extends StrategicSubscriber<string, string> {
  constructor(sendCommand: SendCommand<string>) {
    super('subscribeQuality', new QualityParser(), sendCommand);
  }
}
