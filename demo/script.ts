import { InteractiveBridge } from '../index';
import { stringify } from '../src/util/stringify';

function $<K extends keyof HTMLElementTagNameMap>(
  selector: K,
): HTMLElementTagNameMap[K];
function $<E extends HTMLElement = HTMLElement>(selector: string): E;
function $(selector: string) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found with selector: ${selector}`);
  }
  return element;
}

function createSetText(selector: string) {
  return (value: unknown) => {
    $(selector).innerText =
      value instanceof Error ? value.toString() : stringify(value);
  };
}

$('#version').innerText = '__VERSION__';

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge('*');

(
  [
    ['app-name', 'getAppName'],
    ['customer-id', 'getCustomerId'],
    ['endpoint-id', 'getEndpointId'],
    ['latency', 'getLatency'],
    ['player-version', 'getPlayerVersion'],
    ['stream-id', 'getStreamId'],
  ] as const
).forEach(([id, method]) => {
  $(`#get-${id}`).addEventListener('click', () => {
    const setText = createSetText(`#${id}`);
    bridge[method]().then(setText, setText);
  });
});

(
  [
    ['fullscreen', 'subscribeFullscreen'],
    ['orientation', 'subscribeOrientation'],
    ['quality', 'subscribeQuality'],
    ['stream-phase', 'subscribeStreamPhase'],
  ] as const
).forEach(([id, method]) => {
  $(`#subscribe-${id}`).addEventListener('click', () => {
    const setText = createSetText(`#${id}`);
    bridge[method](setText).then(setText, setText);
  });
});

$('#player-command-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData($<HTMLFormElement>('#player-command-form'));
  const name = data.get('name') as string;
  const argStr = data.get('arg') as string;
  const arg: unknown = !argStr ? undefined : JSON.parse(argStr);

  const setText = createSetText('#player-command-value');
  bridge.sendPlayerCommand(name, arg, setText).then(setText, setText);
});

bridge.registerInteractiveCommand('test', (arg, handler) => {
  const argStr = stringify(arg);
  $('#interactive-command-arg').innerText = argStr;

  window.setTimeout(() => handler(`${argStr}-result-2`), 2000);
  window.setTimeout(() => handler(`${argStr}-result-3`), 4000);

  return `${argStr}-result-1`;
});

declare global {
  interface Window {
    bridge: InteractiveBridge;
  }
}

window.bridge = bridge;
