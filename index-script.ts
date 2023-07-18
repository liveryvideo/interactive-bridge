import type { InteractiveBridge } from './index';
import { LiveryInteractive, MockPlayerBridge } from './index';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }

  interface Window {
    interactiveBridge?: InteractiveBridge;
    mockPlayerBridge?: MockPlayerBridge;
  }
}

const params = new URLSearchParams(window.location.search);

if (params.has('mock')) {
  window.mockPlayerBridge = new MockPlayerBridge();
  // TODO: Also mock with player screenshot background and with PlayerBridge log like on mock.html page
  // E.g: merge mock.html page into this?
}

customElements.define('livery-interactive', LiveryInteractive);

const liveryInteractive = document.createElement('livery-interactive');
liveryInteractive.playerBridge = window.mockPlayerBridge;
liveryInteractive.onload = () => {
  window.interactiveBridge = liveryInteractive.interactiveBridge;
};
document.body.appendChild(liveryInteractive);
