import React, { Component } from 'react'
import g from 'glamorous'

const Container = g.div({
  paddingTop: '2rem'
})

const DeviceEntry = g.div(p => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  marginBottom: '0.5rem',
  padding: '1rem',
  backgroundColor: p.active ? 'lightgreen' : 'white',
  border: p.active ? '2px solid black' : 0,
  borderRadius: '2px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: p.active ? 'lightgreen' : 'lightgray'
  }
}))

const PORT_NAME = /Midi Fighter Twister/
const DEST_PORT_NAME = /IAC Driver t2/

export default class App extends Component {
  static removeSplash() {
    document.body.removeChild(document.getElementById('splash'))
  }

  state = {
    twister: { inputs: [], outputs: [] },
    destination: { input: null, output: null },
    leds: [],
    intercepted: null,
    messages: [],
    message: ''
  }

  async componentWillMount() {
    await this.getDevices()
    App.removeSplash()
    this.listen()
  }

  async getDevices() {
    const { inputs, outputs } = await window.navigator.requestMIDIAccess()

    const twisterInputs = getPortsByRegExp(inputs, PORT_NAME)

    this.setState({
      twister: {
        inputs: getPortsByRegExp(inputs, PORT_NAME),
        outputs: getPortsByRegExp(outputs, PORT_NAME)
      },
      destination: {
        input: getPortsByRegExp(inputs, DEST_PORT_NAME)[0],
        output: getPortsByRegExp(outputs, DEST_PORT_NAME)[0]
      },
      leds: Array(twisterInputs.length).fill(false)
    })
  }

  listen() {
    this.state.twister.inputs.forEach((input, index) => {
      input.addEventListener('midimessage', ({ data }) => {
        const messages = this.state.messages.slice()
        const leds = this.state.leds.slice()
        leds[index] = true
        messages[index] = data.toString()

        this.setState({ leds, messages }, () => {
          setTimeout(() => {
            const leds = this.state.leds.slice()
            leds[index] = false
            this.setState({ leds })
          }, 118)
        })
      })
    })
  }

  toggleIntercept(index) {
    if (this.state.intercepted === null) {
      this.setState({ intercepted: index })
      this.startIntercept(index)
    } else {
      this.stopIntercept(index)
      this.setState({ intercepted: null })
    }
  }

  stopIntercept(index) {
    this.state.twister.inputs[index].removeEventListener(
      'midimessage',
      this.inputListener
    )
    this.state.destination.input.removeEventListener(
      'midimessage',
      this.destinationInputListener
    )
  }

  startIntercept(index) {
    const input = this.state.twister.inputs[index]
    const output = this.state.twister.outputs[index]

    input.addEventListener(
      'midimessage',
      (this.inputListener = message => {
        const [status, ...data] = message.data

        const out = [
          // both MFT send shifted encoder on channel 5,
          // make sure second device sends on channel 6
          status === 180 ? status + 1 : status,
          ...data
        ]

        this.state.destination.output.send(out)

        this.setState({
          message: out.toString()
        })
      })
    )

    this.state.destination.input.addEventListener(
      'midimessage',
      (this.destinationInputListener = message => {
        const [status, ...data] = message.data

        // "undo" channel shift back to MFT
        output.send([status === 181 ? 180 : status, ...data])
      })
    )
  }

  render() {
    const { twister: { inputs }, intercepted, message, messages } = this.state

    if (!inputs.length) {
      return null
    }

    return (
      <Container>
        {inputs.map((device, index) => (
          <DeviceEntry
            key={device.id}
            active={index === intercepted}
            onClick={() => this.toggleIntercept(index)}
          >
            {device.name}
            &nbsp;&nbsp;{messages[index]}
            {index === intercepted && message && message !== messages[index]
              ? ` -> ${message}`
              : ''}
          </DeviceEntry>
        ))}
      </Container>
    )
  }
}

function getPortsByRegExp(portMap, regExp) {
  return Array.from(portMap.values()).filter(port => regExp.test(port.name))
}
