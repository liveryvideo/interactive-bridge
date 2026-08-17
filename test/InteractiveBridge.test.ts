import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InteractiveBridge } from '../src/InteractiveBridge.ts';
import { MockPlayerBridge } from '../src/MockPlayerBridge.ts';
import type {
  DisplayMode,
  Orientation,
  PerformanceMode,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  Volume,
} from '../src/util/schema.ts';

/**
 * These tests exercise `InteractiveBridge` against `MockPlayerBridge` the same way the mock/interactive
 * test pages allow doing so manually: sending every command and checking both the resolved value
 * and any values passed to subscription listeners.
 */
describe('InteractiveBridge with MockPlayerBridge', () => {
  let playerBridge: MockPlayerBridge;
  let interactiveBridge: InteractiveBridge;

  beforeEach(() => {
    vi.useFakeTimers();
    playerBridge = new MockPlayerBridge();
    interactiveBridge = new InteractiveBridge(playerBridge);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get commands', () => {
    it('getAppName() resolves with location hostname', async () => {
      await expect(interactiveBridge.getAppName()).resolves.to.equal(
        window.location.hostname,
      );
    });

    it('getCustomerId() (deprecated) resolves with config customerId', async () => {
      await expect(interactiveBridge.getCustomerId()).resolves.to.equal(
        'dummy-customer-id',
      );
    });

    it('getEndpointId() resolves with endpoint id', async () => {
      await expect(interactiveBridge.getEndpointId()).resolves.to.equal(
        'dummy-endpoint-id',
      );
    });

    it('getFeatures() resolves with registry of supported features', async () => {
      await expect(interactiveBridge.getFeatures()).resolves.to.deep.equal({
        airplay: true,
        chromecast: true,
        contact: true,
        fullscreen: true,
        performance: true,
        pip: true,
        scrubber: true,
        volume: true,
      });
    });

    it('getLatency() (deprecated) resolves with current playback latency', async () => {
      await expect(interactiveBridge.getLatency()).resolves.to.equal(2.98);
    });

    it('getLatency() (deprecated) resolves with NaN while not playing', async () => {
      await interactiveBridge.pause();
      const latency = await interactiveBridge.getLatency();
      expect(Number.isNaN(latency)).to.equal(true);
    });

    it('getPlayback() resolves with playback details while playing', async () => {
      const playback = await interactiveBridge.getPlayback();
      expect(playback.buffer).to.equal(2.8);
      expect(playback.duration).to.equal(Number.POSITIVE_INFINITY);
      expect(playback.latency).to.equal(2.98);
      expect(playback.position).to.be.closeTo(-2.98, 1e-9);
    });

    it('getPlayback() resolves with NaN buffer/latency and 0 position while not playing', async () => {
      await interactiveBridge.pause();
      const playback = await interactiveBridge.getPlayback();
      expect(Number.isNaN(playback.buffer)).to.equal(true);
      expect(Number.isNaN(playback.latency)).to.equal(true);
      expect(playback.duration).to.equal(Number.POSITIVE_INFINITY);
      expect(playback.position).to.equal(0);
    });

    it('getPlayerVersion() resolves with player version', async () => {
      await expect(interactiveBridge.getPlayerVersion()).resolves.to.equal(
        '1.0.0-dummy-version',
      );
    });

    it('getStreamId() resolves with stream id', async () => {
      await expect(interactiveBridge.getStreamId()).resolves.to.equal(
        'dummy-stream-id',
      );
    });
  });

  describe('action commands', () => {
    it('pause() changes playback state to PAUSED', async () => {
      const states: PlaybackState[] = [];
      await interactiveBridge.subscribePlaybackState((value) =>
        states.push(value),
      );
      await interactiveBridge.pause();
      expect(states).to.deep.equal(['PAUSED']);
    });

    it('play() transitions playback state through BUFFERING back to PLAYING', async () => {
      const states: PlaybackState[] = [];
      const initial = await interactiveBridge.subscribePlaybackState((value) =>
        states.push(value),
      );
      expect(initial).to.equal('PLAYING');

      await interactiveBridge.play();
      expect(states).to.deep.equal(['BUFFERING']);

      await vi.advanceTimersByTimeAsync(3000);
      expect(states).to.deep.equal(['BUFFERING', 'PLAYING']);
    });

    it('reload() behaves the same as play()', async () => {
      const states: PlaybackState[] = [];
      await interactiveBridge.subscribePlaybackState((value) =>
        states.push(value),
      );

      await interactiveBridge.reload();
      expect(states).to.deep.equal(['BUFFERING']);

      await vi.advanceTimersByTimeAsync(3000);
      expect(states).to.deep.equal(['BUFFERING', 'PLAYING']);
    });

    it('seek() transitions playback state through SEEKING back to PLAYING', async () => {
      const states: PlaybackState[] = [];
      await interactiveBridge.subscribePlaybackState((value) =>
        states.push(value),
      );

      await interactiveBridge.seek(5);
      expect(states).to.deep.equal(['SEEKING']);

      await vi.advanceTimersByTimeAsync(3000);
      expect(states).to.deep.equal(['SEEKING', 'PLAYING']);
    });

    describe('selectQuality()', () => {
      it('changes subscribeQualities().selected and notifies listener', async () => {
        const values: Qualities[] = [];
        await interactiveBridge.subscribeQualities((value) =>
          values.push(value),
        );

        await interactiveBridge.selectQuality(2);
        expect(values).to.have.length(1);
        expect(values[0]?.selected).to.equal(2);
      });

      it('allows selecting index -1 to use ABR', async () => {
        const values: Qualities[] = [];
        await interactiveBridge.subscribeQualities((value) =>
          values.push(value),
        );

        await interactiveBridge.selectQuality(-1);
        expect(values[0]?.selected).to.equal(-1);
      });

      it('does not notify listener when selecting the already selected index', async () => {
        const values: Qualities[] = [];
        await interactiveBridge.subscribeQualities((value) =>
          values.push(value),
        );

        await interactiveBridge.selectQuality(0);
        expect(values).to.have.length(0);
      });

      it('rejects with an error for an invalid index', async () => {
        await expect(interactiveBridge.selectQuality(99)).rejects.toThrow(
          'Invalid qualities index: 99',
        );
      });
    });

    describe('setDisplay()', () => {
      it('changes subscribeDisplay() value and notifies listener', async () => {
        const values: DisplayMode[] = [];
        const initial = await interactiveBridge.subscribeDisplay((value) =>
          values.push(value),
        );
        expect(initial).to.equal('DEFAULT');

        await interactiveBridge.setDisplay('FULLSCREEN');
        expect(values).to.deep.equal(['FULLSCREEN']);
      });

      it('does not notify listener when setting the same display mode', async () => {
        const values: DisplayMode[] = [];
        await interactiveBridge.subscribeDisplay((value) => values.push(value));

        await interactiveBridge.setDisplay('DEFAULT');
        expect(values).to.have.length(0);
      });
    });

    describe('setMuted()', () => {
      it('changes subscribeVolume().muted and notifies listener', async () => {
        const values: Volume[] = [];
        const initial = await interactiveBridge.subscribeVolume((value) =>
          values.push(value),
        );
        expect(initial).to.deep.equal({ muted: true, volume: 1 });

        await interactiveBridge.setMuted(false);
        expect(values).to.deep.equal([{ muted: false, volume: 1 }]);
      });

      it('does not notify listener when setting the same muted state', async () => {
        const values: Volume[] = [];
        await interactiveBridge.subscribeVolume((value) => values.push(value));

        await interactiveBridge.setMuted(true);
        expect(values).to.have.length(0);
      });
    });

    describe('setVolume()', () => {
      it('changes subscribeVolume().volume and notifies listener', async () => {
        const values: Volume[] = [];
        await interactiveBridge.subscribeVolume((value) => values.push(value));

        await interactiveBridge.setVolume(0.5);
        expect(values).to.deep.equal([{ muted: true, volume: 0.5 }]);
      });

      it('does not notify listener when setting the same volume', async () => {
        const values: Volume[] = [];
        await interactiveBridge.subscribeVolume((value) => values.push(value));

        await interactiveBridge.setVolume(1);
        expect(values).to.have.length(0);
      });
    });

    it('submitUserFeedback() passes feedback through to player bridge', async () => {
      const feedback = {
        comments: 'Great stream',
        email: 'viewer@example.com',
        name: 'Viewer',
      };

      await interactiveBridge.submitUserFeedback(feedback);
      expect(playerBridge.userFeedback).to.deep.equal(feedback);
    });
  });

  describe('subscribe commands', () => {
    it('subscribeConfig() resolves initial config and notifies listener of streamPhase changes', async () => {
      const streamPhases: StreamPhase[] = [];
      const initial = await interactiveBridge.subscribeConfig((value) =>
        streamPhases.push(value.streamPhase),
      );
      expect(initial.autoplay).to.equal(true);
      expect(initial.customerId).to.equal('dummy-customer-id');
      expect(initial.fit).to.equal('CONTAIN');
      expect(initial.interactive).to.equal('test');
      expect(initial.position).to.equal('CENTER');
      expect(initial.sources).to.deep.equal(['dummy-source-url']);
      expect(initial.streamPhase).to.equal('POST');
      expect(initial.targetLatency).to.equal(3);

      await vi.advanceTimersByTimeAsync(3000);
      expect(streamPhases).to.deep.equal(['PRE']);

      await vi.advanceTimersByTimeAsync(3000);
      expect(streamPhases).to.deep.equal(['PRE', 'LIVE']);
    });

    it('subscribeError() resolves initial error and notifies listener when cleared', async () => {
      const values: (string | undefined)[] = [];
      const initial = await interactiveBridge.subscribeError((value) =>
        values.push(value),
      );
      expect(initial).to.equal('dummy-error');

      await vi.advanceTimersByTimeAsync(1500);
      expect(values).to.deep.equal(['']);
    });

    it('subscribeFullscreen() (deprecated) reduces subscribeDisplay() to a boolean', async () => {
      const values: boolean[] = [];
      const initial = await interactiveBridge.subscribeFullscreen((value) =>
        values.push(value),
      );
      expect(initial).to.equal(false);

      await interactiveBridge.setDisplay('FULLSCREEN');
      expect(values).to.deep.equal([true]);

      await interactiveBridge.setDisplay('DEFAULT');
      expect(values).to.deep.equal([true, false]);
    });

    it('subscribeMode() resolves initial mode and notifies listener of subsequent modes', async () => {
      const values: PlaybackMode[] = [];
      const initial = await interactiveBridge.subscribeMode((value) =>
        values.push(value),
      );
      expect(initial).to.equal('LIVE');

      await vi.advanceTimersByTimeAsync(6000);
      expect(values).to.deep.equal(['CATCHUP', 'LIVE', 'UNKNOWN', 'VOD']);
    });

    it('subscribeOrientation() (deprecated) resolves current orientation', async () => {
      const values: Orientation[] = [];
      const initial = await interactiveBridge.subscribeOrientation((value) =>
        values.push(value),
      );
      expect(['landscape', 'portrait']).to.include(initial);
    });

    it('subscribePaused() reduces playback state to a boolean', async () => {
      const values: boolean[] = [];
      const initial = await interactiveBridge.subscribePaused((value) =>
        values.push(value),
      );
      expect(initial).to.equal(false);

      await interactiveBridge.pause();
      expect(values).to.deep.equal([true]);
    });

    it('subscribePerformance() resolves undefined initially then notifies of mode changes', async () => {
      const values: PerformanceMode[] = [];
      const initial = await interactiveBridge.subscribePerformance((value) =>
        values.push(value),
      );
      expect(initial).to.equal(undefined);

      await vi.advanceTimersByTimeAsync(2000);
      expect(values).to.deep.equal(['LOW']);

      await vi.advanceTimersByTimeAsync(10_000);
      expect(values).to.deep.equal(['LOW', 'HIGH']);
    });

    it('subscribePlaybackState() resolves initial state and notifies listener of subsequent states', async () => {
      const values: PlaybackState[] = [];
      const initial = await interactiveBridge.subscribePlaybackState((value) =>
        values.push(value),
      );
      expect(initial).to.equal('PLAYING');

      await interactiveBridge.pause();
      expect(values).to.deep.equal(['PAUSED']);
    });

    it('subscribePlaying() reduces playback state to a boolean', async () => {
      const values: boolean[] = [];
      const initial = await interactiveBridge.subscribePlaying((value) =>
        values.push(value),
      );
      expect(initial).to.equal(true);

      await interactiveBridge.pause();
      expect(values).to.deep.equal([false]);
    });

    it('subscribeQualities() resolves initial qualities and notifies listener of changes', async () => {
      const values: Qualities[] = [];
      const initial = await interactiveBridge.subscribeQualities((value) =>
        values.push(value),
      );
      expect(initial.selected).to.equal(0);
      expect(initial.list).to.have.length(3);

      await interactiveBridge.selectQuality(1);
      expect(values[0]?.selected).to.equal(1);
    });

    it('subscribeQuality() (deprecated) resolves initial active quality label', async () => {
      const values: string[] = [];
      const initial = await interactiveBridge.subscribeQuality((value) =>
        values.push(value),
      );
      expect(initial).to.equal('dummy-quality-1');
    });

    it('subscribeStalled() reduces playback state to a boolean', async () => {
      const values: boolean[] = [];
      const initial = await interactiveBridge.subscribeStalled((value) =>
        values.push(value),
      );
      expect(initial).to.equal(false);

      await interactiveBridge.seek(5);
      expect(values).to.deep.equal([true]);

      await vi.advanceTimersByTimeAsync(3000);
      expect(values).to.deep.equal([true, false]);
    });

    it('subscribeStreamPhase() (deprecated) resolves initial phase and notifies listener of subsequent phases', async () => {
      const values: StreamPhase[] = [];
      const initial = await interactiveBridge.subscribeStreamPhase((value) =>
        values.push(value),
      );
      expect(initial).to.equal('POST');

      await vi.advanceTimersByTimeAsync(3000);
      expect(values).to.deep.equal(['PRE']);

      await vi.advanceTimersByTimeAsync(3000);
      expect(values).to.deep.equal(['PRE', 'LIVE']);
    });

    it('subscribeVolume() resolves initial volume state', async () => {
      const initial = await interactiveBridge.subscribeVolume(() => {
        // No changes expected in this test
      });
      expect(initial).to.deep.equal({ muted: true, volume: 1 });
    });
  });

  describe('custom commands', () => {
    it('sendPlayerCommand() resolves with handler return value and calls listener with subsequent values', async () => {
      const values: unknown[] = [];
      const result = await interactiveBridge.sendPlayerCommand(
        'subscribeAuthToken',
        'dummy',
        (value) => values.push(value),
      );
      expect(result).to.equal('dummy-test-token-1');

      await vi.advanceTimersByTimeAsync(3000);
      expect(values).to.deep.equal(['dummy-test-token-2']);

      await vi.advanceTimersByTimeAsync(7000);
      expect(values).to.deep.equal([
        'dummy-test-token-2',
        'dummy-test-token-3',
      ]);
    });

    it('sendPlayerCommand() rejects for an unregistered command name', async () => {
      await expect(
        interactiveBridge.sendPlayerCommand('unknownCommand'),
      ).rejects.toThrow('Unregistered custom command: unknownCommand');
    });

    it('sendPlayerCommand() rejects when handler throws', async () => {
      await expect(
        interactiveBridge.sendPlayerCommand('subscribeAuthToken', 123),
      ).rejects.toThrow('Argument type: number, should be: string');
    });

    it('sendCustomCommand() (deprecated) behaves the same as sendPlayerCommand()', async () => {
      const result = await interactiveBridge.sendCustomCommand(
        'subscribeAuthToken',
        'old',
      );
      expect(result).to.equal('old-test-token-1');
    });

    it('registerInteractiveCommand()/unregisterInteractiveCommand() handle player-sent custom commands', async () => {
      const values: unknown[] = [];
      interactiveBridge.registerInteractiveCommand('greet', (arg, listener) => {
        window.setTimeout(() => listener(`${arg}-later`), 1000);
        return `${arg}-first`;
      });

      const result = await playerBridge.sendInteractiveCommand(
        'greet',
        'hello',
        (value) => values.push(value),
      );
      expect(result).to.equal('hello-first');

      await vi.advanceTimersByTimeAsync(1000);
      expect(values).to.deep.equal(['hello-later']);

      interactiveBridge.unregisterInteractiveCommand('greet');
      await expect(
        playerBridge.sendInteractiveCommand('greet'),
      ).rejects.toThrow('Unregistered custom command: greet');
    });

    it('registerCustomCommand() (deprecated) behaves the same as registerInteractiveCommand()', async () => {
      interactiveBridge.registerCustomCommand(
        'legacyGreet',
        (arg) => `${arg}-handled`,
      );

      const result = await playerBridge.sendInteractiveCommand(
        'legacyGreet',
        'value',
      );
      expect(result).to.equal('value-handled');
    });
  });

  describe('authenticate() and options()', () => {
    it('playerBridge.authenticate() calls handleAuth option with token or claims', async () => {
      // Use local bridges to be able to specify InteractiveBridge options
      const received: unknown[] = [];
      const localPlayerBridge = new MockPlayerBridge();
      new InteractiveBridge(localPlayerBridge, {
        handleAuth: (tokenOrClaims) => received.push(tokenOrClaims),
      });

      await localPlayerBridge.authenticate('jwt-token');
      expect(received).to.deep.equal(['jwt-token']);

      await localPlayerBridge.authenticate(undefined);
      expect(received).to.deep.equal(['jwt-token', undefined]);
    });

    it('playerBridge.authenticate() rejects when handleAuth option is undefined', async () => {
      await expect(playerBridge.authenticate('jwt-token')).rejects.toThrow(
        'handleAuth option undefined',
      );
    });

    it('playerBridge.options() resolves with configured InteractivePlayerOptions', async () => {
      // Use local bridges to be able to specify InteractiveBridge options
      const localPlayerBridge = new MockPlayerBridge();
      new InteractiveBridge(localPlayerBridge, { controlsDisabled: true });

      await expect(localPlayerBridge.options()).resolves.to.deep.equal({
        controlsDisabled: true,
      });
    });

    it('playerBridge.options() resolves with default options when unconfigured', async () => {
      await expect(playerBridge.options()).resolves.to.deep.equal({
        controlsDisabled: false,
      });
    });
  });
});
