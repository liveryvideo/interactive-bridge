/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect } from 'vitest';
import type { SubscribeCommandHandler } from '../../src/util/SubscribeCommandHandler';
import type { Subscriber } from '../../src/util/Subscriber';
import { InvalidTypeError } from '../../src/util/errors';
import { noop } from '../../src/util/functions';
import { ArgumentStoringListener } from '../doubles/ArgumentStoringListener';
import { createSendCommand } from '../doubles/createSendCommand';

export class SubscriberTestApparatus<T, InType, OutType> {
  private SubscribeCommandHandlerClass: new (
    ...args: any[]
  ) => SubscribeCommandHandler<T>;

  private SubscriberClass: new (...args: any[]) => Subscriber<InType, OutType>;

  constructor(
    HandlerClass: new (...args: any[]) => SubscribeCommandHandler<T>,
    SubscriberClass: new (...args: any[]) => Subscriber<InType, OutType>,
  ) {
    this.SubscribeCommandHandlerClass = HandlerClass;
    this.SubscriberClass = SubscriberClass;
  }

  async assertSetValueCallsListenerWithArgument(
    initialValue: any,
    value: any,
    expected: OutType,
  ) {
    const { subscriber, handler } = this.arrangeWithInitialValue(initialValue);
    const recorder = new ArgumentStoringListener();
    await subscriber.subscribe(recorder.listener);
    handler.setValue(value);
    expect(recorder.calls).toEqual([expected]);
  }

  async assertSetValueThrowsInvalidTypeError(initialValue: any, value: any) {
    const { subscriber, handler } = this.arrangeWithInitialValue(initialValue);
    await subscriber.subscribe(noop);
    try {
      handler.setValue(value);
    } catch (error) {
      expect(error instanceof InvalidTypeError);
      return;
    }
    expect.fail();
  }

  async assertValueThrowsInvalidTypeError(value: any) {
    const { subscriber } = this.arrangeWithInitialValue(value);
    try {
      await subscriber.subscribe(noop);
    } catch (error) {
      expect(error instanceof InvalidTypeError);
      return;
    }
    expect.fail();
  }

  async assertValueYieldsResult(value: any, result: OutType) {
    const { subscriber } = this.arrangeWithInitialValue(value);
    const response = await subscriber.subscribe(noop);
    expect(response).toEqual(result);
  }

  private arrangeWithInitialValue(initialValue: any) {
    const handler: SubscribeCommandHandler<T> =
      new this.SubscribeCommandHandlerClass(initialValue);
    const sendCommand = createSendCommand(handler);
    const subscriber = new this.SubscriberClass(sendCommand);
    return { subscriber, handler };
  }
}
