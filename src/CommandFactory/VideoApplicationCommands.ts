import { NumberParser } from '../Parser/NumberParser';
import type { CommandLibrary } from './CommandFactory';

export class VideoApplicationCommands implements CommandLibrary {
  commandsTable = {
    getLatency: new NumberParser('getLatency'),
  };
}
