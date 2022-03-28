export class GUIControls {
  constructor(gui, audioMidiParticlesController) {
    this.gui = gui;
    this.audioMidiParticlesController = audioMidiParticlesController;
  }
  init() {
    this.controllerFolder = this.gui.addFolder("Controls");
    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "amplitude")
      .min(0.01)
      .max(5)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "frequency")
      .min(0.01)
      .max(2)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "maxDistance")
      .min(0.1)
      .max(20)
      .step(0.1)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "interpolation")
      .min(0.001)
      .max(1)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "timeX")
      .min(0.01)
      .max(5)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "timeY")
      .min(0.01)
      .max(5)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "timeZ")
      .min(0.01)
      .max(5)
      .step(0.001)
      .listen()
      .updateDisplay();
  }
}

export class GUIMidi {
  constructor(gui, audioMidiParticlesController) {
    this.gui = gui;
    this.audioMidiParticlesController = audioMidiParticlesController;
    this.midiManager = this.audioMidiParticlesController.midiController;
    this.midiMapper = this.audioMidiParticlesController.midiMapper;
  }
  init() {
    if (!this.midiManager || !this.midiMapper) return;
    const midiInputs = this.midiManager.getInputs();
    const midiOptions = [];
    for (let input of midiInputs) {
      midiOptions.push(input[1].name);
    }
    this.midiFolder = this.gui.addFolder("Midi");
    this.midiFolder
      .add(this.midiManager.midiInterface, "name")
      .options(midiOptions)
      .onFinishChange((val) => {
        for (const [id, midiInput] of this.midiController.getInputs()) {
          if (midiInput.name === val) {
            this.midiManager.setActiveMidiInterface(midiInput);
          }
        }
      });
    const paramsKeys = Object.keys(this.audioMidiParticlesController.params);
    this.mappingState = {
      property: paramsKeys[0],
      maxValue: 1,
      minValue: 0,
      started: false,
      currentControl: "",
      mappingName: "",
    };
    this.mappingFolder = this.midiFolder.addFolder("Mapping");
    this.mappingFolder.open();

    this.mappingFolder
      .add(this.mappingState, "mappingName")
      .name("Mapping Name")
      .listen();
    this.mappingFolder
      .add(
        {
          load: () => {
            this.midiMapper.load(this.mappingState.mappingName);
          },
        },
        "load"
      )
      .name("Load Mapping")
      .onFinishChange(() => {
        updateCurrentMidiMappings();
      });
    this.mappingFolder
      .add(
        {
          save: () => {
            this.midiMapper.save(this.mappingState.mappingName);
          },
        },
        "save"
      )
      .name("Save Mapping");

    this.newMappingFolder = this.mappingFolder.addFolder("New Mapping");
    this.newMappingFolder.open();
    this.newMappingFolder.add(this.mappingState, "property", paramsKeys);
    this.newMappingFolder.add(this.mappingState, "maxValue").step(0.01);
    this.newMappingFolder.add(this.mappingState, "minValue").step(0.01);

    this.newMappingFolder.add(this.mappingState, "currentControl").listen();

    this.audioMidiParticlesController.midiMapper.onCurrentMidiMessageChange(
      (midiMessage) => {
        this.mappingState.currentControl = midiMessage.controlId;
      }
    );
    const _this = this;

    const updateCurrentMidiMappings = () => {
      if (!!this.currentMappingFolder) {
        this.mappingFolder.removeFolder(this.currentMappingFolder);
      }
      this.currentMappingFolder =
        this.mappingFolder.addFolder("Current Mapping");
      this.currentMappingFolder.open();
      const midiMappings =
        this.audioMidiParticlesController.midiMapper.midiMappings;
      for (const mapping of midiMappings) {
        const name = `${mapping.midiMessage.controlId} -> ${mapping.property}`;
        this.currentMappingFolder
          .add(
            {
              [name]: () => {
                this.audioMidiParticlesController.midiMapper.removeMapping(
                  mapping
                );
              },
            },
            name
          )
          .onFinishChange(function () {
            updateCurrentMidiMappings();
          });
      }
    };

    this.newMappingFolder
      .add({ startMapping: () => {} }, "startMapping")
      .onFinishChange(function () {
        if (!_this.mappingState.started) {
          const maxValue = _this.mappingState.maxValue;
          const minValue = _this.mappingState.minValue;
          _this.audioMidiParticlesController.midiMapper.startMapping({
            property: _this.mappingState.property,
            maxValue: maxValue,
            minValue: minValue,
          });
          this.name("End Mapping");
          this.updateDisplay();
        } else {
          _this.audioMidiParticlesController.midiMapper.endMapping();
          this.name("Start Mapping");
          this.updateDisplay();
        }
        _this.mappingState.started = !_this.mappingState.started;
        updateCurrentMidiMappings();
      });

    updateCurrentMidiMappings();
  }
}

export class GUIAudio {
  constructor(gui, audioInterfaceController) {
    this.gui = gui;
    this.audioInterfaceController = audioInterfaceController;
    this.state = {
      audioSelected: "",
    };
  }
  async init() {
    const audioDevices = await this.audioInterfaceController.getInputDevices();
    this.state.audioSelected = audioDevices[0].label;
    this.audioFolder = this.gui.addFolder("Audio");
    this.audioFolder
      .add(this.state, "audioSelected")
      .options(audioDevices.map((d) => d.label))
      .onFinishChange(async (val) => {
        const selectedDevice = audioDevices.filter((d) => d.label === val)[0];
        this.audioInterfaceController.listenTo(selectedDevice.deviceId);
      });
  }
}
