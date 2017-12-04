# twister-interceptor

Shifts incoming midi control change messages on channel 5 to channel 6 to allow
two MIDI Fighter Twister controllers to work in "Shift Encoder Toggle" mode
without conflicting. The Midi Fighter Twister utility does allow changing the
channel a rotary communicates on when "unshifted" aka "knob 1", however
"shifted", or "knob 2" is hardcoded to communicate on channel 5 (hence, this
program).

Works by forwarding midi messages to and from the Midi Fighter Twister's port to
a virtual port on the OS.

## Setup

### Mac OS

Create an IAC Driver named **t2**. It should appear as **IAC Driver t2**.

### Ableton Live

Set the Input and Output sections for **IAC Driver t2** to **Remote**.

> Note: the second Midi Fighter Twister device should send all rotary
> communication on a _different_ channel than the first device (default is
> channel 1). Do NOT use channel 3, as when sending messages _back_ to the
> twister, channel 3 is interperated as special color change messages. I use
> channel 7 on the second device, and leave the first on channel 1.
