import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { Engine } from "./engine.js";
import { MidiManagerInstance } from "./midi.js";

const WIDTH = 32;
// Debug
const gui = new dat.GUI();

const debugObject = {
  option: 0,
};

const engine = new Engine();

engine.run();

engine.particles.setAmplitude(0.2);
engine.particles.setMaxDistance(0.3);
engine.particles.setFrequency(2.0);

const handleControllerChange = (event) => {
  console.log(event);
  if (event.controlId === 42) {
    const newAmplitude = (event.value / 126) * 3 + 0.06;
    engine.particles.setAmplitude(newAmplitude);
  } else if (event.controlId === 22) {
    const newFrequency = (event.value / 126) * 1 + 0.06;
    engine.particles.setFrequency(newFrequency);
  }
};

const setupGUI = (midiManager) => {
  const inputs = midiManager.getInputs();

  const options = [];
  for (let input of inputs) {
    console.log(input);
    options.push(input[1].name);
  }
  debugObject.option = options[0];
  midiManager.setMidiInterface(options[0]);

  const midiFolder = gui.addFolder("Midi");
  midiFolder
    .add(debugObject, "option")
    .options(options)
    .onFinishChange((val) => {
      midiManager.setMidiInterface(val);
    });
};

MidiManagerInstance.ready((midiManager, err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Midi manager started...");
  setupGUI(midiManager);
  midiManager.onControllerChange((event) => handleControllerChange(event));
});
