/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { Subscriber } from '../util/Subscriber';
import { FullscreenParser } from './FullscreenParser';

export class FullscreenSubscriber extends Subscriber<boolean, boolean> {
  constructor(sendCommand: SendCommand<boolean>) {
    super('subscribeFullscreen', new FullscreenParser(), sendCommand);
  }
}
