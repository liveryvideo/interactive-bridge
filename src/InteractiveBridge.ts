import { LiveryBridge } from './LiveryBridge';

export class InteractiveBridge extends LiveryBridge {
  public getLatency() {
    return this.sendCommand<number>('getLatency', undefined);
  }

  public subscribeOrientation(listener: (orientation: string) => void) {
    return this.sendSubscribe('orientation', undefined, listener);
  }
}
