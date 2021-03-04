/* eslint-disable no-unused-vars */
import '../build/index.js';

const $ = (query) => document.querySelector(query);

const liveryInteractive = $('livery-interactive');
const latencyText = $('#latency');
const orientationText = $('#orientation');

function setTemplate(type, properties) {
  $('#message').value = JSON.stringify(
    { isLivery: true, type, id: '', ...properties },
    null,
    1,
  );
}

liveryInteractive.init((message) => {
  $('#log').value += message;
});

$('#get-latency').addEventListener('click', async () => {
  latencyText.innerText = await liveryInteractive.getLatency();
});

$('#sub-orientation').addEventListener('click', () => {
  const setOrientation = (orientation) => {
    orientationText.innerText = orientation;
  };
  liveryInteractive.subscribeOrientation(setOrientation).then(setOrientation);
});

$('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const message = $('#message').value;
  window.postMessage(JSON.parse(message), '*');
});

$('#template-handshake').addEventListener('click', () => {
  setTemplate('handshake', { version: '' });
});

$('#template-command').addEventListener('click', () => {
  setTemplate('command', { name: '', arg: '' });
});

$('#template-resolve').addEventListener('click', () => {
  setTemplate('resolve', { value: '' });
});

$('#template-reject').addEventListener('click', () => {
  setTemplate('reject', { error: Error('Example error') });
});

$('#template-event').addEventListener('click', () => {
  setTemplate('event', { value: '' });
});
