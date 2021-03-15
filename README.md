# Livery Interactive SDK

[![GitHub last commit](https://img.shields.io/github/last-commit/exmg/livery-interactive)](https://github.com/exmg/livery-interactive)
[![NPM package](https://img.shields.io/npm/v/@exmg/livery-interactive)](https://www.npmjs.com/package/@exmg/livery-interactive)
[![Changelog](https://img.shields.io/badge/docs-CHANGELOG-blue)](https://docs.liveryvideo.com/interactive-sdk-changelog)
[![License](https://img.shields.io/npm/l/@exmg/livery-interactive)](https://unpkg.com/browse/@exmg/livery-interactive/LICENSE)
[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://open-wc.org/)

Ex Machina Group Livery Interactive SDK for use with LiveryPlayer interactive layer pages.

Please refer to [docs.liveryvideo.com/interactive-sdk](https://docs.liveryvideo.com/interactive-sdk) for complete documentation.

## Installation

```bash
npm install @exmg/livery-interactive
```

## Usage

```JS
import { InteractiveBridge } from '@exmg/livery-interactive';

const bridge = new InteractiveBridge('*');

bridge.getLatency().then(latency => window.alert(`latency: ${latency}`));
```

**Note:** To prevent [cross site security issues](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns) replace the `'*'` origin above with the origin of the page that the Livery Player containing this interactive layer page will be on.
