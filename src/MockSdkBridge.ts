import { LiveryBridge } from './LiveryBridge';

export class MockSdkBridge extends LiveryBridge {
  private portraitListeners: string[] = [];

  private portraitQuery = window.matchMedia('(orientation: portrait)');

  protected handleCommand(
    message: Parameters<LiveryBridge['handleCommand']>[0],
  ) {
    if (message.name === 'getLatency') {
      return this.getLatency();
    }
    if (message.name === 'subscribeOrientation') {
      return this.subscribeOrientation(message.id);
    }

    return super.handleCommand(message);
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async getLatency() {
    return Math.random() * 6;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async subscribeOrientation(id: string) {
    if (this.portraitListeners.indexOf(id) === -1) {
      this.portraitListeners.push(id);
      this.portraitQuery.addEventListener('change', (event) => {
        this.sendEvent(id, event.matches ? 'portrait' : 'landscape').catch(
          (error) => {
            throw new Error(error);
          },
        );
      });
    }

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }
}
