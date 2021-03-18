import { expect } from '@open-wc/testing';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { LiveryBridge } from '../src/LiveryBridge';

describe('InteractiveBridge', () => {
  // TODO: Write a proper suite of tests

  it('extends LiveryBridge', () => {
    const bridge = new InteractiveBridge('*');

    expect(bridge).to.be.an.instanceOf(LiveryBridge);
  });
});
