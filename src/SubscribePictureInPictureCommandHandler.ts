import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribePictureInPictureCommandHandler extends SubscribeCommandHandler<boolean> {
  constructor(initialValue: boolean) {
    super('subscribePictureInPicture', initialValue);
  }
}
