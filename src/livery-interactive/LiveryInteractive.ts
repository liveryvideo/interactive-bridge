import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { AbstractPlayerBridge } from '../AbstractPlayerBridge';
import { InteractiveBridge } from '../InteractiveBridge';
import '../livery-bridge-log/LiveryBridgeLog';
import { stringify } from '../util/stringify';

const BRIDGE_GET_NAMES = [
  'getAppName',
  'getCustomerId',
  'getEndpointId',
  'getLatency',
  'getLiveryParams',
  'getPlayerVersion',
  'getStreamId',
] as const;
const BRIDGE_SUBSCRIBE_NAMES = [
  'subscribeFullscreen',
  'subscribeOrientation',
  'subscribeQuality',
  'subscribeStreamPhase',
] as const;

type BridgeGetName = (typeof BRIDGE_GET_NAMES)[number];
type BridgeSubscribeName = (typeof BRIDGE_SUBSCRIBE_NAMES)[number];

function isBridgeGetMethodName(name: string): name is BridgeGetName {
  return (BRIDGE_GET_NAMES as unknown as string[]).includes(name);
}

function isBridgeSubscribeMethodName(
  name: string,
): name is BridgeSubscribeName {
  return (BRIDGE_SUBSCRIBE_NAMES as unknown as string[]).includes(name);
}

/**
 * Element which can be registered as 'livery-interactive' to be used as Livery Interactive element
 * for testing purposes.
 *
 * Note: This does not define itself as custom element 'livery-interactive' to avoid unintended conflicts!
 *
 * This dispatches a 'load' event once it's loaded and `interactiveBridge` has been assigned.
 *
 * @example
 * customElements.define('livery-interactive', LiveryInteractive);
 * const interactive = document.createElement('livery-interactive');
 * // Assign player bridge instance when you are embedded as interactive element (not page) by player
 * interactive.playerBridge = playerBridge;
 * interactive.onload = () => {
 *   // Use interactive.interactiveBridge
 * };
 * document.body.appendChild(interactive);
 */
export class LiveryInteractive extends LitElement {
  static override readonly styles = css`
    :host {
      color: #000;
      display: block;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: auto;
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
   *
   * Note: Only effective when defined before first DOM connect.
   *
   * If `undefined` this will default to using `parent` as `target.window` and `'*'` as `target.origin`.
   *
   * Note: Without `origin` restriction don't send sensitive information or trust responses,
   * this is only meant to be used for testing purposes.
   */
  playerBridge?: AbstractPlayerBridge;

  @state()
  private interactiveCommandArg = '';

  @state()
  private playerCommandValue = '';

  override connectedCallback() {
    super.connectedCallback();

    if (!this.interactiveBridge) {
      this.interactiveBridge = new InteractiveBridge(this.playerBridge ?? '*');

      this.interactiveBridge.registerInteractiveCommand(
        'test',
        (arg, handler) => {
          const argStr = stringify(arg);
          this.interactiveCommandArg = argStr;

          window.setTimeout(() => handler(`${argStr}-result-2`), 2000);
          window.setTimeout(() => handler(`${argStr}-result-3`), 4000);

          return `${argStr}-result-1`;
        },
      );

      this.dispatchEvent(new Event('load'));
    }
  }

  override render() {
    /* eslint-disable @typescript-eslint/unbound-method -- lit html handles event listener binding */
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
                <button @click=${this.handlePlayerGet}>getAppName</button>
              </td>
              <td id="getAppNameOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getCustomerId</button>
              </td>
              <td id="getCustomerIdOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getEndpointId</button>
              </td>
              <td id="getEndpointIdOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getLatency</button>
              </td>
              <td id="getLatencyOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getLiveryParams</button>
              </td>
              <td id="getLiveryParamsOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getPlayerVersion</button>
              </td>
              <td id="getPlayerVersionOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerGet}>getStreamId</button>
              </td>
              <td id="getStreamIdOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerSubscribe}>
                  subscribeFullscreen
                </button>
              </td>
              <td id="subscribeFullscreenOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerSubscribe}>
                  subscribeOrientation
                </button>
              </td>
              <td id="subscribeOrientationOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerSubscribe}>
                  subscribeQuality
                </button>
              </td>
              <td id="subscribeQualityOutput"></td>
            </tr>
            <tr>
              <td>
                <button @click=${this.handlePlayerSubscribe}>
                  subscribeStreamPhase
                </button>
              </td>
              <td id="subscribeStreamPhaseOutput"></td>
            </tr>
          </table>
        </div>

        <div class="panel">
          <form method="post" action="#" @submit=${this.handlePlayerCommand}>
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
                <td>${this.playerCommandValue}</td>
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
              <td>${this.interactiveCommandArg}</td>
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
    /* eslint-enable @typescript-eslint/unbound-method */
  }

  private createSetText(selector: string) {
    const element = this.renderRoot.querySelector(selector);
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error(`No HTMLElement found with selector: ${selector}`);
    }

    return (value: unknown) => {
      element.innerText = stringify(value);
    };
  }

  private handlePlayerCall(type: 'get' | 'subscribe', event: Event) {
    if (!event.target || !(event.target instanceof HTMLElement)) {
      throw new Error('Unsupported event target');
    }
    if (!this.interactiveBridge) {
      throw new Error('interactiveBridge undefined');
    }

    const methodName = event.target.innerText.trim();
    const setText = this.createSetText(`#${methodName}Output`);

    if (type === 'get') {
      if (!isBridgeGetMethodName(methodName)) {
        throw new Error(`Invalid ${type} method name: ${methodName}`);
      }
      this.interactiveBridge[methodName]().then(setText, setText);
    } else {
      if (!isBridgeSubscribeMethodName(methodName)) {
        throw new Error(`Invalid ${type} method name: ${methodName}`);
      }
      this.interactiveBridge[methodName](setText).then(setText, setText);
    }
  }

  private handlePlayerCommand(event: Event) {
    if (!event.target || !(event.target instanceof HTMLFormElement)) {
      throw new Error('Unsupported event target');
    }
    if (!this.interactiveBridge) {
      throw new Error('interactiveBridge undefined');
    }

    event.preventDefault();

    const data = new FormData(event.target);
    const name = data.get('name') as string;
    const argStr = data.get('arg') as string;
    const arg: unknown = !argStr ? undefined : JSON.parse(argStr);

    const setText = (value: unknown) => {
      this.playerCommandValue = stringify(value);
    };
    this.interactiveBridge
      .sendPlayerCommand(name, arg, setText)
      .then(setText, setText);
  }

  private handlePlayerGet(event: Event) {
    this.handlePlayerCall('get', event);
  }

  private handlePlayerSubscribe(event: Event) {
    this.handlePlayerCall('subscribe', event);
  }
}
