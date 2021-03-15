import { InteractiveBridge } from '../build/index.js';

function $(selector) {
  return document.querySelector(selector);
}

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge('*');

$('#get-latency').addEventListener('click', () => {
  bridge
    .getLatency()
    .then((latency) => {
      $('#latency').innerText = latency.toFixed(1);
    })
    .catch((error) => {
      $('#latency').innerText = error.toString();
    });
});

$('#subscribe-orientation').addEventListener('click', () => {
  function setOrientation(orientation) {
    $('#orientation').innerText = orientation;
  }

  bridge
    .subscribeOrientation(setOrientation)
    .then(setOrientation)
    .catch((error) => {
      $('#orientation').innerText = error.toString();
    });
});

$('#subscribe-stream-phase').addEventListener('click', () => {
  function setStreamPhase(phase) {
    $('#stream-phase').innerText = phase;
  }

  bridge
    .subscribeStreamPhase(setStreamPhase)
    .then(setStreamPhase)
    .catch((error) => {
      $('#stream-phase').innerText = error.toString();
    });
});

$('#custom-command-form').addEventListener('submit', (event) => {
  function setValue(value) {
    $('#custom-command-value').innerText = JSON.stringify(value);
  }

  event.preventDefault();

  const data = new FormData($('#custom-command-form'));
  const arg = data.get('arg');

  bridge
    .sendCustomCommand({
      name: data.get('name'),
      arg: !arg ? undefined : JSON.parse(arg),
      validate: (value) => value,
      listener: setValue,
    })
    .then(setValue)
    .catch((error) => {
      $('#custom-command-value').innerText = error.toString();
    });
});

window.addEventListener('message', (event) => {
  console.log('window message', event.data);
});

window.bridge = bridge;
