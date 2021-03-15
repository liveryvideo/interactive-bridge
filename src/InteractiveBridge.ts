import { LiveryBridge } from './LiveryBridge';

export class InteractiveBridge extends LiveryBridge {
  constructor(targetOrigin: string) {
    super(window.parent, targetOrigin);
  }

  public getLatency() {
    return this.sendCommand({
      name: 'getLatency',
      validate: (value) => LiveryBridge.validatePrimitive(value, 'number'),
    });
  }

  public subscribeOrientation(
    listener: (orientation: 'landscape' | 'portrait') => void,
  ) {
    return this.sendCommand({
      name: 'subscribeOrientation',
      listener,
      validate: (value) => {
        if (value !== 'landscape' && value !== 'portrait') {
          const strValue = JSON.stringify(value);
          throw new Error(
            `Received subscribeOrientation value: ${strValue}, should be: "landscape" | "portrait"`,
          );
        }
        return value;
      },
    });
  }

  public subscribeStreamPhase(
    listener: (phase: 'LIVE' | 'POST' | 'PRE') => void,
  ) {
    return this.sendCommand({
      name: 'subscribeStreamPhase',
      listener,
      validate: (value) => {
        if (value !== 'LIVE' && value !== 'POST' && value !== 'PRE') {
          const strValue = JSON.stringify(value);
          throw new Error(
            `Received subscribeStreamPhase value: ${strValue}, should be: "LIVE" | "POST" | "PRE"`,
          );
        }
        return value;
      },
    });
  }
}
