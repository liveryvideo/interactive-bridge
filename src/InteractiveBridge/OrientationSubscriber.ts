// eslint-disable-next-line max-classes-per-file
import type { Orientation } from '../InteractiveBridge';
import type { SendCommand } from '../types';
import { Subscriber } from '../util/Subscriber';
import { OrientationParser } from './OrientationParser';

export class OrientationSubscriber extends Subscriber<
  Orientation,
  Orientation
> {
  constructor(sendCommand: SendCommand<Orientation>) {
    super('subscribeOrientation', new OrientationParser(), sendCommand);
  }
}
