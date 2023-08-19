import { describe, test } from 'vitest';
import type { AbstractPlayerBridge } from '../src/AbstractPlayerBridge';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { MockPlayerBridge } from '../src/MockPlayerBridge';
import { createJSDOMWindow } from './doubles/JSDOMWindow';

test('given an interactive bridge with player bridge target handshake completes', async () => {
  const playerBridge: AbstractPlayerBridge = new MockPlayerBridge();
  const interactiveBridge = new InteractiveBridge(playerBridge);
  await Promise.all([
    playerBridge.handshakePromise,
    interactiveBridge.handshakePromise,
  ]);
});

// edgecase
test('handshake completes when player has target', async () => {
  const ownWindow: Window = createJSDOMWindow();
  const playerBridge: AbstractPlayerBridge = new MockPlayerBridge({
    origin: '*',
    window: ownWindow,
  });
  const interactiveBridge = new InteractiveBridge(playerBridge);
  await Promise.all([
    playerBridge.handshakePromise,
    interactiveBridge.handshakePromise,
  ]);
});

test('interactive requests app name from player');
test('interactive requests customer ID from player');
test('interactive requests endpoint ID from player');
test('interactive requests latency from player');
describe('interactive requests livery params from player');
test('interactive requests player version from player');
test('interactive requests stream ID from player');
describe('interactive registers ad hoc bridge commands', () => {
  test('registering no commands');
  test('registering one command');
  test('registering multiple commands');
  test('unregistering a command');
  test('unregistering non-existent command');
});
test('interactive subscribes to fullscreen toggling on player');
test('interactive subscribes to quality changes on player');
test('interactive subscribes to stream phase changing in player');
