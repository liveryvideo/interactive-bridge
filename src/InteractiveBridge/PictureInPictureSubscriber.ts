// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { PictureInPictureParser } from './PictureInPictureParser';

export class PictureInPictureSubscriber extends StrategicSubscriber<
  boolean,
  boolean
> {
  constructor(sendCommand: SendCommand<boolean>) {
    super(
      'subscribePictureInPicture',
      new PictureInPictureParser(),
      sendCommand,
    );
  }
}
