# Livery Video Interactive Bridge

[![GitHub last commit](https://img.shields.io/github/last-commit/liveryvideo/interactive-bridge)](https://github.com/liveryvideo/interactive-bridge)
[![NPM package](https://img.shields.io/npm/v/@liveryvideo/interactive-bridge)](https://www.npmjs.com/package/@liveryvideo/interactive-bridge)
[![Changelog](https://img.shields.io/badge/docs-CHANGELOG-blue)](https://docs.liveryvideo.com/interactive-bridge-changelog)
[![License](https://img.shields.io/npm/l/@liveryvideo/interactive-bridge)](https://unpkg.com/browse/@liveryvideo/interactive-bridge/LICENSE)
[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://open-wc.org/)

Livery Video Interactive Bridge for use on/with Livery Player interactive layer pages.

Please refer to [docs.liveryvideo.com/interactive-bridge](https://docs.liveryvideo.com/interactive-bridge) for complete documentation.

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

**Note:** To prevent [cross site security issues](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns) replace the `'*'` origin above with the origin of the page that the Livery Player containing this interactive layer page will be on.
