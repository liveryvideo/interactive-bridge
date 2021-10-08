import {
  css,
  customElement,
  html,
  LitElement,
  property,
  query,
} from 'lit-element';
import { stringify } from '../util/stringify';

declare global {
  interface HTMLElementTagNameMap {
    'livery-bridge-log': LiveryBridgeLog;
  }
}

/**
 * Element defined as `<livery-bridge-log>` which logs LiveryBridge and other window messages posted to this window.
 */
@customElement('livery-bridge-log')
export class LiveryBridgeLog extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    pre {
      white-space: pre-wrap;
    }

    code {
      overflow-wrap: break-word;
    }
  `;

  /**
   * Maximum number of messages to display.
   */
  @property({ type: Number, reflect: true })
  public maxMessages = 10;

  @query('#container')
  private container?: HTMLElement;

  private messages: string[] = [];

  public connectedCallback() {
    super.connectedCallback();

    window.addEventListener('message', this.handleMessage);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('message', this.handleMessage);
    this.messages = [];
  }

  public render() {
    return html`<pre><code id="container"></code></pre>`;
  }

  private handleMessage = (event: MessageEvent) => {
    // eslint-disable-next-line no-console
    console.log(event.origin, event.data);

    this.messages.unshift(`${event.origin}: ${stringify(event.data)}`);

    while (this.messages.length > this.maxMessages) {
      this.messages.pop();
    }

    if (this.container) {
      this.container.innerText = this.messages.join('\n');
    }
  };
}
