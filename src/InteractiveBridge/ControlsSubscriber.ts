/* eslint-disable max-classes-per-file */
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import type { Controls } from './ControlsParser';
import { ControlsParser } from './ControlsParser';

export class ControlsSubscriber extends StrategicSubscriber<
  Controls,
  Controls
> {
  constructor(sendCommand: SendCommand<Controls>) {
    super('subscribeControls', new ControlsParser(), sendCommand);
  }
}
