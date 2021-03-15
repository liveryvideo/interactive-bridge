# Livery Interactive

Ex Machina Group Livery Interactive SDK.

This can be used on a Livery interactive layer page.

Please refer to [docs.liveryvideo.com/interactive](https://docs.liveryvideo.com/interactive) for complete documentation.

## Demo

The demo page, for use in a Livery Player, can be found at: [interactive.liveryvideo.com](https://interactive.liveryvideo.com)

To test with a mock player bridge use this page instead: [interactive.liveryvideo.com/mock.html](https://interactive.liveryvideo.com/mock.html)

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
