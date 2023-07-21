import type { PropertyValues } from 'lit';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../livery-bridge-log/LiveryBridgeLog';
import type { LiveryInteractive } from '../livery-interactive/LiveryInteractive';
import { MockPlayerBridge } from '../MockPlayerBridge';

declare global {
  interface HTMLElementTagNameMap {
    'livery-bridge-mock': LiveryBridgeMock;
    'livery-interactive': LiveryInteractive;
  }
}

/**
 * Test element defined as `<livery-bridge-mock>` which creates a `MockPlayerBridge`
 * to be used by a `<livery-interactive>` element that should be passed as a child.
 *
 * Alternatively pass an `<iframe>` element as a child with an interactive layer page
 * which should be at the origin specified by the `interactiveOrigin` property.
 * That interactive page should create an `InteractiveBridge` instance targetting this window,
 * e.g. by using a `<livery-interactive>` element.
 *
 * @example
 * const mock = document.createElement('livery-bridge-mock');
 * mock.onload = () => {
 *   customElements.define('livery-interactive', LiveryInteractive);
 *   const interactive = document.createElement('livery-interactive');
 *   interactive.playerBridge = mock.playerBridge;
 *   mock.appendChild(interactive);
 * };
 * document.body.appendChild(mock);
 */
@customElement('livery-bridge-mock')
export class LiveryBridgeMock extends LitElement {
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

  /**
   * Target origin of `MockPlayerBridge` when an `<iframe>` is specified as interactive child element.
   */
  @property({ type: String, reflect: true })
  interactiveOrigin = window.origin;

  @property({ type: Object })
  playerBridge?: MockPlayerBridge;

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
        window: iframe.contentWindow,
        origin: this.interactiveOrigin,
      });
    } else {
      this.playerBridge = new MockPlayerBridge();
    }

    const element = slotNodes.find(
      (node) => node.nodeName === 'livery-interactive',
    );
    if (element) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Just for testing
      // @ts-expect-error
      element.playerBridge = this.playerBridge;
    }

    this.dispatchEvent(new Event('load'));
  }

  override render() {
    /* eslint-disable @typescript-eslint/unbound-method -- lit html handles event listener binding */
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
        ${this.playerBridge
          ? html`<livery-bridge-log
              .bridge=${this.playerBridge}
            ></livery-bridge-log>`
          : ''}
      </div>
    `;
    /* eslint-enable @typescript-eslint/unbound-method */
  }
}
