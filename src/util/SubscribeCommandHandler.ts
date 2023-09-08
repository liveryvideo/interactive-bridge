import { SubscriptionError } from './errors';

type Listener<T> = (value: T) => void;
export class SubscribeCommandHandler<T> {
  command: string;

  private value: T;

  constructor(command: string, initialValue: T) {
    this.command = command;
    this.value = initialValue;
  }

  handleCommand(name: string, arg: unknown, listener: (value: T) => void) {
    if (name !== this.command) {
      throw new SubscriptionError(
        `Handler for command '${this.command}' cannot handle command '${name}'`,
      );
    }
    return this.subscribe(listener);
  }

  setValue(value: T) {
    if (this.value === value) {
      return;
    }
    this.value = value;
    this.listener(value);
  }

  subscribe(listener: Listener<T>) {
    this.listener = listener;
    return this.value;
  }

  private listener: Listener<T> = () => {};
}
