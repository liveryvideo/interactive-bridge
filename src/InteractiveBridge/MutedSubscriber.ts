/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { MutedParser } from './MutedParser';

export class MutedSubscriber extends StrategicSubscriber<boolean, boolean> {
  constructor(sendCommand: SendCommand<boolean>) {
    super('subscribeMuted', new MutedParser(), sendCommand);
  }
}
