/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-new */
import { expect, test } from 'vitest';
import type { LiveryMessage, PostMessagable, Spy } from '../src/LiveryBridge';
import { LiveryBridge } from '../src/LiveryBridge';

class ListenerCallingFakeWindow implements PostMessagable {
  parent: PostMessagable;

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected listeners: Function[] = [];

  constructor(parent?: PostMessagable) {
    this.parent = parent || this;
  }

  addEventListener(type: any, listener: any, options?: any): void {
    if (type !== 'message') {
      return;
    }
    if (typeof listener !== 'function') {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    this.listeners.push(listener as Function);
  }

  postMessage(message: any, targetOrigin: any, transfer?: any): void {
    for (const listener of this.listeners) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const event = { data: message, source: this };
      listener(event);
    }
  }
}

test('receiving livery message, spy is called', () => {
  let spyWasCalled = false;
  const spy: Spy = () => {
    spyWasCalled = true;
  };
  const ownWindow = new ListenerCallingFakeWindow();
  new LiveryBridge({ origin: '*', window: ownWindow }, { ownWindow, spy });
  const message: LiveryMessage = {
    id: 'fake message id',
    isLivery: true,
    sourceId: 'fake source id',
    type: 'null',
  };
  ownWindow.postMessage(message, '*');
  expect(spyWasCalled).toBe(true);
});

test('two instances in one window completes handshake', async () => {
  function createBridgeAndWaitForHandshake(ownWindow: PostMessagable) {
    return new Promise<void>((resolve) => {
      new LiveryBridge(
        { origin: '*', window: ownWindow },
        { ownWindow, handshakeCallback: resolve },
      );
    });
  }
  const ownWindow = new ListenerCallingFakeWindow();
  const promise1 = createBridgeAndWaitForHandshake(ownWindow);
  const promise2 = createBridgeAndWaitForHandshake(ownWindow);
  await Promise.all([promise1, promise2]);
});
