/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';
import type { AbstractPlayerBridge } from '../src/AbstractPlayerBridge';
import type { StreamPhase } from '../src/InteractiveBridgeFacade';
import { InteractiveBridgeFacade } from '../src/InteractiveBridgeFacade';
import { MockPlayerBridge } from '../src/MockPlayerBridge';
import { createJSDOMWindow } from './doubles/JSDOMWindow';

type BridgePair = [AbstractPlayerBridge, InteractiveBridgeFacade];

// edgecase
test('handshake completes when player has target', async () => {
  const ownWindow: Window = createJSDOMWindow();
  const playerBridge: AbstractPlayerBridge = new MockPlayerBridge({
    origin: '*',
    window: ownWindow,
  });
  const interactiveBridge = new InteractiveBridgeFacade(playerBridge);
  await Promise.all([
    playerBridge.handshakePromise,
    interactiveBridge.handshakePromise,
  ]);
});

function executeSystemTests(
  createBridgesAndCompleteHandshake: (
    playerUrl?: string,
    interactiveUrl?: string,
  ) => Promise<BridgePair>,
) {
  test('handshake completes', async () => {
    await createBridgesAndCompleteHandshake();
  });

  test('interactive requests app name from player', async () => {
    const url = 'https://subdomain.example.com:8080/mypage';
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake(url);
    const appName = await interactiveBridge.getAppName();
    expect(appName).toBe('subdomain.example.com');
  });

  test('interactive requests customer ID from player', async () => {
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
    const customerId = await interactiveBridge.getCustomerId();
    expect(customerId).toBe('dummy-customer-id');
  });

  test('interactive requests endpoint ID from player', async () => {
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
    const customerId = await interactiveBridge.getEndpointId();
    expect(customerId).toBe('dummy-endpoint-id');
  });

  test('interactive requests latency from player', async () => {
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
    const latency = await interactiveBridge.getLatency();
    expect(latency).toBeCloseTo(1.23);
  });

  test('interactive requests livery params from player', async () => {
    const url =
      'https://example.com?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2';
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake(url);
    const liveryParams = await interactiveBridge.getLiveryParams();
    expect(liveryParams).toEqual({
      'foo:bar': 'hey you',
      no_val: '',
      multi: '1',
    });
  });

  test('interactive requests player version from player', async () => {
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
    const playerVersion = await interactiveBridge.getPlayerVersion();
    expect(playerVersion).toBe('1.0.0-dummy-version');
  });

  test('interactive requests stream ID from player', async () => {
    const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
    const streamId = await interactiveBridge.getStreamId();
    expect(streamId).toBe('dummy-stream-id');
  });

  describe('interactive registers ad hoc bridge commands', () => {
    type CommandSpecification = [name: string, response: any];

    async function assertInteractiveCommands(
      commands: CommandSpecification[],
      playerBridge: AbstractPlayerBridge,
      interactiveBridge: InteractiveBridgeFacade,
    ) {
      const results = new Array<any>(commands.length);
      for (let i = 0; i < commands.length; i++) {
        const [commandName] = commands[i];
        interactiveBridge.registerInteractiveCommand(commandName, (v) => {
          results[i] = v;
        });
      }
      const promises = new Array<Promise<any>>(commands.length);
      for (let i = 0; i < commands.length; i++) {
        const [commandName, response] = commands[i];
        promises[i] = playerBridge.sendInteractiveCommand(
          commandName,
          response,
        );
      }
      await Promise.all(promises);
      for (let i = 0; i < commands.length; i++) {
        const [, response] = commands[i];
        expect(results[i]).toBe(response);
      }
    }

    test('registering one command', async () => {
      const [playerBridge, interactiveBridge] =
        await createBridgesAndCompleteHandshake();
      await assertInteractiveCommands(
        [['my-command', 'my command arg']],
        playerBridge,
        interactiveBridge,
      );
    });

    test('registering multiple commands', async () => {
      const [playerBridge, interactiveBridge] =
        await createBridgesAndCompleteHandshake();
      await assertInteractiveCommands(
        [
          ['first-command', 112],
          ['second-command', 255],
        ],
        playerBridge,
        interactiveBridge,
      );
    });

    test('unregistering a command', async () => {
      const [playerBridge, interactiveBridge] =
        await createBridgesAndCompleteHandshake();
      let valueReceived;
      interactiveBridge.registerInteractiveCommand('my-command', (v) => {
        valueReceived = v;
      });
      interactiveBridge.unregisterInteractiveCommand('my-command');
      let didReject = false;
      try {
        await playerBridge.sendInteractiveCommand('my-command', 1);
      } catch (err) {
        didReject = true;
      }
      expect(didReject).toBe(true);
      expect(valueReceived).toBe(undefined);
    });

    // edgecase
    test('unregistering non-existent command performs no op', async () => {
      const [, interactiveBridge] = await createBridgesAndCompleteHandshake();
      interactiveBridge.unregisterInteractiveCommand('does-not-exist');
    });
  });

  test('interactive subscribes to fullscreen toggling on player', async () => {
    let trace = '';
    const listener = (fullscreen: boolean) => {
      trace += fullscreen ? '+' : '-';
    };
    const [playerBridge, interactiveBridge] =
      await createBridgesAndCompleteHandshake();
    const initialState = await interactiveBridge.subscribeFullscreen(listener);
    (playerBridge as MockPlayerBridge).enterFullscreen();
    (playerBridge as MockPlayerBridge).exitFullscreen();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(initialState).toBe(false);
    expect(trace).toBe('+-');
  });

  test('interactive subscribes to quality changes on player', async () => {
    let trace = '';
    const listener = (quality: string) => {
      trace += `${quality};`;
    };
    const [playerBridge, interactiveBridge] =
      await createBridgesAndCompleteHandshake();
    const initialState = await interactiveBridge.subscribeQuality(listener);
    (playerBridge as MockPlayerBridge).setQuality('A');
    (playerBridge as MockPlayerBridge).setQuality('B');
    (playerBridge as MockPlayerBridge).setQuality('C');
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(initialState).toBe('dummy-quality-1');
    expect(trace).toBe('A;B;C;');
  });

  test('interactive subscribes to stream phase changing in player', async () => {
    let trace = '';
    const listener = (phase: StreamPhase) => {
      trace += `${phase};`;
    };
    const [playerBridge, interactiveBridge] =
      await createBridgesAndCompleteHandshake();
    const initialState = await interactiveBridge.subscribeStreamPhase(listener);
    (playerBridge as MockPlayerBridge).startPrePhase();
    (playerBridge as MockPlayerBridge).startLivePhase();
    (playerBridge as MockPlayerBridge).startPostPhase();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(initialState).toBe('PRE');
    expect(trace).toBe('PRE;LIVE;POST;');
  });
}

describe('using direct communication', () => {
  const createBridgesAndCompleteHandshake = async (
    url?: string,
  ): Promise<BridgePair> => {
    const ownWindow = createJSDOMWindow(url);
    const playerBridgeTarget = undefined;
    const playerBridge = new MockPlayerBridge(playerBridgeTarget, {
      ownWindow,
      latency: 1.23,
    });
    const interactiveBridgeTarget = playerBridge;
    const interactiveBridge = new InteractiveBridgeFacade(
      interactiveBridgeTarget,
      {
        ownWindow,
      },
    );
    await Promise.all([
      playerBridge.handshakePromise,
      interactiveBridge.handshakePromise,
    ]);
    return [playerBridge, interactiveBridge];
  };
  executeSystemTests(createBridgesAndCompleteHandshake);
});

describe('using postmessage communication in shared window', () => {
  const createBridgesAndCompleteHandshake = async (
    url?: string,
  ): Promise<BridgePair> => {
    const ownWindow = createJSDOMWindow(url);
    const playerBridgeTarget = { origin: '*', window: ownWindow };
    const playerBridge: AbstractPlayerBridge = new MockPlayerBridge(
      playerBridgeTarget,
      { ownWindow, latency: 1.23 },
    );
    const interactiveBridgeTarget = '*';
    const interactiveBridge = new InteractiveBridgeFacade(
      interactiveBridgeTarget,
      {
        ownWindow,
      },
    );
    await Promise.all([
      playerBridge.handshakePromise,
      interactiveBridge.handshakePromise,
    ]);
    return [playerBridge, interactiveBridge];
  };
  executeSystemTests(createBridgesAndCompleteHandshake);
});

describe('using postmessage communication with iframe', () => {
  const createBridgesAndCompleteHandshake = async (
    playerUrl?: string,
    interactiveUrl?: string,
  ): Promise<BridgePair> => {
    const playerWindow = createJSDOMWindow(playerUrl);
    const interactiveFrame = playerWindow.document.createElement('iframe');
    interactiveFrame.src = interactiveUrl ?? 'about:blank';
    playerWindow.document.body.appendChild(interactiveFrame);
    const playerBridgeTarget = {
      origin: '*',
      window: interactiveFrame.contentWindow!,
    };
    const interactiveBridgeTarget = '*';
    const playerBridge: AbstractPlayerBridge = new MockPlayerBridge(
      playerBridgeTarget,
      { ownWindow: playerWindow, latency: 1.23 },
    );
    const interactiveBridge = new InteractiveBridgeFacade(
      interactiveBridgeTarget,
      {
        ownWindow: interactiveFrame.contentWindow!,
      },
    );
    await Promise.all([
      playerBridge.handshakePromise,
      interactiveBridge.handshakePromise,
    ]);
    return [playerBridge, interactiveBridge];
  };
  executeSystemTests(createBridgesAndCompleteHandshake);
});
