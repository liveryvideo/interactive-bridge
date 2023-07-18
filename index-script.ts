import type { InteractiveBridge, MockPlayerBridge } from './index';
import { LiveryInteractive } from './index';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }

  interface Window {
    interactiveBridge?: InteractiveBridge;
    playerBridge?: MockPlayerBridge;
  }
}

customElements.define('livery-interactive', LiveryInteractive);
const liveryInteractive = document.createElement('livery-interactive');
liveryInteractive.onload = () => {
  window.interactiveBridge = liveryInteractive.interactiveBridge;
};

const params = new URLSearchParams(window.location.search);
if (params.has('mock')) {
  const liveryBridgeMock = document.createElement('livery-bridge-mock');
  window.playerBridge = liveryBridgeMock.playerBridge;
  liveryInteractive.playerBridge = liveryBridgeMock.playerBridge;
  liveryBridgeMock.appendChild(liveryInteractive);
  document.body.appendChild(liveryBridgeMock);
} else {
  document.body.appendChild(liveryInteractive);
}
