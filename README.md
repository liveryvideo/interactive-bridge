# Livery Video Interactive Bridge

[![npm package](https://img.shields.io/npm/v/@liveryvideo/interactive-bridge.svg?logo=npm)](https://www.npmjs.com/package/@liveryvideo/interactive-bridge)
[![conventional CHANGELOG](https://img.shields.io/badge/conventional-CHANGELOG-FE5196.svg?logo=conventionalcommits)](https://docs.livery.live/npm/interactive-bridge/CHANGELOG)
[![tsdoc API](https://img.shields.io/badge/tsdoc-API-3178C6.svg?logo=typescript)](https://docs.livery.live/npm/interactive-bridge/dist/)
[![docsify Documentation](https://img.shields.io/badge/docsify-Documentation-2ECE53.svg?logo=docsify)](https://docs.livery.live/interactive-bridge)
[![Lit Elements](https://img.shields.io/badge/Lit-Elements-324FFF.svg?logo=lit)](https://lit.dev/)
[![license MIT](https://img.shields.io/npm/l/@liveryvideo/interactive-bridge.svg?color=808080&logo=unlicense)](https://cdn.jsdelivr.net/npm/@liveryvideo/interactive-bridge/LICENSE)

Bridge for communicating between a Livery Video Player and the interactive layer page shown within that.

Please refer to our [docs](https://docs.livery.live/interactive-bridge) page for further information.

You can also view the [CHANGELOG](CHANGELOG.md) and [API](dist/index.md) documentation that are included in this NPM package from there.

## Installation

```bash
npm install @liveryvideo/interactive-bridge
```

## Usage

The main class to be used from this package is the InteractiveBridge:

```JS
import { InteractiveBridge } from '@liveryvideo/interactive-bridge';
// The playerBridge will be provided to you as interactive element as interactive webview or iframe
const bridge = new InteractiveBridge(playerBridge || '*');
// To prevent cross site security issues:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns
// replace the `'*'` origin above with the origin of the page that the Livery Player is on
bridge.getOptions().then(options => window.alert(`appName: ${options.appName}`));
```
