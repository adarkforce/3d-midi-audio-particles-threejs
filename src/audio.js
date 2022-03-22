window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

export class AudioManager {
  constructor() {
    navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new window.AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 1024;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.fftSize);
  }
  #registerStream(stream) {
    this.input = this.context.createMediaStreamSource(stream);

    this.input.connect(this.analyser);
  }
  async getInputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audioinput"
    );
  }
  getAudioInfo() {
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);
    return {
      frequencyData: this.freqData,
      timeDomainData: this.timeDomainData,
    };
  }

  async getOutputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audiooutput"
    );
  }

  listenTo(deviceId) {
    if (!deviceId) {
      throw new Error("device id is required!");
    }
    navigator.getUserMedia(
      {
        audio: { deviceId: { exact: deviceId } },
      },
      this.#registerStream.bind(this),
      (err) => {
        throw new Error(err);
      }
    );
  }
}
