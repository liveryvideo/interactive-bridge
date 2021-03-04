import { InteractiveBridge } from '../build/index.js';

if (window.parent === window) {
  window.location = 'mock.html';
}

function $(selector) {
  return document.querySelector(selector);
}

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge(window.parent, '*');

$('#get-latency').addEventListener('click', () => {
  bridge.getLatency().then((latency) => {
    $('#latency').innerText = latency.toFixed(1);
  });
});

$('#subscribe-orientation').addEventListener('click', () => {
  function setOrientation(orientation) {
    $('#orientation').innerText = orientation;
  }
  bridge.subscribeOrientation(setOrientation).then(setOrientation);
});

window.addEventListener('message', (event) => {
  console.log('message', event.data);
});
