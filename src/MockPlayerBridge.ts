import { LiveryBridge } from './LiveryBridge';

export class MockPlayerBridge extends LiveryBridge {
  private portraitQuery = window.matchMedia('(orientation: portrait)');

  constructor(targetWindow: Window, targetOrigin: string) {
    super(targetWindow, targetOrigin);

    this.registerCustomCommand('subscribeAuthToken', (arg, listener) => {
      if (typeof arg !== 'string') {
        throw new Error(`Argument type: ${typeof arg}, should be: string`);
      }

      window.setTimeout(() => listener(`${arg}-test-token-2`), 3000);
      window.setTimeout(() => listener(`${arg}-test-token-3`), 10000);

      return `${arg}-test-token-1`;
    });
  }

  protected handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name === 'getLatency') {
      return this.getLatency();
    }
    if (name === 'subscribeOrientation') {
      return this.subscribeOrientation(listener);
    }
    if (name === 'subscribeStreamPhase') {
      return this.subscribeStreamPhase(listener);
    }

    return super.handleCommand(name, arg, listener);
  }

  // eslint-disable-next-line class-methods-use-this --- this usage is not necessary
  private getLatency() {
    return Math.random() * 6;
  }

  private subscribeOrientation(listener: (value: unknown) => void) {
    this.portraitQuery.addEventListener('change', (event) => {
      listener(event.matches ? 'portrait' : 'landscape');
    });

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  // eslint-disable-next-line class-methods-use-this --- this usage is not necessary
  private subscribeStreamPhase(listener: (value: unknown) => void) {
    const phases = ['PRE', 'LIVE', 'POST'];
    let i = 0;
    const updatePhase = () => {
      setTimeout(() => {
        i += 1;
        if (i < phases.length) {
          listener(phases[i]);
          updatePhase();
        }
      }, 1500);
    };
    updatePhase();

    return phases[0];
  }
}
