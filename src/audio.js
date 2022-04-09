export class AudioManager {
  constructor() {
    navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new window.AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 1024;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    document.addEventListener("click", async () => await this.resume());
    document.addEventListener("scroll", async () => await this.resume());
  }

  async resume() {
    if (this.context.state === "closed" || this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async #registerStream(stream) {
    if (this.input) {
      this.input.disconnect(this.analyser);
    }
    this.input = this.context.createMediaStreamSource(stream);
    this.input.connect(this.analyser);
    await this.resume();
  }
  async getInputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audioinput"
    );
  }
  updateAudioInfo() {
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);
  }

  async getOutputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audiooutput"
    );
  }

  async listenTo(deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    await this.#registerStream(stream);
  }
}
