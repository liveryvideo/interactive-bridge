export class ArgumentStoringListener<T> {
  calls: unknown[] = [];

  listener = (value: T) => {
    this.calls.push(value);
  };
}
