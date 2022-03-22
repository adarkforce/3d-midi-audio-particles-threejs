import { BaseController } from "./controller.js";
const FADERS_RANGE = {
  BEGIN: 41,
  END: 48,
};
const KNOBS_RANGE = {
  BEGIN: 22,
  END: 28,
};
const NOTES_RANGE = {
  BEGIN: 0,
  END: 120,
};
const DRUMPAD_RANGE = {
  BEGIN: 40,
  END: 47,
};
export class LanuchkeyController extends BaseController {
  constructor(midiManager) {
    super(midiManager);
    this.onFadersChangeCallbacks = [];
    this.onKnobsChangeCallbacks = [];
    this.onPianoChangeCallbacks = [];
    this.onDrumpadChangeCallbacks = [];
    this.state = {
      notesPressed: {},
      drumpadNotesPressed: {},
      faderValues: {},
      knobValues: {},
    };
    this._initState();
  }
  _initState() {
    for (let i = FADERS_RANGE.BEGIN; i <= FADERS_RANGE.END; i++) {
      this.state.faderValues[i] = 0;
    }
    for (let i = KNOBS_RANGE.BEGIN; i <= KNOBS_RANGE.END; i++) {
      this.state.knobValues[i] = 0;
    }
  }
  handleControllerChange(event) {
    if (
      event.controlId >= FADERS_RANGE.BEGIN &&
      event.controlId <= FADERS_RANGE.END
    ) {
      const id = event.controlId - FADERS_RANGE.BEGIN;
      const value = event.value;
      this.state.faderValues[id] = value;
      this.onFadersChangeCallbacks.forEach((c) =>
        c({
          id,
          value,
          state: this.state,
        })
      );
    } else if (
      event.controlId >= KNOBS_RANGE.BEGIN &&
      event.controlId <= KNOBS_RANGE.END
    ) {
      const id = event.controlId - KNOBS_RANGE.BEGIN;
      const value = event.value;
      this.state.knobValues[id] = value;
      this.onKnobsChangeCallbacks.forEach((c) =>
        c({
          id,
          value,
          state: this.state,
        })
      );
    }
  }

  handleNoteOn(event) {
    if (
      event.controlId >= NOTES_RANGE.BEGIN &&
      event.controlId <= NOTES_RANGE.END
    ) {
      const id = event.controlId - NOTES_RANGE.BEGIN;
      const value = event.value;
      this.state.notesPressed[id] = value;
      this.onPianoChangeCallbacks.forEach((c) => {
        c({
          id,
          value,
          state: this.state,
        });
      });
    } else if (
      event.controlId >= DRUMPAD_RANGE.BEGIN &&
      event.controlId <= DRUMPAD_RANGE.END
    ) {
      const id = event.controlId - DRUMPAD_RANGE.BEGIN;
      const value = event.value;
      this.state.drumpadNotesPressed[id] = value;
      this.onDrumpadChangeCallbacks.forEach((c) => {
        c({
          id,
          value,
          state: this.state,
        });
      });
    }
  }

  handleNoteOff(event) {
    if (
      event.controlId >= NOTES_RANGE.BEGIN &&
      event.controlId <= NOTES_RANGE.END
    ) {
      const id = event.controlId - NOTES_RANGE.BEGIN;
      const value = event.value;
      this.state.notesPressed[id] = value;
      this.onPianoChangeCallbacks.forEach((c) => {
        c({
          id,
          value,
          state: this.state,
        });
      });
    } else if (
      event.controlId >= DRUMPAD_RANGE.BEGIN &&
      event.controlId <= DRUMPAD_RANGE.END
    ) {
      const id = event.controlId - DRUMPAD_RANGE.BEGIN;
      const value = event.value;
      this.state.drumpadNotesPressed[id] = value;
      this.onDrumpadChangeCallbacks.forEach((c) => {
        c({
          id,
          value,
          state: this.state,
        });
      });
    }
  }

  onPianoKeyChange(callback) {
    this.onPianoChangeCallbacks.push(callback);
  }

  onDrumpadChangeEvent(callback) {
    this.onDrumpadChangeCallbacks.push(callback);
  }

  onFaderChange(callback) {
    this.onFadersChangeCallbacks.push(callback);
  }
  onKnobChange(callback) {
    this.onKnobsChangeCallbacks.push(callback);
  }
}
