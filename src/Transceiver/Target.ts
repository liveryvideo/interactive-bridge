import type { LiveryMessage } from "../LiveryBridgeTypes";


export abstract class Target {
  abstract transmit(message: LiveryMessage): void;
}
