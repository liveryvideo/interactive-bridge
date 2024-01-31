# Livery Video Interactive Bridge

[![npm package](https://img.shields.io/npm/v/@liveryvideo/interactive-bridge.svg?logo=npm)](https://www.npmjs.com/package/@liveryvideo/interactive-bridge)
[![conventional CHANGELOG](https://img.shields.io/badge/conventional-CHANGELOG-FE5196.svg?logo=conventionalcommits)](https://docs.livery.live/interactive-bridge-changelog)
[![docsify Documentation](https://img.shields.io/badge/docsify-Documentation-2ECE53.svg?logo=docsify)](https://docs.livery.live/interactive-bridge)
[![tsdocs API](https://img.shields.io/badge/tsdocs-API-3178C6.svg?logo=typescript)](https://tsdocs.dev/docs/@liveryvideo/interactive-bridge/modules.html)
[![Lit Elements](https://img.shields.io/badge/Lit-Elements-324FFF.svg?logo=lit)](https://lit.dev/)
[![license MIT](https://img.shields.io/npm/l/@liveryvideo/interactive-bridge.svg?color=808080&logo=unlicense)](https://cdn.jsdelivr.net/npm/@liveryvideo/interactive-bridge/LICENSE)

Bridge for communicating between a Livery Video Player and the interactive layer page shown within that.

The main part of this package you are likely to use is the `InteractiveBridge` class, see `Usage` below
and our [API](https://tsdocs.dev/docs/@liveryvideo/interactive-bridge/modules.html) for details.

Please refer to our [Documentation](https://docs.livery.live/interactive-bridge) for further information.

## Installation

```bash
npm install @liveryvideo/interactive-bridge
```

## Usage

```JS
import { InteractiveBridge } from '@liveryvideo/interactive-bridge';

const bridge = new InteractiveBridge('*');

bridge.getLatency().then(latency => window.alert(`latency: ${latency}`));
```

**Note:** To prevent [cross site security issues](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns) replace the `'*'` origin above with the origin of the page that the Livery Video Player containing this interactive layer page will be on.
