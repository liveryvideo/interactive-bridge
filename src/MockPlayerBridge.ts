import { LiveryBridge } from './LiveryBridge';

export class MockPlayerBridge extends LiveryBridge {
  private portraitQuery = window.matchMedia('(orientation: portrait)');

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
