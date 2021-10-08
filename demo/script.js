import { InteractiveBridge } from '../build/index.js';
import { stringify } from '../build/src/util/stringify.js';

function $(selector) {
  return document.querySelector(selector);
}

function createSetText(selector) {
  return (value) => {
    $(selector).innerText = stringify(value);
  };
}

$('#version').innerText = '__VERSION__';

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge('*');

[
  ['app-name', 'getAppName'],
  ['customer-id', 'getCustomerId'],
  ['endpoint-id', 'getEndpointId'],
  ['latency', 'getLatency'],
  ['player-version', 'getPlayerVersion'],
  ['stream-id', 'getStreamId'],
].forEach(([id, method]) => {
  $(`#get-${id}`).addEventListener('click', () => {
    const setText = createSetText(`#${id}`);
    bridge[method]().then(setText, setText);
  });
});

[
  ['fullscreen', 'subscribeFullscreen'],
  ['orientation', 'subscribeOrientation'],
  ['quality', 'subscribeQuality'],
  ['stream-phase', 'subscribeStreamPhase'],
].forEach(([id, method]) => {
  $(`#subscribe-${id}`).addEventListener('click', () => {
    const setText = createSetText(`#${id}`);
    bridge[method](setText).then(setText, setText);
  });
});

$('#player-command-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData($('#player-command-form'));
  let arg = data.get('arg');
  arg = !arg ? undefined : JSON.parse(arg);

  const setText = createSetText('#player-command-value');
  bridge
    .sendPlayerCommand(data.get('name'), arg, setText)
    .then(setText, setText);
});

bridge.registerInteractiveCommand('test', (arg, handler) => {
  $('#interactive-command-arg').innerText = stringify(arg);

  window.setTimeout(() => handler(`${arg}-result-2`), 2000);
  window.setTimeout(() => handler(`${arg}-result-3`), 4000);

  return `${arg}-result-1`;
});

window.bridge = bridge;
