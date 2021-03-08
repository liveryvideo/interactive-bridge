import { LiveryBridge, CommandMessage } from './LiveryBridge';

export class MockSdkBridge extends LiveryBridge {
  private portraitListening = false;

  private portraitQuery = window.matchMedia('(orientation: portrait)');

  protected handleCommand<ArgType>(message: CommandMessage<ArgType>) {
    if (message.name === 'getLatency') {
      return this.getLatency();
    }
    if (message.name === 'subscribeOrientation') {
      return this.subscribeOrientation(message.id);
    }

    return super.handleCommand<ArgType>(message);
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async getLatency() {
    return Math.random() * 6;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  private async subscribeOrientation(id: string) {
    if (!this.portraitListening) {
      this.portraitQuery.addEventListener('change', (event) => {
        this.sendEvent(id, event.matches ? 'portrait' : 'landscape').catch(
          (error) => {
            throw new Error(error);
          },
        );
      });
      this.portraitListening = true;
    }

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }
}
