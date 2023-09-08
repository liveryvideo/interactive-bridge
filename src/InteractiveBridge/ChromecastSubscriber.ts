/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { ChromecastParser } from './ChromecastParser';

export class ChromecastSubscriber extends StrategicSubscriber<
  string | undefined,
  string | undefined
> {
  constructor(sendCommand: SendCommand<string | undefined>) {
    super('subscribeChromecast', new ChromecastParser(), sendCommand);
  }
}
