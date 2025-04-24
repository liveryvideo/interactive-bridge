import type { PropertyValues } from 'lit';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../livery-bridge-log/LiveryBridgeLog.ts';
import { MockPlayerBridge } from '../MockPlayerBridge.ts';
import { defineVersionedElement } from '../util/defineVersionedElement.ts';

declare global {
  interface HTMLElementTagNameMap {
    'livery-bridge-mock': LiveryBridgeMock;
  }
}

/**
 * Test element defined as `<livery-bridge-mock>` which creates a `MockPlayerBridge`
 * to be used by a Livery Interactive element that should be passed as a child.
 *
 * Alternatively pass an `<iframe>` element as a child with an interactive layer page
 * which should be at the origin specified by the `interactiveOrigin` property.
 * That interactive page should create an `InteractiveBridge` instance targetting this window,
 * e.g. by using a Livery Interactive element.
 *
 * @group Elements
 * @noInheritDoc
 * @example
 * ```js
 * const mock = document.createElement('livery-bridge-mock');
 * mock.onload = () => {
 *   const interactive = document.createElement('livery-bridge-interactive');
 *   interactive.playerBridge = mock.playerBridge;
 *   mock.appendChild(interactive);
 * };
 * document.body.appendChild(mock);
 * ```
 */
export class LiveryBridgeMock extends LitElement {
  /** @internal */
  static override readonly styles = css`
    :host {
      display: block;
      height: 100%;
      background-color: #222;
      color: #aaa;
      overflow: auto;
    }

    :host([hidden]) {
      display: none;
    }

    .panel {
      background-color: #444;
      color: #ccc;
      margin: 4px;
      padding: 4px;
    }

    .player {
      position: relative;
      width: 100%;
      height: 50vh;
    }

    .poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    ::slotted(*) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .controls {
      position: absolute;
      width: 100%;
      height: 50px;
      background: rgba(127, 0, 0, 0.6);
      color: #fff;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
    }

    .controls-top {
      top: 0;
      left: 0;
    }

    .controls-bottom {
      bottom: 0;
      left: 0;
    }
  `;

  static readonly version = __VERSION__;

  /**
   * Target origin of `MockPlayerBridge` when an `<iframe>` is specified as interactive child element.
   * @group Attributes
   * @defaultValue window.origin
   */
  @property({ reflect: true, type: String })
  interactiveOrigin = window.origin;

  @property({ type: Object })
  playerBridge?: MockPlayerBridge;

  /** @internal */
  override firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);

    // Note: slot will not yet be available from connectedCallback
    const slot = this.renderRoot.querySelector('slot');
    if (!slot) {
      throw new Error('slot not found');
    }

    const slotNodes = slot.assignedNodes({ flatten: true });
    const iframe = slotNodes.find(
      (node) => node instanceof HTMLIFrameElement,
    ) as HTMLIFrameElement | undefined;

    if (iframe) {
      if (!iframe.contentWindow) {
        throw new Error('iframe contentWindow undefined');
      }
      this.playerBridge = new MockPlayerBridge({
        origin: this.interactiveOrigin,
        window: iframe.contentWindow,
      });
    } else {
      this.playerBridge = new MockPlayerBridge();
    }

    this.playerBridge.options().catch((reason) => {
      // biome-ignore lint/suspicious/noConsole: TODO: output to DOM somewhere
      console.error('PlayerBridge options() rejected', reason);
    });

    this.dispatchEvent(new Event('load'));
  }

  /** @internal */
  override render() {
    return html`
      <div class="panel">
        <h2>Mock Livery Player</h2>
        <div class="player">
          <img
            class="poster"
            src="https://cdn.livery.live/images/poster.png"
            alt="Video poster"
          />

          <slot>Specify interactive element or iframe here</slot>

          <div class="controls controls-top">
            Livery Player controls can be shown here
          </div>
          <div class="controls controls-bottom">
            Livery Player controls can be shown here
          </div>
        </div>
      </div>

      <!-- TODO: Add form to send custom Interactive Command 'test' -->

      <div class="panel">
        <h2>Mock Bridge Messages</h2>
        <!-- Note: playerBridge only becomes available after firstUpdated -->
        ${
          this.playerBridge
            ? html`<livery-bridge-log
              .bridge=${this.playerBridge}
            ></livery-bridge-log>`
            : ''
        }
      </div>
    `;
  }
}

defineVersionedElement('livery-bridge-mock', LiveryBridgeMock);
