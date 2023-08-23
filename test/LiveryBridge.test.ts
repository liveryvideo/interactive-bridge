/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-new */
import { describe, expect, test } from 'vitest';
import type { Spy } from '../src/LiveryBridge';
import { LiveryBridge } from '../src/LiveryBridge';
import type { LiveryMessage } from '../src/LiveryBridgeTypes';
import { createJSDOMWindow } from './doubles/JSDOMWindow';

describe('one instance in window', () => {
  test('receiving livery message, spy is called', async () => {
    let spyWasCalled = false;
    const spy: Spy = () => {
      spyWasCalled = true;
    };
    const ownWindow: Window = createJSDOMWindow();
    new LiveryBridge({ origin: '*', window: ownWindow }, { ownWindow, spy });
    const message: LiveryMessage = {
      id: 'fake message id',
      isLivery: true,
      sourceId: 'fake source id',
      type: 'null',
    };
    ownWindow.postMessage(message, '*');
    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
    expect(spyWasCalled).toBe(true);
  });
});

describe('two instances in one window', () => {
  describe('using window origin correspondent', () => {
    test('complete handshake', async () => {
      const ownWindow: Window = createJSDOMWindow();
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
  });

  describe('using object correspondent', () => {
    test('complete handshake', async () => {
      const ownWindow: Window = createJSDOMWindow();
      const bridge1 = new LiveryBridge(undefined, { ownWindow });
      const bridge2 = new LiveryBridge(bridge1, { ownWindow });
      await Promise.all([bridge1.handshakePromise, bridge2.handshakePromise]);
    });
  });
});

test('two instances without window complete handshake', async () => {
  const bridge1 = new LiveryBridge(undefined);
  const bridge2 = new LiveryBridge(bridge1);
  await Promise.all([bridge1.handshakePromise, bridge2.handshakePromise]);
});
