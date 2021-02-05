/* eslint-disable class-methods-use-this */
import { customElement, LitElement, property, html } from 'lit-element';
import { uuid } from './util/uuid';
import {
  LiveryMessage,
  HandshakeMessage,
  RejectMessage,
  LiveryMessages,
  CommandMessage,
} from './LiveryMessages';

declare global {
  interface HTMLElementTagNameMap {
    'livery-interactive': LiveryInteractive;
  }
}

@customElement('livery-interactive')
export class LiveryInteractive extends LitElement {
  private handshakeId: string;

  private resolveMap: Map<string, (value: number) => void>;

  // TODO: use actual version
  private tempVersion = '1';

  constructor() {
    super();

    this.resolveMap = new Map<string, (value: number | string) => void>();

    window.addEventListener('message', (e) => {
      if (LiveryMessages.isLiveryMessage(e.data)) {
        this.handleMessage(e.data);
      }
    });

    this.handshakeId = uuid();
    this.sendMessage(
      this.generateHandshake(this.handshakeId, this.tempVersion),
    );
  }

  // TODO: Handle id and promise form within generateCommand
  public getLatency(): Promise<number> {
    const id = uuid();
    this.sendMessage(
      this.generateCommand<string>('shouldBeVoid', 'latency', id),
    );

    return new Promise<number>((resolve) => {
      this.resolveMap.set(id, (value: number) => {
        resolve(value);
      });
    });
  }

  private generateCommand<ArgType>(
    arg: ArgType,
    name: string,
    id: string,
  ): CommandMessage<ArgType> {
    return {
      isLivery: true,
      type: 'command',
      name,
      id,
      arg,
    };
  }

  private generateHandshake(id: string, version: string): HandshakeMessage {
    return {
      isLivery: true,
      type: 'handshake',
      id,
      version,
    };
  }

  private generateReject(id: string, error: Error): RejectMessage {
    return {
      isLivery: true,
      type: 'reject',
      error,
      id,
    };
  }

  private handleHandshake(message: HandshakeMessage) {
    if (message.version !== this.tempVersion) {
      this.sendMessage(
        this.generateReject(
          message.id,
          new Error('Versions do not correspond'),
        ),
      );
    } else if (message.id !== this.handshakeId) {
      this.handshakeId = message.id;
      this.sendMessage(
        this.generateHandshake(this.handshakeId, this.tempVersion),
      );
    }
    // else would be a returning handshake, completing the handshake process.
  }

  private handleMessage(message: LiveryMessage) {
    console.log('ℹ️[Livery-Interactive] Incoming Message:', message);

    if (LiveryMessages.isHandshakeMessage(message)) {
      this.handleHandshake(message);
      return;
    }

    if (LiveryMessages.isResolveMessage<number>(message)) {
      const resolveFunc = this.resolveMap.get(message.id);
      console.log('ℹ️resolvemap', this.resolveMap);

      if (resolveFunc) {
        resolveFunc(message.value);
        this.resolveMap.delete(message.id);
      }
    }
  }

  private sendMessage(message: LiveryMessage) {
    const finalMessage = message as LiveryMessage & { IsLivery: boolean };
    finalMessage.IsLivery = true;
    window.parent.postMessage(finalMessage, '*');
    console.log('ℹ️[Livery-Interactive] Outgoing Message:', finalMessage);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  // render() {
  //   return html`
  //     <button
  //       @click=${() => {
  //         this.sendMessage({ type: 'test' });
  //       }}
  //     >
  //       Test button!
  //     </button>
  //   `;
  // }
}
