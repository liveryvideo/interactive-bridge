import { IdentityParser } from '../Parser/IdentityParser';
import type { Parser } from '../Parser/Parser';
import type { Command } from '../types';
import { ApplicationCommands } from './ApplicationCommands';
import { VideoApplicationCommands } from './VideoApplicationCommands';
import { VideoControlCommands } from './VideoControlCommands';

type Listener<T> = (value: T) => void;

export interface CommandLibrary {
  commandsTable: Record<string, Parser<unknown>>;
}

export class CommandFactory {
  get commands() {
    return Array.from(Object.keys(this.commandToParserLookup));
  }

  private commandLibraries = [
    new ApplicationCommands(),
    new VideoApplicationCommands(),
    new VideoControlCommands(),
  ];

  private get commandToParserLookup(): Record<string, Parser<unknown>> {
    return Object.assign(
      {},
      ...this.commandLibraries.map((listing) => listing.commandsTable),
    ) as Record<string, Parser<unknown>>;
  }

  makeCommand<T>(
    name: string,
    options?: { arg?: unknown; listener?: Listener<T> },
  ): Command<T> {
    const parser = this.commandToParserLookup[name] as Parser<T>;
    if (!parser) {
      throw new Error(`unknown command '${name}'`);
    }
    return {
      name,
      arg: options?.arg,
      listener: options?.listener,
      parser,
      custom: false,
    };
  }

  makeCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: ((value: T) => void) | undefined,
  ) {
    return {
      name,
      arg,
      listener,
      parser: new IdentityParser(),
      custom: true,
    };
  }
}
