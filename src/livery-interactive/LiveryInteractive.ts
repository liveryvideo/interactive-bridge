import { customElement, LitElement } from 'lit-element';

import { LiveryBridge } from '../LiveryBridge';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }
}

@customElement('livery-interactive')
export class LiveryInteractive extends LitElement {
  bridge!: LiveryBridge;

  /**
   * Returns a promise with the SDK's current latency in seconds.
   */
  public getLatency() {
    return this.bridge.sendCommand<number, undefined>('latency');
  }

  /**
   * Initializes the livery-interactive element.
   * @param messageListener - Optional parameter used for keeping track of messages for debugging purposes.
   */
  public init(messageListener?: (message: string) => void) {
    this.bridge = new LiveryBridge(
      window.parent,
      '*',
      '__VERSION__',
      messageListener,
    );
  }

  /**
   * Returns a promise with the current screen orientation.
   * @param listener - Called when the screen orientation changes, with the new orientation as parameter.
   */
  public subscribeOrientation(listener: (value: string) => void) {
    return this.bridge.sendSubscribe<string, undefined>(
      'orientation',
      listener,
    );
  }
}
