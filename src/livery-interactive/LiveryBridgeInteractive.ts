/* eslint-disable class-methods-use-this */
import { LiveryMessage, LiveryBridge, CommandMessage } from './LiveryBridge';
import { uuid } from './util/uuid';

export default class LiveryBridgeInteractive extends LiveryBridge {
  version = '0.0.1';
  // todo: move this to LiveryBridge

  constructor() {
    super();

    this.init();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars --- This method does not have to be implemented yet.
  protected handleCommand(message: CommandMessage): void {
    // This method does not have to be implemented yet.
    // When SDK's require information from the interactive layer,
    // the commands can be handled here.
  }

  protected handleMessage(message: LiveryMessage): void {
    super.handleMessage(message);
    console.log('ℹ️[Livery-Interactive] Incoming Message:', message);
  }

  protected sendMessage(message: LiveryMessage) {
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
    console.log('ℹ️[Livery-Interactive] Outgoing Message:', message);
  }
}
