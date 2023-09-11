# Todo

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
