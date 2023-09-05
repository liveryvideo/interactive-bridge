import type { Quality } from './InteractiveBridge/VideoCommands';

type Listener = (value: Array<Quality | undefined>) => void;

export class SubscribeQualitiesCommandHandler {
  command = 'subscribeQualities';

  private qualities: Array<Quality | undefined> = [];

  handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name !== this.command) {
      return undefined;
    }
    return this.subscribeQualities(listener);
  }

  setQualities(value: Array<Quality | undefined>) {
    this.qualities = value;
    this.listener(value);
  }

  subscribeQualities(listener: Listener) {
    this.listener = listener;
    return this.qualities;
  }

  private listener: Listener = () => {};
}
