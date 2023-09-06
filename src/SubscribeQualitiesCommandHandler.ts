import type { Quality } from './InteractiveBridge/VideoCommands';
import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

type Qualities = Array<Quality | undefined>;

export class SubscribeQualitiesCommandHandler extends SubscribeCommandHandler<Qualities> {
  constructor(initialValue: Qualities) {
    super('subscribeQualities', initialValue);
  }
}
