import { ZodError, z } from 'zod';

// Note: We can't use z.infer<typeof zSchema> because it results in ugly .d.ts typing that typedoc doesn't support
// We do validate that our types match our schemas using the createValidate<T> template type argument

/**
 * Returns value validation function using specified Zod schema and optional defaults,
 * which in turn returns a type checked value or throw an Error.
 *
 * @param schema - Zod schema to use to parse the value
 * @param defaultValue - Default value to use; if this is an object it will be shallow merged
 */
const createValidate =
  <T>(schema: Zod.ZodSchema<T>, defaultValue?: T) =>
  (value: unknown) => {
    if (defaultValue && value === undefined) {
      return defaultValue;
    }

    try {
      if (
        typeof defaultValue === 'object' &&
        defaultValue !== null &&
        typeof value === 'object' &&
        value !== null
      ) {
        // Note: This just performs a shallow object merge
        return schema.parse({ ...defaultValue, ...value });
      }
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
const zBooleanOrUndefined = z.union([zBoolean, zUndefined]);
const zNumberOrUndefined = z.union([zNumber, zUndefined]);
const zStringOrUndefined = z.union([zString, zUndefined]);
const zStringParams = z.record(zString, zString);

export const validateBoolean = createValidate(zBoolean);
export const validateNumber = createValidate(zNumber);
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

/**
 * ----------------------------------------------------------------
 * Objects
 * ----------------------------------------------------------------
 */

/**
 * Authentication claims.
 *
 * Of these claims the following are externally defined standard OpenID:
 * `sub, updated_at, phone_number_verified, email_verified`
 *
 * And these are user editable standard OpenID:
 * `given_name, family_name, middle_name, preferred_username, picture, email, gender, birthdate, locale, phone_number`
 *
 * And these are Livery specific:
 * `verified, minimum_age`
 *
 * For detailed descriptions see:
 * https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export type AuthClaims = {
  /** Unknown claims. */
  [claim: string]: unknown;
  /** End-User's birthday, represented as an ISO 8601-1 [ISO8601‑1] YYYY-MM-DD format. */
  birthdate?: string;
  /** Custom Livery user property 1. */
  custom1?: string;
  /** Custom Livery user property 2. */
  custom2?: string;
  /** Custom Livery user property 3. */
  custom3?: string;
  /** Custom Livery user property 4. */
  custom4?: string;
  /** Custom Livery user property 5. */
  custom5?: string;
  /** End-User's preferred e-mail address. */
  email?: string;
  /** True if the End-User's e-mail address has been verified; otherwise false. */
  email_verified?: boolean;
  /** Surname(s) or last name(s) of the End-User. */
  family_name?: string;
  /** End-User's gender. */
  gender?: string;
  /** Given name(s) or first name(s) of the End-User. */
  given_name?: string;
  /** End-User's locale, represented as a BCP47 [RFC5646] language tag. */
  locale?: string;
  /** Middle name(s) of the End-User. */
  middle_name?: string;
  /** Age as entered by user for minimum age consideration. */
  minimum_age?: number;
  /** End-User's preferred telephone number. */
  phone_number?: string;
  /** True if the End-User's phone number has been verified; otherwise false. */
  phone_number_verified?: boolean;
  /** URL of the End-User's profile picture. */
  picture?: string;
  /** Shorthand name by which the End-User wishes to be referred to at the RP, such as janedoe or j.doe. */
  preferred_username?: string;
  /** Subject - Identifier for the End-User at the Issuer. */
  sub?: string;
  /** Time the End-User's information was last updated as number of seconds from 1970-01-01T00:00:00Z. */
  updated_at?: number;
  /** True if the user is verified, usually by email or phone number; otherwise false. */
  verified?: boolean;
};

export const validateAuthClaims = createValidate<
  AuthClaims | string | undefined
>(
  z.union([
    zUndefined,
    zString,
    z
      .object({
        birthdate: zStringOrUndefined,
        custom1: zStringOrUndefined,
        custom2: zStringOrUndefined,
        custom3: zStringOrUndefined,
        custom4: zStringOrUndefined,
        custom5: zStringOrUndefined,
        email: zStringOrUndefined,
        email_verified: zBooleanOrUndefined,
        family_name: zStringOrUndefined,
        gender: zStringOrUndefined,
        given_name: zStringOrUndefined,
        locale: zStringOrUndefined,
        middle_name: zStringOrUndefined,
        minimum_age: zNumberOrUndefined,
        phone_number: zStringOrUndefined,
        phone_number_verified: zBooleanOrUndefined,
        picture: zStringOrUndefined,
        preferred_username: zStringOrUndefined,
        sub: zStringOrUndefined,
        updated_at: zNumberOrUndefined,
        verified: zBooleanOrUndefined,
      })
      .passthrough(),
  ]),
);

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
 * Options from interactive layer for the player.
 */
export type InteractivePlayerOptions = {
  /** True if default player controls should be disabled to use custom controls instead, false otherwise. */
  controlsDisabled: boolean;
};

export const validateInteractivePlayerOptions =
  createValidate<InteractivePlayerOptions>(
    z.object({
      controlsDisabled: zBoolean,
    }),
    {
      controlsDisabled: false,
    },
  );

/**
 * Options from player for the interactive layer.
 */
export type PlayerInteractiveOptions = {
  /** Player application name. */
  appName: string;
  /** Player Pinpoint analytics endpoint id. */
  endpointId: string;
  /**
   * An object of key-value string parameters from player.
   *
   * Android and iOS players will call a callback and pass on the returned values.
   *
   * The web player will return all 'livery_' prefixed query parameters with:
   *
   * - The prefix stripped from the names (snake_case will not be converted to camelCase)
   * - Parameter names and values URL decoded
   * - Empty string (not `null`) values for parameters without a value
   * - Only the first value of a repeated parameter (no multiple value array support)
   *
   * So given location.search: `'?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2'`
   * this will return: `{ 'foo:bar': 'hey you', no_val: '', multi: '1' }`.
   */
  liveryParams: Record<string, string>;
  /** Player version. */
  playerVersion: string;
  /** Player stream id. */
  streamId: string;
};

export const validatePlayerInteractiveOptions =
  createValidate<PlayerInteractiveOptions>(
    z.object({
      appName: zString,
      endpointId: zString,
      liveryParams: zStringParams,
      playerVersion: zString,
      streamId: zString,
    }),
    // For any future options add default values here for backwards compatibility
    // {
    // },
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
