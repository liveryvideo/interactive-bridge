import { ZodError, z } from 'zod';

// Note: We can't use z.infer<typeof zSchema> because it results in ugly .d.ts typing that typedoc doesn't support
// We do validate that our types match our schemas using the createValidate<T> template type argument

const createValidate =
  <T>(schema: Zod.ZodSchema<T>) =>
  (value: unknown) => {
    try {
      return schema.parse(value);
    } catch (error: unknown) {
      if (!(error instanceof ZodError)) {
        throw new Error('Schema parse error not a ZodError');
      }
      // Note: I tried zod-validation-error but it didn't work
      // This is my own attempt at something like it
      throw new Error(
        error.issues
          .map((issue) => {
            const path = issue.path.join('.');
            return `${path ? `${path}: ` : ''}${issue.message}`;
          })
          .join('; '),
      );
    }
  };

/**
 * ----------------------------------------------------------------
 * Primitives
 * ----------------------------------------------------------------
 */

const zBoolean = z.boolean();
const zNumber = z.number();
const zNumberOrNan = z.union([z.number(), z.nan()]);
const zString = z.string();
const zUndefined = z.undefined();
const zStringOrUndefined = z.union([zString, zUndefined]);
const zStringParams = z.record(zString, zString);

export const validateBoolean = createValidate(zBoolean);
export const validateNumber = createValidate(zNumber);
export const validateNumberOrNan = createValidate(zNumberOrNan);
export const validateString = createValidate(zString);
export const validateStringOrUndefined = createValidate(zStringOrUndefined);
export const validateStringParams =
  createValidate<Record<string, string>>(zStringParams);

/**
 * ----------------------------------------------------------------
 * String Unions
 * ----------------------------------------------------------------
 */

/**
 * Mode of display for player and/or video, i.e:
 *
 * - `'DEFAULT'` for default display in the web page
 * - `'FULLSCREEN'` for fullscreen display
 * - `'PIP'` for picture-in-picture display of the video (the interactive layer remains in the page)
 * - `'AIRPLAY'` for Airplay display of the video (not yet supported by web player)
 * - `'CHROMECAST'` for Chromecast display of the video (not yet supported by web player)
 */
export type DisplayMode =
  | 'AIRPLAY'
  | 'CHROMECAST'
  | 'DEFAULT'
  | 'FULLSCREEN'
  | 'PIP';

export const validateDisplayMode = createValidate<DisplayMode>(
  z.union([
    z.literal('AIRPLAY'),
    z.literal('CHROMECAST'),
    z.literal('DEFAULT'),
    z.literal('FULLSCREEN'),
    z.literal('PIP'),
  ]),
);

/**
 * Player window orientation (`'landscape' \| 'portrait'`).
 *
 * @deprecated Will be removed in the next major version
 */
export type Orientation = 'landscape' | 'portrait';

export const validateOrientation = createValidate<Orientation>(
  z.union([z.literal('landscape'), z.literal('portrait')]),
);

/**
 * Mode of playback, e.g. how to buffer, sync, adapt quality, manage stalls, etc.
 *
 * - `'CATCHUP'` stream at increased live latency, i.e. after seeking to catch up to missed content
 * - `'LIVE'` stream at default live target latency
 * - `'UNKNOWN'` while state is unknown, e.g: during startup
 * - `'VOD'` stream video on demand
 */
export type PlaybackMode = 'CATCHUP' | 'LIVE' | 'UNKNOWN' | 'VOD';

export const validatePlaybackMode = createValidate<PlaybackMode>(
  z.union([
    z.literal('CATCHUP'),
    z.literal('LIVE'),
    z.literal('UNKNOWN'),
    z.literal('VOD'),
  ]),
);

/**
 * Playback state, i.e:
 *
 * - `'BUFFERING'` while waiting for buffer to fill before being able to play
 * - `'ENDED'` after video has ended
 * - `'FAST_FORWARD'` while playing at an increased rate
 * - `'PAUSED'` while playback has been paused
 * - `'PLAYING'` while playing
 * - `'REWIND'` while playing at a negative rate (in reverse)
 * - `'SEEKING'` while waiting for buffer after seeking
 * - `'SLOW_MO'` while playing a decreased rate
 */
export type PlaybackState =
  | 'BUFFERING'
  | 'ENDED'
  | 'FAST_FORWARD'
  | 'PAUSED'
  | 'PLAYING'
  | 'REWIND'
  | 'SEEKING'
  | 'SLOW_MO';

export const validatePlaybackState = createValidate<PlaybackState>(
  z.union([
    z.literal('BUFFERING'),
    z.literal('ENDED'),
    z.literal('FAST_FORWARD'),
    z.literal('PAUSED'),
    z.literal('PLAYING'),
    z.literal('REWIND'),
    z.literal('SEEKING'),
    z.literal('SLOW_MO'),
  ]),
);

/**
 * Livery stream phase, e.g: PRE/LIVE/POST before/while/after streaming to viewers.
 */
export type StreamPhase = 'LIVE' | 'POST' | 'PRE';

const zStreamPhase = z.union([
  z.literal('LIVE'),
  z.literal('POST'),
  z.literal('PRE'),
]);

export const validateStreamPhase = createValidate<StreamPhase>(zStreamPhase);

/**
 * ----------------------------------------------------------------
 * Objects
 * ----------------------------------------------------------------
 */

/**
 * Public part of Livery stream config.
 */
export type Config = {
  /** Registry of controls that should be shown to the user. */
  controls: {
    /** Enable toggling AirPlay and/or Chromecast display. */
    cast: boolean;
    /** Enable submitting user feedback. */
    contact: boolean;
    /** Enable error feedback and recovery controls. */
    error: boolean;
    /** Enable toggling fullscreen display. */
    fullscreen: boolean;
    /** Enable muting and unmuting audio. */
    mute: boolean;
    /** Enable toggling picture-in-picture display. */
    pip: boolean;
    /** Enable toggling play/pause. */
    play: boolean;
    /** Enable quality selection. */
    quality: boolean;
    /** Enable seeking through the stream. */
    scrubber: boolean;
  };
  /** Livery customer ID. */
  customerId: string;
  /** Livery stream phase, i.e: PRE/LIVE/POST before/while/after streaming to viewers. */
  streamPhase: StreamPhase;
  /** Array of [unixTimestamp, streamPhase] tuples listing the times at which those phases started. */
  streamPhases: [number, StreamPhase][];
  /** Livery tenant ID. */
  tenantId: string;
};

export const validateConfig = createValidate<Config>(
  z.object({
    controls: z.object({
      cast: zBoolean,
      contact: zBoolean,
      error: zBoolean,
      fullscreen: zBoolean,
      mute: zBoolean,
      pip: zBoolean,
      play: zBoolean,
      quality: zBoolean,
      scrubber: zBoolean,
    }),
    customerId: zString,
    streamPhase: zStreamPhase,
    streamPhases: z.array(z.tuple([zNumber, zStreamPhase])),
    tenantId: zString,
  }),
);

/**
 * Registry of features supported by the player in general and under given circumstances.
 */
export type Features = {
  airplay: boolean;
  chromecast: boolean;
  contact: boolean;
  fullscreen: boolean;
  pip: boolean;
  scrubber: boolean;
  volume: boolean;
};

export const validateFeatures = createValidate<Features>(
  z.object({
    airplay: zBoolean,
    chromecast: zBoolean,
    contact: zBoolean,
    fullscreen: zBoolean,
    pip: zBoolean,
    scrubber: zBoolean,
    volume: zBoolean,
  }),
);

/**
 * Playback details, i.e: values that are continuously changing.
 */
export type PlaybackDetails = {
  /** Current playback buffer in seconds ahead of current position. */
  buffer: number;
  /** Current playback duration in seconds from start to end of live stream or VOD. */
  duration: number;
  /** Current end-to-end latency in seconds. */
  latency: number;
  /** Current playback position in seconds since start of live stream or VOD. */
  position: number;
};

export const validatePlaybackDetails = createValidate<PlaybackDetails>(
  z.object({
    buffer: zNumberOrNan,
    duration: zNumberOrNan,
    latency: zNumberOrNan,
    position: zNumberOrNan,
  }),
);

/**
 * Stream audio and video quality.
 */
export type Quality = {
  /** Audio quality. */
  audio?: {
    /** Audio bandwidth in bits per second. */
    bandwidth: number;
  };
  /** Quality label. If video height is unique: ‘[height]p’ else ‘[bandwidth/1000]k’. */
  label: string;
  /** Video quality. */
  video?: {
    /** Video andwidth in bits per second. */
    bandwidth: number;
    /** Video height in pixels. */
    height: number;
    /** Video width in pixels. */
    width: number;
  };
};

/**
 * Stream qualities.
 */
export type Qualities = {
  /** Index of quality that is being played, or -1 if no quality is active yet. */
  active: number;
  /** List of qualities that can be played. */
  list: Quality[];
  /** Index of quality that is selected to be played, or -1 if ABR is used. */
  selected: number;
};

export const validateQualities = createValidate<Qualities>(
  z.object({
    active: zNumber,
    list: z.array(
      z.object({
        audio: z.union([
          z.object({
            bandwidth: zNumber,
          }),
          zUndefined,
        ]),
        label: zString,
        video: z.union([
          z.object({
            bandwidth: zNumber,
            height: zNumber,
            width: zNumber,
          }),
          zUndefined,
        ]),
      }),
    ),
    selected: zNumber,
  }),
);

/**
 * Player volume state.
 */
export type Volume = {
  /** If true then audio is muted. */
  muted: boolean;
  /** Audio volume, from `0.0` (silent) to `1.0` (loudest). */
  volume: number;
};

export const validateVolume = createValidate<Volume>(
  z.object({ muted: zBoolean, volume: zNumber }),
);

/**
 * User feedback.
 */
export type UserFeedback = {
  /** User feedback comments. */
  comments: string;
  /** User email. */
  email: string;
  /** User name. */
  name: string;
};

export const validateUserFeedback = createValidate<UserFeedback>(
  z.object({ comments: zString, email: zString, name: zString }),
);
