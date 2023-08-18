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
  const ownWindow = new ListenerCallingFakeWindow();
  const bridge1 = new LiveryBridge(
    { origin: '*', window: ownWindow },
    { ownWindow },
  );
  const bridge2 = new LiveryBridge(
    { origin: '*', window: ownWindow },
    { ownWindow },
  );
  await Promise.all([bridge1.handshakePromise, bridge2.handshakePromise]);
});

test('two instances without window complete handshake', async () => {
  // let resolvedHandshakes = 0;
  // const firstBridge = new LiveryBridge(undefined, {handshakeCallback: ()=>{ resolvedHandshakes += 1 }})
  // new LiveryBridge(firstBridge, {handshakeCallback: () => { resolvedHandshakes += 1 }})
  // setTimeout(()=>{
  //   expect(resolvedHandshakes).toBe(2);
  // }, 30)

  const bridge1 = new LiveryBridge(undefined);
  const bridge2 = new LiveryBridge(bridge1);
  await Promise.all([bridge1.handshakePromise, bridge2.handshakePromise]);
});
