/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { AirplayParser } from './AirplayParser';

export class AirplaySubscriber extends StrategicSubscriber<boolean, boolean> {
  constructor(sendCommand: SendCommand<boolean>) {
    super('subscribeAirplay', new AirplayParser(), sendCommand);
  }
}
