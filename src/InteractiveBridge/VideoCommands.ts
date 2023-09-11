// eslint-disable-next-line max-classes-per-file
import type { LiveryBridge } from '../LiveryBridge';
import { Subscriber } from '../util/Subscriber';
import { AirplayParser } from './AirplayParser';
import { ChromecastParser } from './ChromecastParser';
import { ControlsParser, type Controls } from './ControlsParser';
import { ErrorParser } from './ErrorParser';
import type { Feature } from './FeaturesParser';
import { FeaturesParser } from './FeaturesParser';
import { MutedParser } from './MutedParser';
import { PictureInPictureParser } from './PictureInPictureParser';
import type { PlaybackMode } from './PlaybackModeParser';
import { PlaybackModeParser } from './PlaybackModeParser';
import { PlaybackParser } from './PlaybackParser';
import { PlaybackStateParser, type PlaybackState } from './PlaybackStateParser';
import type { Quality } from './QualitiesParser';
import { QualitiesParser } from './QualitiesParser';
import {
  StreamPhaseTimelineParser,
  type StreamPhaseTimeline,
} from './StreamPhaseTimelineParser';
import { UnmuteRequiresInteractionParser } from './UnmuteRequiresInteractionParser';

export class VideoCommands {
  private airplaySubscriber: Subscriber<boolean, boolean>;

  private chromecastSubscriber: Subscriber<
    string | undefined,
    string | undefined
  >;

  private controlsSubscriber: Subscriber<Controls, Controls>;

  private errorSubscriber: Subscriber<string | undefined, string | undefined>;

  private mutedSubscriber: Subscriber<boolean, boolean>;

  private pictureInPictureSubscriber: Subscriber<boolean, boolean>;

  private playbackModeSubscriber: Subscriber<PlaybackMode, PlaybackMode>;

  private playbackStateSubscriber: Subscriber<PlaybackState, PlaybackState>;

  private qualitiesSubscriber: Subscriber<(Quality | undefined)[], Quality[]>;

  private sendCommand: LiveryBridge['sendCommand'];

  private streamPhaseTimelineSubscriber: Subscriber<
    StreamPhaseTimeline,
    StreamPhaseTimeline
  >;

  private unmuteRequiresInteractionSubscription: Subscriber<boolean, boolean>;

  constructor(sendCommand: LiveryBridge['sendCommand']) {
    this.sendCommand = sendCommand;
    this.airplaySubscriber = new Subscriber(
      'subscribeAirplay',
      new AirplayParser(),
      this.sendCommand.bind(this),
    );
    this.chromecastSubscriber = new Subscriber(
      'subscribeChromecast',
      new ChromecastParser(),
      this.sendCommand.bind(this),
    );
    this.controlsSubscriber = new Subscriber(
      'subscribeControls',
      new ControlsParser(),
      this.sendCommand.bind(this),
    );
    this.errorSubscriber = new Subscriber(
      'subscribeError',
      new ErrorParser(),
      this.sendCommand.bind(this),
    );
    this.mutedSubscriber = new Subscriber(
      'subscribeMuted',
      new MutedParser(),
      this.sendCommand.bind(this),
    );
    this.pictureInPictureSubscriber = new Subscriber(
      'subscribePictureInPicture',
      new PictureInPictureParser(),
      this.sendCommand.bind(this),
    );
    this.playbackModeSubscriber = new Subscriber(
      'subscribePlaybackMode',
      new PlaybackModeParser(),
      this.sendCommand.bind(this),
    );
    this.playbackStateSubscriber = new Subscriber(
      'subscribePlaybackState',
      new PlaybackStateParser(),
      this.sendCommand.bind(this),
    );
    this.qualitiesSubscriber = new Subscriber(
      'subscribeQualities',
      new QualitiesParser(),
      this.sendCommand.bind(this),
    );
    this.streamPhaseTimelineSubscriber = new Subscriber(
      'subscribeStreamPhaseTimeline',
      new StreamPhaseTimelineParser(),
      this.sendCommand.bind(this),
    );
    this.unmuteRequiresInteractionSubscription = new Subscriber(
      'subscribeUnmuteRequiresInteraction',
      new UnmuteRequiresInteractionParser(),
      this.sendCommand.bind(this),
    );
  }

  /**
   * Returns a list of features supported by the video player
   */
  getFeatures(): Promise<Feature[]> {
    return this.sendCommand('getFeatures').then((value) =>
      new FeaturesParser().parse(value),
    );
  }

  /**
   * Returns current playback:
   *  - buffer in seconds ahead of current position
   *  - duration in seconds from start to end of VOD or live stream (e.g: continuously increasing)
   *  - position in seconds since start of stream
   */
  getPlayback(): Promise<{
    buffer: number;
    duration: number;
    position: number;
  }> {
    return this.sendCommand('getPlayback').then((value) =>
      new PlaybackParser().parse(value),
    );
  }

  /**
   *
   */
  pause() {
    return this.sendCommand('pause');
  }

  /**
   * Can require direct user interaction
   * If starting unmuted playback fails this will fall back to muted playback
   * and notify subscribeUnmuteRequiresInteraction listeners.
   */
  play() {
    return this.sendCommand('play');
  }

  /**
   * Reloads player, e.g: to try to recover from an error
   */
  reload() {
    return this.sendCommand('reload');
  }

  /**
   *
   * Seek to specified position in seconds since start of stream/vod
   * If position is not within a LIVE stream phase period this will return an error
   */
  seek(position: number) {
    return this.sendCommand('seek', position);
  }

  /**
   * Select index of quality to play, or -1 to use ABR
   */
  selectQuality(index: number) {
    return this.sendCommand('selectQuality', index);
  }

  /**
   *
   */
  setAirplay(active: boolean) {
    return this.sendCommand('setAirplay', active);
  }

  /**
   *
   */
  setChromecast(active: boolean) {
    return this.sendCommand('setChromecast', active);
  }

  /**
   * Can require direct user interaction
   */
  setFullscreen(active: boolean) {
    return this.sendCommand('setFullscreen', active);
  }

  /**
   * Can require direct user interaction
   */
  setMuted(muted: boolean) {
    return this.sendCommand('setMuted', muted);
  }

  /**
   * Can require direct user interaction
   */
  setPictureInPicture(active: boolean) {
    return this.sendCommand('setPictureInPicture', active);
  }

  /**
   * Returns true when Airplay is being used, false otherwise
   */
  subscribeAirplay(listener: (value: boolean) => void) {
    return this.airplaySubscriber.subscribe(listener);
  }

  /**
   * Returns name of device that is being cast to or undefined
   */
  subscribeChromecast(listener: (value: string | undefined) => void) {
    return this.chromecastSubscriber.subscribe(listener);
  }

  /**
   * Where Controls is an object with boolean properties:
   * cast, contact, error, fullscreen, mute, pip, play, quality, scrubber
   */
  subscribeControls(listener: (value: Controls) => void) {
    return this.controlsSubscriber.subscribe(listener);
  }

  /**
   * Current player error message or undefined if none
   */
  subscribeError(listener: (value: string | undefined) => void) {
    return this.errorSubscriber.subscribe(listener);
  }

  subscribeMuted(listener: (value: boolean) => void) {
    return this.mutedSubscriber.subscribe(listener);
  }

  subscribePictureInPicture(listener: (value: boolean) => void) {
    return this.pictureInPictureSubscriber.subscribe(listener);
  }

  /**
   * Returns current mode of playback, e.g: buffering, syncing, ABR, stall management, etc.
   */
  subscribePlaybackMode(listener: (value: PlaybackMode) => void) {
    return this.playbackModeSubscriber.subscribe(listener);
  }

  /**
   * Stalled (loading) states are: 'BUFFERING', 'SEEKING'
   * Paused states are: 'ENDED', 'PAUSED'
   * Playing states are: 'FAST_FORWARD', 'PLAYING', 'REWIND', 'SLOW_MO'
   * Though practically we only use 'PLAYING' for now
   */
  subscribePlaybackState(listener: (value: PlaybackState) => void) {
    return this.playbackStateSubscriber.subscribe(listener);
  }

  /**
   * Note that the existing subscribeQuality method only returns the label
   * of the current playback quality. Assuming that that should be unique
   * I think it will already suffice to create a qualities list that shows
   * the currently active quality. Otherwise we’ll have to also add a
   * subscribeQualityIndex method or so that returns the index of the quality
   * in the list of qualities returned by subscribeQualities.
   */
  subscribeQualities(listener: (value: Quality[]) => void) {
    return this.qualitiesSubscriber.subscribe(listener);
  }

  /**
   * This indicates the LIVE periods of the stream that can be seeked to
   * I.e: from the start of LIVE timestamp to the first non-LIVE timestamp
   */
  subscribeStreamPhaseTimeline(listener: (value: StreamPhaseTimeline) => void) {
    return this.streamPhaseTimelineSubscriber.subscribe(listener);
  }

  /**
   *
   * If true then unmuting playback requires user interaction,
   * e.g: setMuted() should be called directly from a 'click' event listener.
   * In this case the web player currently shows a special unmute button
   * to highlight this fact to users and facilitate unmuting.
   */
  subscribeUnmuteRequiresInteraction(listener: (value: boolean) => void) {
    return this.unmuteRequiresInteractionSubscription.subscribe(listener);
  }
}
