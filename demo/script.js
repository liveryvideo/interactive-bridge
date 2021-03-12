import { InteractiveBridge, MockPlayerBridge } from '../build/index.js';

function $(selector) {
  return document.querySelector(selector);
}

// Note: Don't use origin '*' like we do here unless security is not an issue for your purposes
const bridge = new InteractiveBridge('*');

$('#get-auth-token').addEventListener('click', () => {
  bridge
    .sendCustomCommand({
      name: 'getAuthToken',
      validate: (value) => InteractiveBridge.validatePrimitive(value, 'string'),
    })
    .then((token) => {
      $('#auth-token').innerText = token;
    })
    .catch((error) => {
      $('#auth-token').innerText = error.toString();
    });
});

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

window.addEventListener('message', (event) => {
  console.log('window message', event.data);
});

window.bridge = bridge;

const params = new URLSearchParams(window.location.search);
if (params.has('mock')) {
  // Have the player bridge load asynchronously like in real use
  window.setTimeout(() => {
    window.mockBridge = new MockPlayerBridge(window, window.location.origin);
  }, 1000);
}
