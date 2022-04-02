export const MIDI_EVENTS = {
  CONTROLLER: 176,
  NOTE_ON: 144,
  NOTE_OFF: 128,
};

export const MIDI_MESSAGE_TYPE = {
  CONTROLLER: "controllerChange",
  NOTE_ON: "nodeOn",
  NOTE_OFF: "nodeOff",
};

class MidiMapping {
  constructor({ property, midiMessage, maxValue, minValue }) {
    this.property = property;
    this.midiMessage = midiMessage;
    this.maxValue = maxValue;
    this.minValue = minValue;
  }
}

export class MidiMapper {
  constructor(midiController, targetObject) {
    this.midiController = midiController;
    this.targetObject = targetObject;
    this.currentMidiMessage;
    this.midiMappings = [];
    this.currentMidiMapping = null;
    this.onCurrentMidiMessageChangeCallback = () => {};
    this.midiController.addMidiMessageListener((message) => {
      this.currentMidiMessage = message;
      this.#updateValueFromMessage(message);
      this.onCurrentMidiMessageChangeCallback(this.currentMidiMessage);
    });
  }

  onCurrentMidiMessageChange(callback) {
    this.onCurrentMidiMessageChangeCallback = callback;
  }

  #updateValueFromMessage(message) {
    for (let i = 0; i < this.midiMappings.length; i++) {
      if (
        this.midiMappings[i].midiMessage.controlId &&
        this.midiMappings[i].midiMessage.controlId === message.controlId
      ) {
        const key = this.midiMappings[i].property;
        const minVal = this.midiMappings[i].minValue;
        const maxVal = this.midiMappings[i].maxValue;
        const x = message.value / 128;
        const scaledValue = x * (maxVal - minVal) + minVal;
        this.targetObject[key] = scaledValue;
      }
    }
  }

  getSavedMappingsList() {
    let keyIndex = 0;
    const savedMappings = [];
    while (localStorage.key(keyIndex) !== null) {
      const key = localStorage.key(keyIndex);
      const mapping = localStorage.getItem(key);
      if (mapping !== null) {
        savedMappings.push({ key, mapping: JSON.parse(mapping) });
      }
      keyIndex++;
    }
    return savedMappings;
  }

  saveToStorage(name) {
    localStorage.setItem(name, JSON.stringify(this.midiMappings));
  }

  loadFromStorage(name) {
    const midiMappings = JSON.parse(localStorage.getItem(name));
    if (midiMappings) this.midiMappings = midiMappings;
    else console.warn("cannot load midi mapping...");
  }

  eraseFromStorage(name) {
    localStorage.removeItem(name);
  }

  removeMapping(mapping) {
    this.midiMappings = this.midiMappings.filter((m) => {
      if (
        m.property === mapping.property &&
        m.midiMessage.controlId === mapping.midiMessage.controlId
      ) {
        return false;
      } else {
        return true;
      }
    });
  }

  startMapping({ property, maxValue = 1, minValue = 0 }) {
    this.currentMidiMapping = new MidiMapping({
      property,
      maxValue,
      minValue,
    });
  }

  endMapping() {
    if (!this.currentMidiMapping || !this.currentMidiMessage) return;
    const tempMidiMapping = this.currentMidiMapping;
    tempMidiMapping.midiMessage = this.currentMidiMessage;
    this.removeMapping(tempMidiMapping);
    this.currentMidiMapping.midiMessage = this.currentMidiMessage;
    this.midiMappings.push(this.currentMidiMapping);
  }
}

class MidiController {
  constructor(midi) {
    this.midi = midi;
    this.controllerChangeCallbacks = [];
    this.onNoteOnCallbacks = [];
    this.onNoteOffCallbacks = [];
    this.midiMessageListeners = [];
    this.midi.onstatechange = this.#handleMidiStateChange.bind(this);
    this.onMidiStateChangeCallbacks = [];
    this.midiInterface = {
      name: "",
    };
  }

  #handleMidiStateChange(event) {
    this.onMidiStateChangeCallbacks.forEach((c) => c(event));
  }

  addMidiStateChangeListener(callback) {
    this.onMidiStateChangeCallbacks.push(callback);
  }

  parseMidiMessage(message) {
    const data = message.data;

    switch (data[0]) {
      case MIDI_EVENTS.CONTROLLER: {
        return {
          type: MIDI_MESSAGE_TYPE.CONTROLLER,
          controlId: data[1],
          value: data[2],
        };
      }
      case MIDI_EVENTS.NOTE_ON: {
        return {
          type: MIDI_MESSAGE_TYPE.NOTE_ON,
          note: data[1],
          velocity: data[2],
        };
      }
      case MIDI_EVENTS.NOTE_OFF: {
        return {
          type: MIDI_MESSAGE_TYPE.NOTE_OFF,
          note: data[1],
        };
      }
      default: {
        return {
          type: data[0],
          data1: data[1],
          data2: data[2],
        };
      }
    }
  }

  #handleMidiMessage(message) {
    const parsedMidiMessage = this.parseMidiMessage(message);

    switch (parsedMidiMessage.type) {
      case MIDI_MESSAGE_TYPE.CONTROLLER: {
        this.controllerChangeCallbacks.forEach((callback) =>
          callback(parsedMidiMessage)
        );
        break;
      }
      case MIDI_MESSAGE_TYPE.NOTE_ON: {
        this.onNoteOnCallbacks.forEach((callback) => {
          callback(parsedMidiMessage);
        });
        break;
      }
      case MIDI_MESSAGE_TYPE.NOTE_OFF: {
        this.onNoteOffCallbacks.forEach((callback) => {
          callback(parsedMidiMessage);
        });
        break;
      }
      default: {
        console.warn("unknown midi message", parsedMidiMessage);
        break;
      }
    }
    this.midiMessageListeners.forEach((listener) =>
      listener(parsedMidiMessage)
    );
  }

  addMidiMessageListener(callback) {
    this.midiMessageListeners.push(callback);
  }

  addControllerChangeListener(callback) {
    this.controllerChangeCallbacks.push(callback);
  }

  addNoteOnListener(callback) {
    this.onNoteOnCallbacks.push(callback);
  }

  addNoteOffListener(callback) {
    this.onNoteOffCallbacks.push(callback);
  }

  setActiveMidiInterface(midiInterface) {
    this.midiInterface = midiInterface;
    this.midiInterface.onmidimessage = this.#handleMidiMessage.bind(this);
  }

  getInputs() {
    return this.midi.inputs;
  }
  getOutputs() {
    return this.midi.outputs;
  }
}

class MidiControllerFactoryImpl {
  createController() {
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

export const MidiControllerFactory = new MidiControllerFactoryImpl();
