import { z } from 'zod';

// TODO: TSDoc exported types (and their properties) since they are re-exported by this package from index.ts

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

export type Features = z.infer<typeof zFeatures>;

export const validateFeatures = createValidate(zFeatures);

const zLiveryParams = z.record(zString, zString);

export const validateLiveryParams = createValidate(zLiveryParams);

const zOrientation = z.union([z.literal('landscape'), z.literal('portrait')]);

/** @deprecated Will be removed in the next major version */
export type Orientation = z.infer<typeof zOrientation>;

export const validateOrientation = createValidate(zOrientation);

const zPlaybackDetails = z.object({
  buffer: zNumber,
  duration: zNumber,
  latency: zNumber,
  position: zNumber,
});

export type PlaybackDetails = z.infer<typeof zPlaybackDetails>;

export const validatePlaybackDetails = createValidate(zPlaybackDetails);

const zPlaybackMode = z.union([
  z.literal('CATCHUP'),
  z.literal('LIVE'),
  z.literal('UNKNOWN'),
  z.literal('VOD'),
]);

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

export type PlaybackState = z.infer<typeof zPlaybackState>;

export const validatePlaybackState = createValidate(zPlaybackState);

const zQualities = z.object({
  active: zNumber,
  list: z.array(
    z
      .object({
        audio: z.object({
          bandwidth: zNumber,
        }),
        label: zString,
        video: z.object({
          bandwidth: zNumber,
          height: zNumber,
          width: zNumber,
        }),
      })
      .partial({
        audio: true,
        video: true,
      }),
  ),
  selected: zNumber,
});

export type Qualities = z.infer<typeof zQualities>;

export const validateQualities = createValidate(zQualities);

const zStreamPhase = z.union([
  z.literal('LIVE'),
  z.literal('POST'),
  z.literal('PRE'),
]);

/** @deprecated Instead use {@link Config}.streamPhase */
export type StreamPhase = z.infer<typeof zStreamPhase>;

export const validateStreamPhase = createValidate(zStreamPhase);

const zConfig = z.object({
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
  streamPhases: z.record(zNumber, zStreamPhase),
  tenantId: zString,
});

export type Config = z.infer<typeof zConfig>;

export const validateConfig = createValidate(zConfig);

const zUserFeedback = z.object({
  comments: zString,
  email: zString,
  name: zString,
});

export type UserFeedback = z.infer<typeof zUserFeedback>;

export const validateUserFeedback = createValidate(zUserFeedback);
