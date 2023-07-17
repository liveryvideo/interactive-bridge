import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { AbstractPlayerBridge } from '../AbstractPlayerBridge';
import { InteractiveBridge } from '../InteractiveBridge';
import '../livery-bridge-log/LiveryBridgeLog';

/**
 * Element which can be registered as 'livery-interactive' to be used as Livery Interactive element
 * for testing purposes.
 *
 * Note: This does not define itself as custom element 'livery-interactive' to avoid unintended conflicts!
 *
 * Usage: `customElements.define('livery-interactive', LiveryInteractive);`
 *
 * This dispatches a 'load' event once it's loaded and `interactiveBridge` has been assigned.
 */
export class LiveryInteractive extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    :host([hidden]) {
      display: none;
    }

    .controls-space {
      flex-shrink: 0;
      height: 50px;
    }

    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: center;
      color: #fff;
      filter: drop-shadow(0 0 2px #222);
    }

    a.logo {
      padding: 4px;
      font-size: 2em;
      font-style: italic;
      font-weight: bold;
      color: #fff;
      text-decoration: none;
    }

    .logo img {
      height: 1em;
      vertical-align: text-top;
    }

    main {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: center;
    }

    .panel {
      margin: 5px;
      border: 1px solid grey;
      display: inline-block;
      background-color: rgba(245, 245, 245, 0.9);
      padding: 5px;
    }
  `;

  /**
   * InteractiveBridge instance created by this element on first DOM connect.
   */
  @property({ type: Object })
  interactiveBridge?: InteractiveBridge;

  /**
   * `PlayerBridge` to use as target for `interactiveBridge`.
   * If undefined this will default using parent as target window and '*' as target origin.
   *
   * Note: Only effective when defined before first DOM connect.
   */
  playerBridge?: AbstractPlayerBridge;

  override connectedCallback() {
    super.connectedCallback();

    if (!this.interactiveBridge) {
      this.interactiveBridge = new InteractiveBridge(this.playerBridge ?? '*');
      this.dispatchEvent(new Event('load'));
    }
  }

  override render() {
    return html`
      <div class="controls-space">
        <!-- Livery Player controls can be shown here -->
      </div>

      <header>
        <a
          class="logo"
          href="https://www.liveryvideo.com"
          rel="external"
          target="_blank"
        >
          <img
            src="https://cdn.livery.live/images/livery-icon-32x32.png"
            alt="Livery Icon"
          />
          Livery
        </a>
        <b>Interactive Layer v${__VERSION__}</b>
      </header>

      <main>
        <div class="panel">
          <table>
            <tr>
              <th>Player Command</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>
                <button id="get-app-name">getAppName</button>
              </td>
              <td id="app-name"></td>
            </tr>
            <tr>
              <td>
                <button id="get-customer-id">getCustomerId</button>
              </td>
              <td id="customer-id"></td>
            </tr>
            <tr>
              <td>
                <button id="get-endpoint-id">getEndpointId</button>
              </td>
              <td id="endpoint-id"></td>
            </tr>
            <tr>
              <td><button id="get-latency">getLatency</button></td>
              <td id="latency"></td>
            </tr>
            <tr>
              <td><button id="get-livery-params">getLiveryParams</button></td>
              <td id="livery-params"></td>
            </tr>
            <tr>
              <td>
                <button id="get-player-version">getPlayerVersion</button>
              </td>
              <td id="player-version"></td>
            </tr>
            <tr>
              <td>
                <button id="get-stream-id">getStreamId</button>
              </td>
              <td id="stream-id"></td>
            </tr>
            <tr>
              <td>
                <button id="subscribe-fullscreen">subscribeFullscreen</button>
              </td>
              <td id="fullscreen"></td>
            </tr>
            <tr>
              <td>
                <button id="subscribe-orientation">subscribeOrientation</button>
              </td>
              <td id="orientation"></td>
            </tr>
            <tr>
              <td>
                <button id="subscribe-quality">subscribeQuality</button>
              </td>
              <td id="quality"></td>
            </tr>
            <tr>
              <td>
                <button id="subscribe-stream-phase">
                  subscribeStreamPhase
                </button>
              </td>
              <td id="stream-phase"></td>
            </tr>
          </table>
        </div>

        <div class="panel">
          <form id="player-command-form" method="post" action="#">
            <table>
              <tr>
                <th colspan="2">Custom Player Command</th>
              </tr>
              <tr>
                <th>Name:</th>
                <td>
                  <input type="text" name="name" value="subscribeAuthToken" />
                </td>
              </tr>
              <tr>
                <th>Arg:</th>
                <td><input type="text" name="arg" value='"dummy"' /></td>
              </tr>
              <tr>
                <th></th>
                <td><input type="submit" value="Send" /></td>
              </tr>
              <tr>
                <th>Value:</th>
                <td id="player-command-value"></td>
              </tr>
            </table>
          </form>
        </div>

        <div class="panel">
          <table>
            <tr>
              <th colspan="2">Custom Interactive Command</th>
            </tr>
            <tr>
              <th>Name:</th>
              <td>test</td>
            </tr>
            <tr>
              <th>Arg:</th>
              <td id="interactive-command-arg"></td>
            </tr>
          </table>
        </div>

        <div class="panel">
          <b>Last Bridge Message</b>
          <livery-bridge-log
            maxmessages="1"
            .bridge=${this.interactiveBridge}
          ></livery-bridge-log>
        </div>
      </main>

      <div class="controls-space">
        <!-- Livery Player controls can be shown here -->
      </div>
    `;
  }
}
