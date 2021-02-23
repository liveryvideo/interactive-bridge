/* eslint-disable class-methods-use-this */
import { customElement, LitElement, property, html } from 'lit-element';
import { uuid } from './util/uuid';

import LiveryBridgeInteractive from './LiveryBridgeInteractive';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }
}

@customElement('livery-interactive')
export class LiveryInteractive extends LitElement {
  bridge: LiveryBridgeInteractive;

  constructor() {
    super();

    this.bridge = new LiveryBridgeInteractive();
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
  // render() {
  //   return html`
  //     <button
  //       @click=${() => {
  //         this.sendMessage({ type: 'test' });
  //       }}
  //     >
  //       Test button!
  //     </button>
  //   `;
  // }
}
