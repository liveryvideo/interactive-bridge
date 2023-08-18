/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
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

  addEventListener(type: any, listener: any, options?: any): void {
    this.record += 'L';
  }

  postMessage(message: any, targetOrigin: any, transfer?: any): void {
    if (message.type === 'handshake') this.record += 'H';
  }
}

describe('in top level window', () => {
  describe('using postmessage', () => {
    test('constructed with string sends handshake to own window', () => {
      const ownWindow = new SpyWindow();
      new InteractiveBridge('my-target-origin', { ownWindow });
      expect(ownWindow.record).toBe('LH');
    });
  });
});

describe('in nested window', () => {
  test('constructed with string calls postmessage on parent', () => {
    const parentWindow = new SpyWindow();
    const childWindow = new SpyWindow(parentWindow);
    new InteractiveBridge('my-target-origin', { ownWindow: childWindow });
    expect(parentWindow.record).toBe('H');
    expect(childWindow.record).toBe('L');
  });
});
