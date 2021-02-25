import {
  customElement,
  LitElement,
  property,
  html,
  internalProperty,
} from 'lit-element';

import { LiveryBridge } from '../LiveryBridge';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }
}

@customElement('livery-interactive')
export class LiveryInteractive extends LitElement {
  @property({ type: Boolean })
  logEnabled = false;

  @internalProperty()
  logValue: string;

  bridge: LiveryBridge;

  constructor() {
    super();

    this.logValue = '';
    const logger = (message: string) => {
      this.logValue += message;
    };

    this.bridge = new LiveryBridge(window.parent, '*', '0.0.1', logger);
  }

  public getLatency(): Promise<number> {
    return this.bridge.sendCommand<number>('latency');
  }

  public subscribeOrientation(
    listener: (value: string) => void,
  ): Promise<string> {
    return this.bridge.sendSubscribe<string>('orientation', listener);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    if (this.logEnabled) {
      return html`
        <textarea
          id="log"
          name="message"
          rows="15"
          cols="30"
          readonly
          disabled
          .value=${this.logValue}
        ></textarea>
      `;
    }
    return undefined;
  }
}
