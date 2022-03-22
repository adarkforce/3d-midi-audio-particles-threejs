import { LanuchkeyController } from "./controllers/launchkey.js";
import { MidiManager } from "./midi.js";
import { AudioManager } from "./audio.js";
import * as THREE from "three";

export class AudioLaunchKeyParticlesController {
  constructor(particles) {
    this.particles = particles;

    this.clock = new THREE.Clock();

    this.maxAmplitudeValue = 3;
    this.maxFrequencyValue = 0.6;
    this.maxMaxDistanceValue = 1;

    this.amplitude = 0;
    this.frequency = 0;
    this.maxDistance = 0;

    this.maxSpeedX = 0.4;
    this.maxSpeedY = 0.4;
    this.maxSpeedZ = 0.8;

    this.timeX = 1;
    this.timeY = 1;
    this.timeZ = 1;
  }

  static async create(particles) {
    const audioMidiParticlesBinder = new AudioLaunchKeyParticlesController(
      particles
    );
    await audioMidiParticlesBinder.#setupAudioControls();
    await audioMidiParticlesBinder.#setupMidiControls();
    return audioMidiParticlesBinder;
  }

  #handleFadersChange(event) {
    const state = event.state;

    let totalAmplitude = 0;
    const faderValues = Object.values(state.faderValues);
    faderValues.forEach((val) => {
      totalAmplitude += val;
    });
    this.amplitude = totalAmplitude / (126 * faderValues.length);
  }

  #_handleKnobChange(event) {
    const state = event.state;

    let totalFrequency = 0;
    let totalMaxDistance = 0;
    const knobValues = Object.entries(state.knobValues);
    knobValues.forEach(([id, val]) => {
      if (id <= knobValues.length / 2 - 1) {
        totalFrequency += val;
      } else {
        totalMaxDistance += val;
      }
    });
    this.frequency = totalFrequency / (126 * (knobValues.length / 2));
    this.maxDistance = totalMaxDistance / (126 * (knobValues.length / 2));
  }

  async #setupAudioControls() {
    this.audioManager = new AudioManager();
    this.audioDevices = await this.audioManager.getInputDevices();
    this.audioManager.listenTo(this.audioDevices[0].deviceId);
  }

  async #setupMidiControls() {
    this.midiManager = await MidiManager.ready();
    this.launchKeyController = new LanuchkeyController(this.midiManager);
    this.launchKeyController.onFaderChange((event) =>
      this.#handleFadersChange(event)
    );
    this.launchKeyController.onKnobChange((event) =>
      this.#_handleKnobChange(event)
    );
  }

  #processAudio() {
    const audioInfo = this.audioManager.getAudioInfo();
    const freqLen = audioInfo.frequencyData.length;

    const freqValue1 = audioInfo.frequencyData[4];
    this.timeY = freqValue1 / 128;

    const freqValue2 = audioInfo.frequencyData[10];
    this.timeX = freqValue2 / 128;

    const freqValue3 = audioInfo.frequencyData[20];
    this.timeZ = (freqValue3 / 128) * this.maxSpeedZ;
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime();
    this.#processAudio();
    this.particles.setTimeElapsed(elapsedTime);
    this.particles.setAmplitude(this.amplitude * this.maxAmplitudeValue);
    this.particles.setFrequency(this.frequency * this.maxFrequencyValue);
    this.particles.setMaxDistance(this.maxDistance * this.maxMaxDistanceValue);
    this.particles.setTimeMultiplierX(this.timeX * this.maxSpeedX);
    this.particles.setTimeMultiplierY(this.timeY * this.maxSpeedY);
    this.particles.setTimeMultiplierZ(this.timeZ * this.maxSpeedZ);
  }
}
