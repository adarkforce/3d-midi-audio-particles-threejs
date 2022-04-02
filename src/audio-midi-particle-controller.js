import { MidiControllerFactory, MidiMapper } from "./midi.js";
import { AudioManager as AudioInterfaceController } from "./audio.js";
import * as THREE from "three";

export class AudioMidiParticlesController {
  constructor(particles) {
    this.particles = particles;

    this.clock = new THREE.Clock();

    this.params = {
      amplitude: 3,
      frequency: 0.1,
      maxDistance: 3,
      freq1: 10,
      freq2: 50,
      freq3: 150,
      timeX: 2,
      timeY: 2,
      timeZ: 2,
      interpolation: 0.2,
    };

    this.frequencyValue1 = 0;
    this.frequencyValue2 = 0;
    this.frequencyValue3 = 0;
  }

  static async create(particles) {
    const audioMidiParticlesBinder = new AudioMidiParticlesController(
      particles
    );
    await audioMidiParticlesBinder.#setupAudioControls();
    await audioMidiParticlesBinder.#setupMidiControls();
    return audioMidiParticlesBinder;
  }

  async #setupAudioControls() {
    this.audioInterfaceController = new AudioInterfaceController();
    this.audioDevices = await this.audioInterfaceController.getInputDevices();
    this.audioInterfaceController.listenTo(this.audioDevices[0].deviceId);
  }

  async #setupMidiControls() {
    this.midiController = await MidiControllerFactory.createController();
    const inputs = [];
    for (const [id, midiInput] of this.midiController.getInputs()) {
      inputs.push(midiInput);
    }
    const midiInterface = inputs[0];
    if (!midiInterface) return;
    this.midiController.setActiveMidiInterface(midiInterface);
    this.midiMapper = new MidiMapper(this.midiController, this.params);
  }

  #processAudio() {
    this.audioInterfaceController.updateAudioInfo();

    const freqValue1 =
      this.audioInterfaceController.freqData[Math.floor(this.params.freq1)];
    this.frequencyValue1 = freqValue1 / 256;

    const freqValue2 =
      this.audioInterfaceController.freqData[Math.floor(this.params.freq2)];
    this.frequencyValue2 = freqValue2 / 256;

    const freqValue3 =
      this.audioInterfaceController.freqData[Math.floor(this.params.freq3)];
    this.frequencyValue3 = freqValue3 / 256;
  }

  #updateParams() {
    let amplitude = this.params.amplitude;

    let frequency = this.params.frequency;

    let maxDistance = this.params.maxDistance;

    let timeX = this.params.timeX * this.frequencyValue1;

    let timeY = this.params.timeY * this.frequencyValue2;

    let timeZ = this.params.timeZ * this.frequencyValue3;

    let interpolation = this.params.interpolation;

    return {
      amplitude,
      frequency,
      timeX,
      timeY,
      timeZ,
      maxDistance,
      interpolation,
    };
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const {
      amplitude,
      frequency,
      timeX,
      timeY,
      timeZ,
      maxDistance,
      interpolation,
    } = this.#updateParams();
    this.#processAudio();
    this.particles.setTimeElapsed(elapsedTime);
    this.particles.setAmplitude(amplitude);
    this.particles.setFrequency(frequency);
    this.particles.setMaxDistance(maxDistance);
    this.particles.setTimeMultiplierX(timeX);
    this.particles.setTimeMultiplierY(timeY);
    this.particles.setTimeMultiplierZ(timeZ);
    this.particles.setInterpolation(interpolation);
  }
}
