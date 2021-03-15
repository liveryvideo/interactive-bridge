import { LiveryBridge } from './LiveryBridge';

export class InteractiveBridge extends LiveryBridge {
  constructor(targetOrigin: string) {
    super(window.parent, targetOrigin);
  }

  public getLatency() {
    return this.sendCommand('getLatency').then((value) => {
      if (typeof value !== 'number') {
        throw new Error(
          `getLatency value type: ${typeof value}, should be: number`,
        );
      }
      return value;
    });
  }

  public subscribeOrientation(
    listener: (orientation: 'landscape' | 'portrait') => void,
  ) {
    function validate(value: unknown) {
      if (value !== 'landscape' && value !== 'portrait') {
        const strValue = JSON.stringify(value);
        throw new Error(
          `subscribeOrientation value: ${strValue}, should be: "landscape" | "portrait"`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeOrientation', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  public subscribeStreamPhase(
    listener: (phase: 'LIVE' | 'POST' | 'PRE') => void,
  ) {
    function validate(value: unknown) {
      if (value !== 'LIVE' && value !== 'POST' && value !== 'PRE') {
        const strValue = JSON.stringify(value);
        throw new Error(
          `subscribeStreamPhase value: ${strValue}, should be: "LIVE" | "POST" | "PRE"`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeStreamPhase', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }
}
