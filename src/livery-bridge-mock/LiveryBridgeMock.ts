import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
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
 * Element defined as `<livery-bridge-mock>` which creates a `MockPlayerBridge`,
 * to be used by a `<livery-interactive>` element that should be passed as a child element
 * to this to enable testing the `InteractiveBridge`.
 * This also uses a `<livery-bridge-log>` to show the messages arriving at the player side.
 */
@customElement('livery-bridge-mock')
export class LiveryBridgeMock extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      height: 100%;
      background-color: #222;
      color: #aaa;
      line-height: 1.25em;
      font-size: 14px;
      padding: 4px;
      overflow: auto;
    }

    :host([hidden]) {
      display: none;
    }

    .panel {
      background-color: #444;
      color: #ccc;
      margin: 0 0 4px 0;
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
      background: rgba(127, 0, 0, 0.8);
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

  playerBridge = new MockPlayerBridge();

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

          <slot
            >Please specify a livery-interactive element as a child to this
            one.</slot
          >

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
        <livery-bridge-log .bridge=${this.playerBridge}></livery-bridge-log>
      </div>
    `;
    /* eslint-enable @typescript-eslint/unbound-method */
  }
}
