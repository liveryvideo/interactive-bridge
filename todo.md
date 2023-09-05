# Todo

- unit tests for Transceivers, Targets and Ports
  - createPort creates the appropriate Port
  - createTarget creates the appropriate Target
- fix source window validity test
- create documentation for Transceiver
- refine port and target options interfaces

```typescript
type Listener = (value: Array<Quality | undefined>) => void;
class SubscribeQualitiesCommandHandler {
  command = 'subscribeQualities';

  private qualities: Array<Quality | undefined> = [];

  setQualities(value: Array<Quality | undefined>) {
    this.qualities = value;
    this.listener(value);
  }

  subscribeQualities(listener: Listener) {
    this.listener = listener;
    return this.qualities;
  }

  private listener: Listener = () => {};
}
```
