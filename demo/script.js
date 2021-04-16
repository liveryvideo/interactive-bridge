import { InteractiveBridge } from '../build/index.js';

function $(selector) {
  return document.querySelector(selector);
}

function createSetText(selector) {
  return (value) => {
    $(selector).innerText =
      value instanceof Error ? value.toString() : JSON.stringify(value);
  };
}

$('#version').innerText = '__VERSION__';

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge('*');

$('#get-latency').addEventListener('click', () => {
  const setText = createSetText('#latency');
  bridge.getLatency().then(setText, setText);
});

$('#subscribe-orientation').addEventListener('click', () => {
  const setText = createSetText('#orientation');
  bridge.subscribeOrientation(setText).then(setText, setText);
});

$('#subscribe-stream-phase').addEventListener('click', () => {
  const setText = createSetText('#stream-phase');
  bridge.subscribeStreamPhase(setText).then(setText, setText);
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

bridge.registerCustomCommand('test', (arg, handler) => {
  $('#iinteractive-command-arg').innerText = JSON.stringify(arg);

  window.setTimeout(() => handler(`${arg}-result-2`), 2000);
  window.setTimeout(() => handler(`${arg}-result-3`), 4000);

  return `${arg}-result-1`;
});

window.bridge = bridge;
