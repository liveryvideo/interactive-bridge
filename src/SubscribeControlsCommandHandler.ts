import type { Controls } from './InteractiveBridge/ControlsParser';
import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeControlsCommandHandler extends SubscribeCommandHandler<Controls> {
  constructor(initialValue: Controls) {
    super('subscribeControls', initialValue);
  }
}
