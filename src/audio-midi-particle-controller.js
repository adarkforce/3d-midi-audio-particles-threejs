import { MidiControllerFactory, MidiMapper } from "./midi.js";
import { AudioManager as AudioInterfaceController } from "./audio.js";
import * as THREE from "three";

export class AudioMidiParticlesController {
  constructor(particles) {
    this.particles = particles;

    this.clock = new THREE.Clock();

    this.params = {
      amplitude: 3,
      frequency: 0.01,
      maxDistance: 3,
      freq1: 60,
      freq2: 500,
      freq3: 6000,
      timeX: 2,
      timeY: 20,
      timeZ: 10,
      interpolation: 0.06,
    };
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
    try {
      this.audioInterfaceController = new AudioInterfaceController();
      this.audioDevices = await this.audioInterfaceController.getInputDevices();
      this.audioInterfaceController.listenTo(this.audioDevices[0].deviceId);
    } catch (err) {
      console.log(err);
    }
  }

  async #setupMidiControls() {
    try {
      this.midiController = await MidiControllerFactory.createController();
      const inputs = [];
      for (const [id, midiInput] of this.midiController.getInputs()) {
        inputs.push(midiInput);
      }
      const midiInterface = inputs[0];
      if (!midiInterface) return;
      this.midiController.setActiveMidiInterface(midiInterface);
      this.midiMapper = new MidiMapper(this.midiController, this.params);
      this.midiAvailable = true;
    } catch (err) {
      console.log(err);
      this.midiAvailable = false;
    }
  }

  #hertzToIndex(hz) {
    return Math.floor(
      (hz * this.audioInterfaceController.analyser.frequencyBinCount) /
        (this.audioInterfaceController.context.sampleRate / 2)
    );
  }

  #processAudio() {
    this.audioInterfaceController.updateAudioInfo();

    const freq1Index = this.#hertzToIndex(this.params.freq1);
    const freq2Index = this.#hertzToIndex(this.params.freq2);
    const freq3Index = this.#hertzToIndex(this.params.freq3);

    const freqValue1 = this.audioInterfaceController.freqData[freq1Index];
    this.frequencyValue1 = freqValue1 / 255;

    const freqValue2 =
      this.audioInterfaceController.freqData[Math.floor(freq2Index)];
    this.frequencyValue2 = freqValue2 / 255;

    const freqValue3 =
      this.audioInterfaceController.freqData[Math.floor(freq3Index)];
    this.frequencyValue3 = freqValue3 / 255;

    this.timeDomainValue =
      (128 -
        this.audioInterfaceController.timeDomainData[
          Math.floor(this.audioInterfaceController.analyser.fftSize / 2)
        ]) /
      127;
  }

  #updateParams() {
    let amplitude = this.params.amplitude;

    let frequency = this.params.frequency;

    let maxDistance = this.params.maxDistance - this.timeDomainValue;

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
