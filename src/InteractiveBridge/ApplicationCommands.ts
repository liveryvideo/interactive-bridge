import { BooleanParser } from './BooleanParser';
import type { CommandLibrary } from './CommandFactory';
import { FeaturesParser } from './FeaturesParser';
import { LiveryParamsParser } from './LiveryParamsParser';
import { OrientationParser } from './OrientationParser';
import { PlaybackParser } from './PlaybackParser';
import { QualitiesParser } from './QualitiesParser';
import { StreamPhaseParser } from './StreamPhaseParser';
import { StringParser } from './StringParser';
import { VoidParser } from './VoidParser';

export class ApplicationCommands implements CommandLibrary {
  commandsTable = {
    getAppName: new StringParser('getAppName'),
    getCustomerId: new StringParser('getCustomerId'),
    getEndpointId: new StringParser('getEndpointId'),
    getFeatures: new FeaturesParser(),
    getLiveryParams: new LiveryParamsParser(),
    getPlayback: new PlaybackParser(),
    getPlayerVersion: new StringParser('getPlayerVersion'),
    getStreamId: new StringParser('getStreamId'),
    submitUserFeedback: new VoidParser(),
    subscribeFullscreen: new BooleanParser('subscribeFullscreen'),
    subscribeOrientation: new OrientationParser(),
    subscribeQualities: new QualitiesParser(),
    subscribeQuality: new StringParser('subscribeQuality'),
    subscribeStreamPhase: new StreamPhaseParser(),
  };
}
