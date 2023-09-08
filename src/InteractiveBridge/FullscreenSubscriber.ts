/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { FullscreenParser } from './FullscreenParser';

export class FullscreenSubscriber extends StrategicSubscriber<
  boolean,
  boolean
> {
  constructor(sendCommand: SendCommand<boolean>) {
    super('subscribeFullscreen', new FullscreenParser(), sendCommand);
  }
}
