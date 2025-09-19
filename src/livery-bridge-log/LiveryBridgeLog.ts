import type { PropertyValues } from 'lit';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { LiveryBridge } from '../LiveryBridge.ts';
import { defineVersionedElement } from '../util/defineVersionedElement.ts';
import { humanStringify } from '../util/humanStringify.ts';

declare global {
  interface HTMLElementTagNameMap {
    'livery-bridge-log': LiveryBridgeLog;
  }
}

/**
 * Element defined as `<livery-bridge-log>` which logs messages posted to specified {@link bridge} or the window.
 *
 * @group Elements
 * @noInheritDoc
 * @example
 * ```html
 * <livery-bridge-log maxmessages="3"></livery-bridge-log>
 * ```
 */
export class LiveryBridgeLog extends LitElement {
  static override readonly styles = css`
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

  static readonly version = __VERSION__;

  /**
   * Bridge to spy on.
   *
   * If undefined this will instead just listen to messages posted to this window.
   *
   * Note: This needs to be defined before this element is connected to DOM.
   */
  bridge?: LiveryBridge;

  /**
   * Maximum number of messages to display.
   * @group Attributes
   * @defaultValue 10
   */
  @property({ reflect: true, type: Number })
  maxMessages = 10;

  @query('#container')
  private readonly container?: HTMLElement;

  private messages: string[] = [];

  private removeSpy?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    if (this.bridge) {
      this.removeSpy = this.bridge.spy((message) => {
        // biome-ignore lint/suspicious/noConsole: Log to console as documented
        console.log(message);
        this.addMessage(humanStringify(message, true));
      });
    } else {
      window.addEventListener('message', this.handleWindowMessage);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    if (this.removeSpy) {
      this.removeSpy();
      this.removeSpy = undefined;
    } else {
      window.removeEventListener('message', this.handleWindowMessage);
    }

    this.messages = [];
  }

  override firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.updateMessages();
  }

  override render() {
    return html`<pre><code id="container"></code></pre>`;
  }

  private addMessage(message: string) {
    this.messages.unshift(message);
    this.updateMessages();
  }

  private readonly handleWindowMessage = (event: MessageEvent) => {
    // biome-ignore lint/suspicious/noConsole: Log to console as documented
    console.log(event.origin, event.data);

    this.addMessage(`${event.origin}: ${humanStringify(event.data, true)}`);
  };

  private updateMessages() {
    while (this.messages.length > this.maxMessages) {
      this.messages.pop();
    }

    if (this.container) {
      this.container.innerText = this.messages.join('\n');
    }
  }
}

defineVersionedElement('livery-bridge-log', LiveryBridgeLog);
