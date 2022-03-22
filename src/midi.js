const MIDI_EVENTS = {
  CONTROLLER: 176,
  NOTE_ON: 144,
  NOTE_OFF: 128,
};

class MidiController {
  constructor(midi) {
    this.midi = midi;
    this.controllerChangeCallbacks = [];
    this.onNoteOnCallbacks = [];
    this.onNoteOffCallbacks = [];
    this.midi.onstatechange = this.#onMidiStateChange.bind(this);
    this.onMidiStateChangeCallback = () => {};
  }

  #onMidiStateChange(event) {
    this.onMidiStateChangeCallback(event);
  }

  onMidiStateChange(callback) {
    this.onMidiStateChangeCallback = callback;
  }

  #handleMidiMessage(message) {
    const data = message.data;

    switch (data[0]) {
      case MIDI_EVENTS.CONTROLLER: {
        //controller event
        this.controllerChangeCallbacks.forEach((callback) =>
          callback({
            type: "controllerChange",
            controlId: data[1],
            value: data[2],
          })
        );
        break;
      }
      case MIDI_EVENTS.NOTE_ON: {
        //note on event
        this.onNoteOnCallbacks.forEach((callback) => {
          callback({
            type: "nodeOn",
            note: data[1],
            velocity: data[2],
          });
        });
      }
      case MIDI_EVENTS.NOTE_OFF: {
        //note off event
        this.onNoteOffCallbacks.forEach((callback) => {
          callback({
            type: "nodeOff",
            note: data[1],
          });
        });
      }
    }
  }

  onControllerChange(callback) {
    this.controllerChangeCallbacks.push(callback);
  }

  onNoteOn(callback) {
    this.onNoteOnCallbacks.push(callback);
  }

  onNoteOff(callback) {
    this.onNoteOffCallbacks.push(callback);
  }

  setMidiInterface(name) {
    for (const [id, input] of this.midi.inputs) {
      if (input.name === name) {
        this.midiInterface = input;
        this.midiInterface.onmidimessage = this.#handleMidiMessage.bind(this);
        break;
      }
    }
  }

  getInputs() {
    return this.midi.inputs;
  }
  getOutputs() {
    return this.midi.outputs;
  }
}

class MidiManagerImpl {
  ready() {
    return new Promise((resolve, reject) => {
      const onMIDIFailure = (msg) => {
        console.log("Failed to get MIDI access - " + msg);
        reject(msg);
      };

      const onMidiSuccess = (midiAccess) => {
        resolve(new MidiController(midiAccess));
      };

      navigator
        .requestMIDIAccess()
        .then((midiAccess) => onMidiSuccess(midiAccess))
        .catch((msg) => onMIDIFailure(msg));
    });
  }
}

export const MidiManager = new MidiManagerImpl();
