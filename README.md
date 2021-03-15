# Livery Interactive

Ex Machina Group Livery Interactive SDK.

This can be used on a Livery interactive layer page.

Please refer to [docs.liveryvideo.com/interactive](https://docs.liveryvideo.com/interactive) for complete documentation.

## Demo

A demo interactive page can be found at: [interactive.liveryvideo.com](https://interactive.liveryvideo.com)

This can be used as a Livery interactive page for testing purposes.

If you'd like to test with a mock player bridge you can use:

- [interactive.liveryvideo.com?mock](https://interactive.liveryvideo.com?mock) - With mock bridge on same page
- [interactive.liveryvideo.com/mock.html](https://interactive.liveryvideo.com/mock.html) - Mock bridge page with interactive page in iframe

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
