/* eslint-disable no-unused-vars */
import '../build/index.js';

const liveryInteractive = document.querySelector('livery-interactive');

liveryInteractive.init((message) => {
  document.querySelector('#log').value += message;
});

document.querySelector('#getLatency').onclick = async () => {
  document.querySelector(
    '#latency',
  ).innerText = await liveryInteractive.getLatency();
};

document.querySelector('#subOrientation').onclick = () => {
  const setOrientation = (orientation) => {
    document.querySelector('#orientation').innerText = orientation;
  };
  liveryInteractive.subscribeOrientation(setOrientation).then(setOrientation);
};

document.querySelector('#message-form').onsubmit = (e) => {
  e.preventDefault();
  const message = document.querySelector('#message').value;
  window.postMessage(JSON.parse(message), '*');
};

function setTemplate(type) {
  let template;
  switch (type) {
    case 'handshake':
      template = {
        isLivery: true,
        type: 'handshake',
        id: '',
        version: '',
      };
      break;

    case 'command':
      template = {
        isLivery: true,
        type: 'command',
        name: '',
        id: '',
        arg: '',
      };
      break;

    case 'resolve':
      template = {
        isLivery: true,
        type: 'resolve',
        value: '',
        id: '',
      };
      break;

    case 'reject':
      template = {
        isLivery: true,
        type: 'reject',
        error: new Error('error message'),
        id: '',
      };
      break;

    case 'event':
      template = {
        isLivery: true,
        type: 'event',
        value: '',
        id: '',
      };
      break;

    default:
      break;
  }

  document.querySelector('#message').value = JSON.stringify(template, null, 1);
}
window.setTemplate = setTemplate;
