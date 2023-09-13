import { BooleanParser } from '../Parser/BooleanParser';
import { FeaturesParser } from '../Parser/FeaturesParser';
import { LiveryParamsParser } from '../Parser/LiveryParamsParser';
import { OrientationParser } from '../Parser/OrientationParser';
import { PlaybackParser } from '../Parser/PlaybackParser';
import { QualitiesParser } from '../Parser/QualitiesParser';
import { StreamPhaseParser } from '../Parser/StreamPhaseParser';
import { StringParser } from '../Parser/StringParser';
import { VoidParser } from '../Parser/VoidParser';
import type { CommandLibrary } from './CommandFactory';

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
