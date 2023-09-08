/* eslint-disable max-classes-per-file */
import { expect, test } from 'vitest';
import type { Parser } from '../src/util/Parser';
import { SubscribeCommandHandler } from '../src/util/SubscribeCommandHandler';
import { Subscriber } from '../src/util/Subscriber';
import { InvalidTypeError } from '../src/util/errors';
import { identity } from '../src/util/functions';
import { ArgumentStoringListener } from './doubles/ArgumentStoringListener';
import { createSendCommand } from './doubles/createSendCommand';

class NumberParser implements Parser<number> {
  parse(value: unknown) {
    if (typeof value !== 'number') {
      throw new InvalidTypeError(value);
    }
    return value;
  }
}

class TransformingNumberParser implements Parser<number> {
  transform = identity<number>;

  parse(value: unknown) {
    if (typeof value !== 'number') {
      throw new InvalidTypeError(value);
    }
    return this.transform(value);
  }
}

function arrangeWithInitialValue(value: number) {
  const subscribeNumberCommandHandler = new SubscribeCommandHandler(
    'subscribeNumber',
    value,
  );
  const sendCommand = createSendCommand(subscribeNumberCommandHandler);
  const subscriber = new Subscriber<number, number>(
    'subscribeNumber',
    new NumberParser(),
    sendCommand,
  );
  const argStoringListener = new ArgumentStoringListener<number>();

  return {
    handler: subscribeNumberCommandHandler,
    recorder: argStoringListener,
    subscriber,
  };
}

async function arrangeSubscribedWithInitialValue(value: number) {
  const { handler, recorder, subscriber } = arrangeWithInitialValue(value);
  await subscriber.subscribe(recorder.listener);
  return { handler, recorder, subscriber };
}

async function assertSetValueSequenceYieldsCallSequence(
  sequence: number[],
  expected: number[],
) {
  const { handler, recorder } = await arrangeSubscribedWithInitialValue(0);
  sequence.forEach((v) => handler.setValue(v));
  expect(recorder.calls).toEqual(expected);
}

test('invocation retrieves initial value', async () => {
  const { recorder, subscriber } = arrangeWithInitialValue(0);
  const invocationResponse = await subscriber.subscribe(recorder.listener);
  expect(invocationResponse).toBe(0);
});

test('invocation retrieves set value', async () => {
  const { handler, recorder, subscriber } = arrangeWithInitialValue(0);
  handler.setValue(1);
  const invocationResponse = await subscriber.subscribe(recorder.listener);
  expect(invocationResponse).toBe(1);
});

test('with value not number, invocation throws InvalidType error', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { recorder, subscriber } = arrangeWithInitialValue('unexpected string');
  try {
    await subscriber.subscribe(recorder.listener);
  } catch (error) {
    if (!(error instanceof InvalidTypeError)) {
      expect.fail(
        `expected ${String(error)} to be instanceof InvalidTypeError`,
      );
    }
    expect(error.name).toBe('InvalidTypeError');
    return;
  }
  expect.fail('expected error to be thrown');
});

test('invocation does not call listener', async () => {
  const { recorder, subscriber } = arrangeWithInitialValue(0);
  await subscriber.subscribe(recorder.listener);
  expect(recorder.calls).toEqual([]);
});

test('invocation registers listener', async () => {
  const { handler, recorder, subscriber } = arrangeWithInitialValue(0);
  await subscriber.subscribe(recorder.listener);
  handler.setValue(1);
  expect(recorder.calls).toEqual([1]);
});

test('when value is set listener is called with value as argument', async () => {
  await assertSetValueSequenceYieldsCallSequence([1, 2], [1, 2]);
  await assertSetValueSequenceYieldsCallSequence([999, 12], [999, 12]);
  await assertSetValueSequenceYieldsCallSequence([99, 99, 12], [99, 12]);
});

test('set values are parsed before being handed to listener', async () => {
  const handler = new SubscribeCommandHandler('subscribeNumber', 0);
  const sendCommand = createSendCommand(handler);
  const parser = new TransformingNumberParser();
  parser.transform = (v) => v + 1;
  const subscriber = new Subscriber('subscribeNumber', parser, sendCommand);
  const recorder = new ArgumentStoringListener<number>();
  await subscriber.subscribe(recorder.listener);
  handler.setValue(10);
  expect(recorder.calls).toEqual([11]);
});
