import { Subscriber } from '../util/Subscriber';

export class ChromecastSubscriber extends Subscriber<
  string | undefined,
  string | undefined
> {
  protected command = 'subscribeChromecast';

  parse(value: unknown) {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `subscribeChromecast value type: ${typeof value}, should be: string | undefined`,
      );
    }
    return value;
  }
}
