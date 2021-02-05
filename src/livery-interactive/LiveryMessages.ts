export interface LiveryMessage {
  id?: string;
  isLivery: true;
  type: string;
}

export interface HandshakeMessage extends LiveryMessage {
  id: string;
  type: 'handshake';
  version: string;
}

export interface ResolveMessage<ValueType> extends LiveryMessage {
  id: string;
  type: 'resolve';
  value: ValueType;
}

export interface RejectMessage extends LiveryMessage {
  error: Error;
  id: string;
  type: 'reject';
}

export interface CommandMessage<ArgType> extends LiveryMessage {
  arg: ArgType;
  id: string;
  name: string;
  type: 'command';
}

export interface SubscribeMessage<ArgType> extends LiveryMessage {
  arg: ArgType;
  id: string;
  name: string;
  type: 'command';
}

export interface EventMessage<ValueType> extends LiveryMessage {
  id: string;
  name: string;
  type: 'event';
  value: ValueType;
}

export class LiveryMessages {
  static isCommandMessage<ArgType>(
    object: LiveryMessage,
  ): object is CommandMessage<ArgType> {
    const command = object as CommandMessage<ArgType>;
    return (
      object.type === 'command' &&
      !!object.id &&
      !!command.name &&
      !!command.arg
    );
  }

  static isEventMessage(
    object: LiveryMessage,
  ): object is EventMessage<unknown> {
    const event = object as EventMessage<unknown>;
    return (
      object.type === 'subscribe' && !!event.id && !!event.name && !!event.value
    );
  }

  static isHandshakeMessage(object: LiveryMessage): object is HandshakeMessage {
    return (
      object.type === 'handshake' && !!(object as HandshakeMessage).version
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isLiveryMessage(object: any): object is LiveryMessage {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return object.isLivery === true && !!object.type;
  }

  static isRejectMessage(object: LiveryMessage): object is RejectMessage {
    return (
      object.type === 'reject' &&
      !!object.id &&
      !!(object as RejectMessage).error
    );
  }

  static isResolveMessage<ValueType>(
    object: LiveryMessage,
  ): object is ResolveMessage<ValueType> {
    return (
      object.type === 'resolve' &&
      !!object.id &&
      !!(object as ResolveMessage<ValueType>).value
    );
  }

  static isSubscribeMessage(
    object: LiveryMessage,
  ): object is SubscribeMessage<unknown> {
    const subscribe = object as SubscribeMessage<unknown>;
    return (
      object.type === 'subscribe' &&
      !!object.id &&
      !!subscribe.name &&
      !!subscribe.arg
    );
  }
}
