export class BaseController {
  constructor(midiManager) {
    this.midiManager = midiManager;
    midiManager.onControllerChange(this.handleControllerChange.bind(this));
    midiManager.onNoteOn(this.handleNoteOn.bind(this));
    midiManager.onNoteOff(this.handleNoteOff.bind(this));
  }
  handleControllerChange(event) {
    throw new Error("Method not implemented!");
  }
  handleNoteOn(event) {
    throw new Error("Method not implemented!");
  }
  handleNoteOff(event) {
    throw new Error("Method not implemented!");
  }
}
