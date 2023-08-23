import type { LiveryMessage } from '../LiveryBridgeTypes';
import { Target } from './Target';

export class WindowTarget extends Target {
  private targetOrigin: string;

  private targetWindow: Window;

  constructor(targetOrigin: string, targetWindow: Window) {
    super();
    this.targetOrigin = targetOrigin;
    this.targetWindow = targetWindow;
  }

  transmit(message: LiveryMessage) {
    this.targetWindow.postMessage(message, this.targetOrigin);
  }
}
