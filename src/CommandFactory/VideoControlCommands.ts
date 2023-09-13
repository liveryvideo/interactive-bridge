import { BooleanParser } from '../Parser/BooleanParser';
import { ChromecastParser } from '../Parser/ChromecastParser';
import { ControlsParser } from '../Parser/ControlsParser';
import { ErrorParser } from '../Parser/ErrorParser';
import { FeaturesParser } from '../Parser/FeaturesParser';
import { PlaybackModeParser } from '../Parser/PlaybackModeParser';
import { PlaybackParser } from '../Parser/PlaybackParser';
import { PlaybackStateParser } from '../Parser/PlaybackStateParser';
import { QualitiesParser } from '../Parser/QualitiesParser';
import { StreamPhaseTimelineParser } from '../Parser/StreamPhaseTimelineParser';
import { VoidParser } from '../Parser/VoidParser';
import type { CommandLibrary } from './CommandFactory';

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
