import { z } from 'zod';

const createValidate =
  <T>(schema: Zod.ZodSchema<T>) =>
  (value: unknown) =>
    schema.parse(value);

const zBoolean = z.boolean();
const zNumber = z.number();
const zString = z.string();
const zUndefined = z.undefined();
const zStringOrUndefined = z.union([zString, zUndefined]);

export const validateBoolean = createValidate(zBoolean);
export const validateNumber = createValidate(zNumber);
export const validateString = createValidate(zString);
export const validateStringOrUndefined = createValidate(zStringOrUndefined);

const zDisplayMode = z.union([
  z.literal('AIRPLAY'),
  z.literal('CHROMECAST'),
  z.literal('DEFAULT'),
  z.literal('FULLSCREEN'),
  z.literal('PIP'),
]);

/**
 * Mode of display for player and/or video, i.e:
 * - `'DEFAULT'` for default display in the web page
 * - `'FULLSCREEN'` for fullscreen display
 * - `'PIP'` for picture-in-picture display of the video (the interactive layer remains in the page)
 * - `'AIRPLAY'` for Airplay display of the video (not yet supported by web player)
 * - `'CHROMECAST'` for Chromecast display of the video (not yet supported by web player)
 */
export type DisplayMode = z.infer<typeof zDisplayMode>;

export const validateDisplayMode = createValidate(zDisplayMode);

const zFeatures = z.object({
  airplay: zBoolean,
  chromecast: zBoolean,
  contact: zBoolean,
  fullscreen: zBoolean,
  pip: zBoolean,
  scrubber: zBoolean,
});

/**
 * Registry of features supported by the player in general and under given circumstances.
 */
export type Features = z.infer<typeof zFeatures>;

export const validateFeatures = createValidate(zFeatures);

const zLiveryParams = z.record(zString, zString);

export const validateLiveryParams = createValidate(zLiveryParams);

const zOrientation = z.union([z.literal('landscape'), z.literal('portrait')]);

/**
 * Player window orientation (`'landscape' \| 'portrait'`).
 *
 * @deprecated Will be removed in the next major version
 */
export type Orientation = z.infer<typeof zOrientation>;

export const validateOrientation = createValidate(zOrientation);

const zPlaybackDetails = z.object({
  /** Current playback buffer in seconds ahead of current position. */
  buffer: zNumber,
  /** Current playback duration in seconds from start to end of live stream or VOD. */
  duration: zNumber,
  /** Current end-to-end latency in seconds. */
  latency: zNumber,
  /** Current playback position in seconds since start of live stream or VOD. */
  position: zNumber,
});

/**
 * Playback details, i.e: values that are continuously changing.
 */
export type PlaybackDetails = z.infer<typeof zPlaybackDetails>;

export const validatePlaybackDetails = createValidate(zPlaybackDetails);

const zPlaybackMode = z.union([
  z.literal('CATCHUP'),
  z.literal('LIVE'),
  z.literal('UNKNOWN'),
  z.literal('VOD'),
]);

/**
 * Mode of playback, e.g. how to buffer, sync, adapt quality, manage stalls, etc.
 * - `'CATCHUP'` stream at increased live latency, i.e. after seeking to catch up to missed content
 * - `'LIVE'` stream at default live target latency
 * - `'UNKNOWN'` while state is unknown, e.g: during startup
 * - `'VOD'` stream video on demand
 */
export type PlaybackMode = z.infer<typeof zPlaybackMode>;

export const validatePlaybackMode = createValidate(zPlaybackMode);

const zPlaybackState = z.union([
  z.literal('BUFFERING'),
  z.literal('ENDED'),
  z.literal('FAST_FORWARD'),
  z.literal('PAUSED'),
  z.literal('PLAYING'),
  z.literal('REWIND'),
  z.literal('SEEKING'),
  z.literal('SLOW_MO'),
]);

/**
 * Playback state, i.e:
 * - `'BUFFERING'` while waiting for buffer to fill before being able to play
 * - `'ENDED'` after video has ended
 * - `'FAST_FORWARD'` while playing at an increased rate
 * - `'PAUSED'` while playback has been paused
 * - `'PLAYING'` while playing
 * - `'REWIND'` while playing at a negative rate (in reverse)
 * - `'SEEKING'` while waiting for buffer after seeking
 * - `'SLOW_MO'` while playing a decreased rate
 */
export type PlaybackState = z.infer<typeof zPlaybackState>;

export const validatePlaybackState = createValidate(zPlaybackState);

const zQualities = z.object({
  /** Index of quality that is being played, or -1 if no quality is active yet. */
  active: zNumber,
  /** List of qualities that can be played. */
  list: z.array(
    /** An audio and video quality tuple for quality selection. */
    z.object({
      /** Audio quality. */
      audio: z.union([
        z.object({
          /** Audio bandwidth in bits per second. */
          bandwidth: zNumber,
        }),
        zUndefined,
      ]),
      /** Quality label. If video height is unique: ‘[height]p’ else ‘[bandwidth/1000]k’. */
      label: zString,
      /** Video quality. */
      video: z.union([
        z.object({
          /** Video andwidth in bits per second. */
          bandwidth: zNumber,
          /** Video height in pixels. */
          height: zNumber,
          /** Video width in pixels. */
          width: zNumber,
        }),
        zUndefined,
      ]),
    }),
  ),
  /** Index of quality that is selected to be played, or -1 if ABR is used. */
  selected: zNumber,
});

/**
 * Stream qualities.
 */
export type Qualities = z.infer<typeof zQualities>;

export const validateQualities = createValidate(zQualities);

const zStreamPhase = z.union([
  z.literal('LIVE'),
  z.literal('POST'),
  z.literal('PRE'),
]);

/**
 * Livery stream phase, e.g: PRE/LIVE/POST before/while/after streaming to viewers.
 *
 * @deprecated Instead use {@link Config}.streamPhase
 */
export type StreamPhase = z.infer<typeof zStreamPhase>;

export const validateStreamPhase = createValidate(zStreamPhase);

const zConfig = z.object({
  /** Registry of controls that should be shown to the user. */
  controls: z.object({
    /** Enable toggling AirPlay and/or Chromecast display. */
    cast: zBoolean,
    /** Enable submitting user feedback. */
    contact: zBoolean,
    /** Enable error feedback and recovery controls. */
    error: zBoolean,
    /** Enable toggling fullscreen display. */
    fullscreen: zBoolean,
    /** Enable muting and unmuting audio. */
    mute: zBoolean,
    /** Enable toggling picture-in-picture display. */
    pip: zBoolean,
    /** Enable toggling play/pause. */
    play: zBoolean,
    /** Enable quality selection. */
    quality: zBoolean,
    /** Enable seeking through the stream. */
    scrubber: zBoolean,
  }),
  /** Livery customer ID. */
  customerId: zString,
  /** Livery stream phase, i.e: PRE/LIVE/POST before/while/after streaming to viewers. */
  streamPhase: zStreamPhase,
  /** Array of [unixTimestamp, streamPhase] tuples listing the times at which those phases started. */
  streamPhases: z.array(z.tuple([zNumber, zStreamPhase])),
  /** Livery tenant ID. */
  tenantId: zString,
});

/**
 * Public part of Livery stream config.
 */
export type Config = z.infer<typeof zConfig>;

export const validateConfig = createValidate(zConfig);

const zUserFeedback = z.object({
  /** User feedback comments. */
  comments: zString,
  /** User email. */
  email: zString,
  /** User name. */
  name: zString,
});

/**
 * User feedback.
 */
export type UserFeedback = z.infer<typeof zUserFeedback>;

export const validateUserFeedback = createValidate(zUserFeedback);
