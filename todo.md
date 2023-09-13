# Todo

- Fix typing
- separate InteractiveBridge facade from its LiveryBridge delegate

- unit tests for Transceivers, Targets and Ports
  - createPort creates the appropriate Port
  - createTarget creates the appropriate Target
- fix source window validity test
- create documentation for Transceiver
- refine port and target options interfaces

- make sure all types are exported from parser modules
- test the parsers rather than the individual subscribers

- add integration tests for setters and imperative commands

/\*
handleCommand could yield
{
value: T,
done: boolean,
} | undefined

listener shoud receive
{
value: T,
done: boolean
}

To help with composite pattern
\*/

The real focus here is separating the high-level policy from the low level details. And to do so in such a way that the two are independently testable.

We want to separate the specific commands from the sending and receiving of those commands
