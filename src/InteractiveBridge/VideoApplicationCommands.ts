import type { CommandLibrary } from './CommandFactory';
import { NumberParser } from './NumberParser';

export class VideoApplicationCommands implements CommandLibrary {
  commandsTable = {
    getLatency: new NumberParser('getLatency'),
  };
}
