import { expect, test } from 'vitest';
import { createSendCommand } from './doubles/createSendCommand';

import { StreamPhaseSubscriber } from '../src/InteractiveBridge/StreamPhaseSubscriber';
import type { StreamPhase } from '../src/InteractiveBridge/VideoCommands';
import { SubscribeStreamPhaseCommandHandler } from '../src/SubscribeStreamPhaseCommandHandler';
import { InvalidTypeError } from '../src/util/errors';
import { noop } from '../src/util/functions';
import { ArgumentStoringListener } from './doubles/ArgumentStoringListener';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
function arrangeWithInitialValue(initialValue: any) {
  const handler = new SubscribeStreamPhaseCommandHandler(initialValue);
  const sendCommand = createSendCommand(handler);
  const subscriber = new StreamPhaseSubscriber(sendCommand);
  return { subscriber, handler };
}
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
async function assertValueYieldsResult(value: any, result: StreamPhase) {
  const { subscriber } = arrangeWithInitialValue(value);
  const response = await subscriber.subscribe(noop);
  expect(response).toBe(result);
}
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-explicit-any */

test('given value, command subscribeStreamPhase yields response', async () => {
  await assertValueYieldsResult('PRE', 'PRE');
  await assertValueYieldsResult('LIVE', 'LIVE');
  await assertValueYieldsResult('POST', 'POST');
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
async function assertValueThrowsInvalidTypeError(value: any) {
  const { subscriber } = arrangeWithInitialValue(value);
  try {
    await subscriber.subscribe(noop);
  } catch (error) {
    expect(error instanceof InvalidTypeError);
    return;
  }
  expect.fail();
}
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-explicit-any */

test('given invalid value, command subscribeStreamPhase throws InvalidTypeError', async () => {
  await assertValueThrowsInvalidTypeError(null);
  await assertValueThrowsInvalidTypeError(undefined);
  await assertValueThrowsInvalidTypeError(0);
  await assertValueThrowsInvalidTypeError(1);
  await assertValueThrowsInvalidTypeError('OTHER');
  await assertValueThrowsInvalidTypeError('live');
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
async function assertSetValueCallsListenerWithArgument(
  initialValue: any,
  value: any,
  expected: StreamPhase,
) {
  const { subscriber, handler } = arrangeWithInitialValue(initialValue);
  const recorder = new ArgumentStoringListener();
  await subscriber.subscribe(recorder.listener);
  handler.setValue(value);
  expect(recorder.calls).toEqual([expected]);
}
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-explicit-any */

test('given subscribed listener, set value calls listener with value', async () => {
  await assertSetValueCallsListenerWithArgument('PRE', 'LIVE', 'LIVE');
  await assertSetValueCallsListenerWithArgument('LIVE', 'POST', 'POST');
  await assertSetValueCallsListenerWithArgument('POST', 'PRE', 'PRE');
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
async function assertSetValueThrowsInvalidTypeError(value: any) {
  const { subscriber, handler } = arrangeWithInitialValue('PRE');
  await subscriber.subscribe(noop);
  try {
    handler.setValue(value);
  } catch (error) {
    expect(error instanceof InvalidTypeError);
    return;
  }
  expect.fail();
}
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-explicit-any */

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await assertSetValueThrowsInvalidTypeError(null);
  await assertSetValueThrowsInvalidTypeError(undefined);
  await assertSetValueThrowsInvalidTypeError(0);
  await assertSetValueThrowsInvalidTypeError(1);
  await assertSetValueThrowsInvalidTypeError('garbage');
  await assertSetValueThrowsInvalidTypeError({});
});
