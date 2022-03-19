class MidiController {
  constructor(midi) {
    this.midi = midi;
    this.controllerChangeCallbacks = [];
    this.onNoteOnCallbacks = [];
    this.onNoteOffCallbacks = [];
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

  handleMidiMessage(message) {
    const data = message.data;
    console.log("MIDI EVENT", data[0]);
    console.log("VALUE", data[1]);
    console.log("VELOCITY", data[2]);
    switch (data[0]) {
      case 176: {
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
      case 144: {
        //note on event
        this.onNoteOnCallbacks.forEach((callback) => {
          callback({
            type: "nodeOn",
            note: data[1],
            velocity: data[2],
          });
        });
      }
      case 128: {
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

  setMidiInterface(name) {
    for (const [id, input] of this.midi.inputs) {
      if (input.name === name) {
        this.midiInterface = input;
        this.midiInterface.onmidimessage = this.handleMidiMessage.bind(this);
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

  listInputsAndOutputs() {
    for (var entry of this.midi.inputs) {
      var input = entry[1];
      console.log(
        "Input port [type:'" +
          input.type +
          "'] id:'" +
          input.id +
          "' manufacturer:'" +
          input.manufacturer +
          "' name:'" +
          input.name +
          "' version:'" +
          input.version +
          "'"
      );
    }

    for (var entry of this.midi.outputs) {
      var output = entry[1];
      console.log(
        "Output port [type:'" +
          output.type +
          "'] id:'" +
          output.id +
          "' manufacturer:'" +
          output.manufacturer +
          "' name:'" +
          output.name +
          "' version:'" +
          output.version +
          "'"
      );
    }
  }
}

class MidiManager {
  ready(callback) {
    const onMIDIFailure = (msg) => {
      console.log("Failed to get MIDI access - " + msg);
      callback(new MidiController(null), msg);
    };

    const onMidiSuccess = (midiAccess) => {
      callback(new MidiController(midiAccess));
    };

    navigator
      .requestMIDIAccess()
      .then((midiAccess) => onMidiSuccess(midiAccess))
      .catch((msg) => onMIDIFailure(msg));
  }
}

export const MidiManagerInstance = new MidiManager();
