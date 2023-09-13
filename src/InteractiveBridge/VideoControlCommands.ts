import { BooleanParser } from './BooleanParser';
import { ChromecastParser } from './ChromecastParser';
import type { CommandLibrary } from './CommandFactory';
import { ControlsParser } from './ControlsParser';
import { ErrorParser } from './ErrorParser';
import { FeaturesParser } from './FeaturesParser';
import { PlaybackModeParser } from './PlaybackModeParser';
import { PlaybackParser } from './PlaybackParser';
import { PlaybackStateParser } from './PlaybackStateParser';
import { QualitiesParser } from './QualitiesParser';
import { StreamPhaseTimelineParser } from './StreamPhaseTimelineParser';
import { VoidParser } from './VoidParser';

export class VideoControlCommands implements CommandLibrary {
  commandsTable = {
    getFeatures: new FeaturesParser(),
    getPlayback: new PlaybackParser(),
    pause: new VoidParser(),
    play: new VoidParser(),
    reload: new VoidParser(),
    seek: new VoidParser(),
    selectQuality: new VoidParser(),
    setAirplay: new VoidParser(),
    setChromecast: new VoidParser(),
    setFullscreen: new VoidParser(),
    setMuted: new VoidParser(),
    setPictureInPicture: new VoidParser(),
    subscribeAirplay: new BooleanParser('subscribeAirplay'),
    subscribeChromecast: new ChromecastParser(),
    subscribeControls: new ControlsParser(),
    subscribeError: new ErrorParser(),
    subscribeMuted: new BooleanParser('subscribeMuted'),
    subscribePictureInPicture: new BooleanParser('subscribePictureInPicture'),
    subscribePlaybackMode: new PlaybackModeParser(),
    subscribePlaybackState: new PlaybackStateParser(),
    subscribeQualities: new QualitiesParser(),
    subscribeStreamPhaseTimeline: new StreamPhaseTimelineParser(),
    subscribeUnmuteRequiresInteraction: new BooleanParser(
      'subscribeUnmuteRequiresInteraction',
    ),
  };
}
