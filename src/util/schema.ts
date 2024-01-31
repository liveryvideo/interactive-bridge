import { z } from 'zod';

const booleanSchema = z.boolean();

const numberSchema = z.number();

const stringSchema = z.string();

const undefinedSchema = z.undefined();

const stringOrUndefined = z.union([stringSchema, undefinedSchema]);

export const validateBoolean = (value: unknown) => booleanSchema.parse(value);

export const validateNumber = (value: unknown) => numberSchema.parse(value);

export const validateString = (value: unknown) => stringSchema.parse(value);

export const validateStringOrUndefined = (value: unknown) =>
  stringOrUndefined.parse(value);

export const zDisplayMode = z.union([
  z.literal('AIRPLAY'),
  z.literal('CHROMECAST'),
  z.literal('DEFAULT'),
  z.literal('FULLSCREEN'),
  z.literal('PIP'),
]);

export type DisplayMode = z.infer<typeof zDisplayMode>;

export const zFeatures = z.object({
  airplay: booleanSchema,
  chromecast: booleanSchema,
  contact: booleanSchema,
  fullscreen: booleanSchema,
  pip: booleanSchema,
  scrubber: booleanSchema,
});

export type Features = z.infer<typeof zFeatures>;

export const zFeature = zFeatures.keyof();

export const zLiveryParams = z.record(stringSchema);

export const zOrientation = z.union([
  z.literal('landscape'),
  z.literal('portrait'),
]);

export type Orientation = z.infer<typeof zOrientation>;

export const zPlaybackDetails = z.object({
  buffer: numberSchema,
  duration: numberSchema,
  latency: numberSchema,
  position: numberSchema,
});

export type PlaybackDetails = z.infer<typeof zPlaybackDetails>;

export const zPlaybackDetail = zPlaybackDetails.keyof();

export const zPlaybackMode = z.union([
  z.literal('CATCHUP'),
  z.literal('LIVE'),
  z.literal('UNKNOWN'),
  z.literal('VOD'),
]);

export type PlaybackMode = z.infer<typeof zPlaybackMode>;

export const zPlaybackState = z.union([
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

export const zQuality = z
  .object({
    audio: z.object({
      bandwidth: numberSchema,
    }),
    label: stringSchema,
    video: z.object({
      bandwidth: numberSchema,
      height: numberSchema,
      width: numberSchema,
    }),
  })
  .partial({
    audio: true,
    video: true,
  });

export const zQualities = z.object({
  active: numberSchema,
  list: z.array(zQuality),
  selected: numberSchema,
});

export type Qualities = z.infer<typeof zQualities>;

export const zStreamPhase = z.union([
  z.literal('LIVE'),
  z.literal('POST'),
  z.literal('PRE'),
]);

export type StreamPhase = z.infer<typeof zStreamPhase>;

export const zStreamPhases = z.record(zStreamPhase);

export const zControls = z.object({
  cast: booleanSchema,
  contact: booleanSchema,
  error: booleanSchema,
  fullscreen: booleanSchema,
  mute: booleanSchema,
  pip: booleanSchema,
  play: booleanSchema,
  quality: booleanSchema,
  scrubber: booleanSchema,
});

export type Controls = z.infer<typeof zControls>;

export const zConfig = z.object({
  controls: zControls,
  customerId: stringSchema,
  streamPhase: zStreamPhase,
  streamPhases: zStreamPhases,
  tenantId: stringSchema,
});

export type Config = z.infer<typeof zConfig>;

export const zUserFeedback = z.object({
  comments: stringSchema,
  email: stringSchema,
  name: stringSchema,
});

export type UserFeedback = z.infer<typeof zUserFeedback>;
