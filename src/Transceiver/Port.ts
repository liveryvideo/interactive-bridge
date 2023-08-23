import type { LiveryMessage } from "../LiveryBridgeTypes";


export abstract class Port {
  protected messageHandler: (message: LiveryMessage) => void = () => { };

  abstract listen(originPattern: string): void;

  abstract receive(message: LiveryMessage, origin: string): void;

  abstract setMessageHandler(messageHandler: (message: LiveryMessage) => void): void;
}
