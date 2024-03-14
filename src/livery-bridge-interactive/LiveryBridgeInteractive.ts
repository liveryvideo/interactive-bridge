import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { AbstractPlayerBridge } from '../AbstractPlayerBridge';
import { InteractiveBridge } from '../InteractiveBridge';
import '../livery-bridge-log/LiveryBridgeLog';
import { defineVersionedElement } from '../util/defineVersionedElement';
import { humanStringify } from '../util/humanStringify';
import { validateDisplayMode, type UserFeedback } from '../util/schema';

declare global {
  interface HTMLElementTagNameMap {
    'livery-bridge-interactive': LiveryBridgeInteractive;
  }
}

// TODO: Refactor this fancy TypeScript to just using plain lit element state properties and click handler methods
const BRIDGE_GET_NAMES = [
  'getAppName',
  'getCustomerId',
  'getEndpointId',
  'getFeatures',
  'getLatency',
  'getLiveryParams',
  'getPlayback',
  'getPlayerVersion',
  'getStreamId',
  'pause',
  'play',
  'reload',
  'seek',
  'selectQuality',
  'setDisplay',
  'setMuted',
  'setVolume',
  'submitUserFeedback',
] as const;
const BRIDGE_SUBSCRIBE_NAMES = [
  'subscribeConfig',
  'subscribeDisplay',
  'subscribeError',
  'subscribeFullscreen',
  'subscribeMode',
  'subscribeOrientation',
  'subscribePaused',
  'subscribePlaybackState',
  'subscribePlaying',
  'subscribeQualities',
  'subscribeQuality',
  'subscribeStalled',
  'subscribeStreamPhase',
  'subscribeVolume',
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
 * Test element defined as `<livery-bridge-interactive>` which can be used as Livery Interactive element
 * for testing purposes.
 *
 * This dispatches a 'load' event once it's loaded and `interactiveBridge` has been assigned.
 *
 * @group Elements
 * @example
 * ```js
 * const interactive = document.createElement('livery-bridge-interactive');
 * interactive.playerBridge = new MockPlayerBridge();
 * interactive.region = 'eu';
 * interactive.tenantId = 'abc123';
 * document.body.appendChild(interactive);
 * ```
 */
export class LiveryBridgeInteractive extends LitElement {
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

    pre {
      white-space: pre-wrap;
    }

    .panel {
      margin: 5px;
      border: 1px solid grey;
      display: inline-block;
      background-color: rgba(245, 245, 245, 0.9);
      padding: 5px;
    }
  `;

  static readonly version = __VERSION__;

  @state()
  auth = '';

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

  /**
   * Region of interactive server that interactive element should connect to.
   * @group Attributes
   * @defaultValue null
   */
  @property({ type: String, reflect: true })
  region: string | null = null;

  /**
   * Id of tenant that interactive element should use on server.
   * @group Attributes
   * @defaultValue null
   */
  @property({ type: String, reflect: true })
  tenantId: string | null = null;

  @state()
  private interactiveCommandArg = '';

  @state()
  private playerCommandValue = '';

  override connectedCallback() {
    super.connectedCallback();

    if (!this.interactiveBridge) {
      this.interactiveBridge = new InteractiveBridge(this.playerBridge ?? '*', {
        handleAuth: (tokenOrClaims) => {
          this.auth = humanStringify(tokenOrClaims);
        },
      });

      this.interactiveBridge.registerInteractiveCommand(
        'test',
        (arg, handler) => {
          const argStr = humanStringify(arg);
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
        <table>
          <tr>
            <th colspan="2">Interactive</th>
          </tr>
          <tr>
            <th>Bridge</th>
            <td>v${__VERSION__}</td>
          </tr>
          <tr>
            <th>Region</th>
            <td>${this.region}</td>
          </tr>
          <tr>
            <th>TenantId</th>
            <td>${this.tenantId}</td>
          </tr>
        </table>
      </header>

      <main>
        <div class="panel">
          <table>
            <tr>
              <th>Player Command:</th>
            </tr>
            <tr>
              <td>
                <form name="GetForm" @submit=${this.handlePlayerGet}>
                  <select
                    name="getCommandName"
                    @change=${this.handleGetSelectChange}
                  >
                    <option value="getAppName">getAppName</option>
                    <option value="getCustomerId">getCustomerId</option>
                    <option value="getEndpointId">getEndpointId</option>
                    <option value="getFeatures">getFeatures</option>
                    <option value="getLatency">getLatency</option>
                    <option value="getLiveryParams">getLiveryParams</option>
                    <option value="getPlayback">getPlayback</option>
                    <option value="getPlayerVersion">getPlayerVersion</option>
                    <option value="getStreamId">getStreamId</option>
                    <option value="pause">pause</option>
                    <option value="play">play</option>
                    <option value="reload">reload</option>
                    <option value="seek">seek</option>
                    <option value="selectQuality">selectQuality</option>
                    <option value="setDisplay">setDisplay</option>
                    <option value="setMuted">setMuted</option>
                    <option value="setVolume">setVolume</option>
                    <option value="submitUserFeedback">
                      submitUserFeedback
                    </option>
                  </select>
                  <input
                    type="text"
                    id="getCommandNameInput"
                    name="getCommandNameInput"
                    style="display: none"
                  />
                  <select
                    id="getCommandNameBoolean"
                    name="getCommandNameBoolean"
                    style="display: none"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                  <select
                    id="getCommandNameDisplay"
                    name="getCommandNameDisplay"
                    style="display: none"
                  >
                    <option value="AIRPLAY">AIRPLAY</option>
                    <option value="CHROMECAST">CHROMECAST</option>
                    <option value="DEFAULT">DEFAULT</option>
                    <option value="FULLSCREEN">FULLSCREEN</option>
                    <option value="PIP">PIP</option>
                  </select>
                  <button type="submit">Send</button>
                </form>
              </td>
            </tr>
            <tr>
              <th>Last Command Value:</th>
            </tr>
            <tr>
              <td>
                <pre id="getCommandOutput"></pre>
              </td>
            </tr>
            <tr>
              <th>Player Subscription:</th>
            </tr>
            <tr>
              <td>
                <form
                  name="SubscribeForm"
                  @submit=${this.handlePlayerSubscribe}
                >
                  <select name="subscribeCommandName">
                    <option value="subscribeConfig">subscribeConfig</option>
                    <option value="subscribeDisplay">subscribeDisplay</option>
                    <option value="subscribeError">subscribeError</option>
                    <option value="subscribeFullscreen">
                      subscribeFullscreen
                    </option>
                    <option value="subscribeMode">subscribeMode</option>
                    <option value="subscribeOrientation">
                      subscribeOrientation
                    </option>
                    <option value="subscribePaused">subscribePaused</option>
                    <option value="subscribePlaybackState">
                      subscribePlaybackState
                    </option>
                    <option value="subscribePlaying">subscribePlaying</option>
                    <option value="subscribeQualities">
                      subscribeQualities
                    </option>
                    <option value="subscribeQuality">subscribeQuality</option>
                    <option value="subscribeStalled">subscribeStalled</option>
                    <option value="subscribeStreamPhase">
                      subscribeStreamPhase
                    </option>
                    <option value="subscribeVolume">subscribeVolume</option>
                  </select>
                  <button type="submit">Send</button>
                </form>
              </td>
            </tr>
            <tr>
              <th>Last Subscription Value:</th>
            </tr>
            <tr>
              <td>
                <pre id="subscribeCommandOutput"></pre>
              </td>
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
          <b>Interactive Auth</b>
          <pre>${this.auth}</pre>
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
      element.innerText = humanStringify(value, true);
    };
  }

  private handleGetSelectChange(event: Event) {
    const { target } = event;

    if (!(target instanceof HTMLSelectElement)) {
      throw new Error('Unsupported select element');
    }

    const methodName = target.value;

    if (!isBridgeGetMethodName(methodName)) {
      throw new Error(`Invalid get select method name: ${methodName}`);
    }

    switch (methodName) {
      case 'seek':
      case 'setVolume':
      case 'selectQuality': {
        const inputElement = this.renderRoot.querySelector(
          '#getCommandNameInput',
        );

        if (!(inputElement instanceof HTMLInputElement)) {
          throw new Error('Unsupported input element');
        }

        inputElement.setAttribute('style', 'display: inline-block');
        inputElement.setAttribute('type', 'number');
        inputElement.setAttribute(
          'step',
          methodName === 'setVolume' ? 'any' : '1',
        );
        inputElement.value = '';
        break;
      }
      default: {
        const inputElement = this.renderRoot.querySelector(
          '#getCommandNameInput',
        );

        if (inputElement) {
          inputElement.setAttribute('style', 'display: none');
          inputElement.setAttribute('type', 'text');
          inputElement.removeAttribute('step');
        }
      }
    }

    switch (methodName) {
      case 'setMuted': {
        const booleanElement = this.renderRoot.querySelector(
          '#getCommandNameBoolean',
        );

        if (!(booleanElement instanceof HTMLSelectElement)) {
          throw new Error('Unsupported select element');
        }

        booleanElement.setAttribute('style', 'display: inline-block');
        break;
      }
      default: {
        const booleanElement = this.renderRoot.querySelector(
          '#getCommandNameBoolean',
        );

        if (booleanElement) {
          booleanElement.setAttribute('style', 'display: none');
        }
      }
    }

    switch (methodName) {
      case 'setDisplay': {
        const displayElement = this.renderRoot.querySelector(
          '#getCommandNameDisplay',
        );

        if (!(displayElement instanceof HTMLSelectElement)) {
          throw new Error('Unsupported select element');
        }

        displayElement.setAttribute('style', 'display: inline-block');
        break;
      }
      default: {
        const displayElement = this.renderRoot.querySelector(
          '#getCommandNameDisplay',
        );

        if (displayElement) {
          displayElement.setAttribute('style', 'display: none');
        }
      }
    }
  }

  private handlePlayerCall(type: 'get' | 'subscribe', event: Event) {
    if (!event.target || !(event.target instanceof HTMLFormElement)) {
      throw new Error('Unsupported event target');
    }
    if (!this.interactiveBridge) {
      throw new Error('interactiveBridge undefined');
    }

    const formData = new FormData(event.target);

    const methodName = formData.get(`${type}CommandName`);

    if (typeof methodName !== 'string') {
      throw new Error('methodName must be a string');
    }

    const setText = this.createSetText(`#${type}CommandOutput`);

    const getInputValue = (field: 'Input' | 'Boolean' | 'Display') => {
      const inputValue = formData.get(`${type}CommandName${field}`)?.toString();

      if (typeof inputValue !== 'string') {
        throw new Error('inputValue must be a string');
      }

      return inputValue;
    };

    if (type === 'get') {
      if (!isBridgeGetMethodName(methodName)) {
        throw new Error(`Invalid ${type} method name: ${methodName}`);
      }

      switch (methodName) {
        case 'seek':
        case 'selectQuality':
        case 'setVolume': {
          const inputValue = getInputValue('Input');
          this.interactiveBridge[methodName](parseFloat(inputValue)).then(
            setText,
            setText,
          );
          break;
        }
        case 'setMuted': {
          const inputValue = getInputValue('Boolean');
          this.interactiveBridge[methodName](inputValue === 'true').then(
            setText,
            setText,
          );
          break;
        }
        case 'submitUserFeedback': {
          const inputValue: UserFeedback = {
            name: 'dummy-name',
            email: 'dummy-email',
            comments: 'dummy-comments',
          };
          this.interactiveBridge[methodName](inputValue).then(setText, setText);
          break;
        }
        case 'setDisplay': {
          const inputValue = getInputValue('Display');
          this.interactiveBridge[methodName](
            validateDisplayMode(inputValue),
          ).then(setText, setText);
          break;
        }
        default: {
          this.interactiveBridge[methodName]().then(setText, setText);
        }
      }
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
      this.playerCommandValue = humanStringify(value);
    };
    this.interactiveBridge
      .sendPlayerCommand(name, arg, setText)
      .then(setText, setText);
  }

  private handlePlayerGet(event: Event) {
    event.preventDefault();
    this.handlePlayerCall('get', event);
  }

  private handlePlayerSubscribe(event: Event) {
    event.preventDefault();
    this.handlePlayerCall('subscribe', event);
  }
}

defineVersionedElement('livery-bridge-interactive', LiveryBridgeInteractive);
