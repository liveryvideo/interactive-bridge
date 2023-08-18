/* eslint-disable no-new */
/* eslint-disable lines-between-class-members */
import { describe, expect, test } from 'vitest';
import { InteractiveBridge } from '../src/InteractiveBridge';
import type { PostMessagable } from '../src/LiveryBridge';

class SpyWindow implements PostMessagable {
  parent: PostMessagable;
  record = '';

  constructor(parent?: PostMessagable) {
    this.parent = parent || this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addEventListener() {
    this.record += 'H';
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  postMessage() {
    this.record += 'M';
  }
}

describe('in top level window', () => {
  test('constructed with string calls postmessage on window.parent', () => {
    const window = new SpyWindow();
    new InteractiveBridge('my-target-origin', window);
    expect(window.record).toBe('HM');
  });
});

describe('in nested window', () => {
  test('constructed with string calls postmessage on window', () => {
    const parentWindow = new SpyWindow();
    const childWindow = new SpyWindow(parentWindow);
    new InteractiveBridge('my-target-origin', childWindow);
    expect(parentWindow.record).toBe('M');
    expect(childWindow.record).toBe('H');
  });
});
