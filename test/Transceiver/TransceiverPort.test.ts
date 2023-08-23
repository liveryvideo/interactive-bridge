/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from 'vitest';
import type { LiveryMessage } from '../../src/LiveryBridgeTypes';
import { TransceiverPort } from '../../src/Transceiver/TransceiverPort';

const fakeMessage: LiveryMessage = {
  id: 'dummy-id',
  isLivery: true,
  sourceId: 'dummy-source',
  type: 'null',
};

test('receive forwards message to message handler', () => {
  let result: any;
  const port = new TransceiverPort();
  port.setMessageHandler((message: LiveryMessage) => {
    result = message;
  });
  port.listen('*');
  port.receive(fakeMessage, '');
  expect(result).toEqual(fakeMessage);
});
