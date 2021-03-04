import { LiveryBridge } from './LiveryBridge';

export class MockSdkBridge extends LiveryBridge {
  private portraitListening = false;

  private portraitQuery = window.matchMedia('(orientation: portrait)');

  protected handleCommand(name: string, arg: unknown) {
    if (name === 'getLatency') {
      return this.getLatency();
    }

    return super.handleCommand(name, arg);
  }

  protected handleSubscribe(name: string, arg: unknown): Promise<unknown> {
    if (name === 'orientation') {
      return this.subscribeOrientation();
    }

    return super.handleCommand(name, arg);
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async getLatency() {
    return Math.random() * 6;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async subscribeOrientation() {
    if (!this.portraitListening) {
      this.portraitQuery.addEventListener('change', (event) => {
        this.sendEvent('orientation', event.matches ? 'portrait' : 'landscape');
      });
      this.portraitListening = true;
    }

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }
}
