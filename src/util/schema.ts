import { z } from 'zod';

export const booleanSchema = z.boolean();

export const validateBoolean = (value: unknown) => booleanSchema.parse(value);

export const numberSchema = z.number();

export const validateNumber = (value: unknown) => numberSchema.parse(value);

export const stringSchema = z.string();

export const validateString = (value: unknown) => stringSchema.parse(value);

export const undefinedSchema = z.undefined();

export const validateUndefined = (value: unknown) =>
  undefinedSchema.parse(value);

export const stringOrUndefined = z.union([stringSchema, undefinedSchema]);

export const validateStringOrUndefined = (value: unknown) =>
  stringOrUndefined.parse(value);

export const displayMode = z.union([
  z.literal('AIRPLAY'),
  z.literal('CHROMECAST'),
  z.literal('DEFAULT'),
  z.literal('FULLSCREEN'),
  z.literal('PIP'),
]);

export type DisplayMode = z.infer<typeof displayMode>;

export const features = z.object({
  airplay: booleanSchema,
  chromecast: booleanSchema,
  contact: booleanSchema,
  fullscreen: booleanSchema,
  pip: booleanSchema,
  scrubber: booleanSchema,
});

export type Features = Required<z.infer<typeof features>>;

export const feature = features.keyof();

export type Feature = z.infer<typeof feature>;

export const liveryParams = z.record(stringSchema);

export type LiveryParams = z.infer<typeof liveryParams>;

export const orientation = z.union([
  z.literal('landscape'),
  z.literal('portrait'),
]);

export type Orientation = z.infer<typeof orientation>;

export const playbackDetails = z.object({
  buffer: numberSchema,
  duration: numberSchema,
  latency: numberSchema,
  position: numberSchema,
});

export type PlaybackDetails = z.infer<typeof playbackDetails>;

export const playbackDetail = playbackDetails.keyof();

export type PlaybackDetail = z.infer<typeof playbackDetail>;

export const playbackMode = z.union([
  z.literal('CATCHUP'),
  z.literal('LIVE'),
  z.literal('UNKNOWN'),
  z.literal('VOD'),
]);

export type PlaybackMode = z.infer<typeof playbackMode>;

export const pausedState = z.union([z.literal('ENDED'), z.literal('PAUSED')]);

export type PausedState = z.infer<typeof pausedState>;

export const playingState = z.union([
  z.literal('FAST_FORWARD'),
  z.literal('PLAYING'),
  z.literal('REWIND'),
  z.literal('SLOW_MO'),
]);

export type PlayingState = z.infer<typeof playingState>;

export const stalledState = z.union([
  z.literal('BUFFERING'),
  z.literal('SEEKING'),
]);

export type StalledState = z.infer<typeof stalledState>;

export const playbackState = z.union([pausedState, playingState, stalledState]);

export type PlaybackState = z.infer<typeof playbackState>;

export const quality = z
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

export type Quality = z.infer<typeof quality>;

export const qualities = z.object({
  active: numberSchema,
  list: z.array(quality),
  selected: numberSchema,
});

export type Qualities = z.infer<typeof qualities>;

export const streamPhase = z.union([
  z.literal('LIVE'),
  z.literal('POST'),
  z.literal('PRE'),
]);

export type StreamPhase = z.infer<typeof streamPhase>;

export const streamPhases = z.record(streamPhase);

export type StreamPhases = z.infer<typeof streamPhases>;

export const controls = z.object({
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

export type Controls = z.infer<typeof controls>;

export const control = controls.keyof();

export type Control = z.infer<typeof control>;

export const config = z.object({
  controls,
  customerId: stringSchema,
  streamPhase,
  streamPhases,
  tenantId: stringSchema,
});

export type Config = z.infer<typeof config>;

export const userFeedback = z.object({
  comments: stringSchema,
  email: stringSchema,
  name: stringSchema,
});

export type UserFeedback = z.infer<typeof userFeedback>;
