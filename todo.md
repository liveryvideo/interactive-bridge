# Todo

- unit tests for Transceivers, Targets and Ports
  - createPort creates the appropriate Port
  - createTarget creates the appropriate Target
- fix source window validity test
- create documentation for Transceiver
- refine port and target options interfaces

- subscribePlaybackMode
- subscribePlaybackState
- subscribeStreamPhaseTimeline
- play
- pause
- reload
- seek
- selectQuality
- setAirplay
- setChromecast
- setFullscreen
- setMuted
- setPictureInPicture

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
