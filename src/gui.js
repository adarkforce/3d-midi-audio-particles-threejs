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
      .max(20)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "timeY")
      .min(0.01)
      .max(20)
      .step(0.001)
      .listen()
      .updateDisplay();

    this.controllerFolder
      .add(this.audioMidiParticlesController.params, "timeZ")
      .min(0.01)
      .max(20)
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

    this.currentMappingsGUIControllers = [];
    this.savedMappingsGUIControllers = [];

    this.mappingState = {
      property: "",
      maxValue: 1,
      minValue: 0,
      mappingStarted: false,
      currentControl: "",
      mappingName: "",
    };
    if (this.midiMapper)
      this.midiMapper.onCurrentMidiMessageChange((midiMessage) => {
        this.mappingState.currentControl = midiMessage.controlId;
      });
  }
  #updateCurrentMidiMappings = () => {
    this.currentMappingsGUIControllers.forEach((controller) =>
      controller.remove()
    );
    this.currentMappingsGUIControllers = [];
    const _this = this;
    for (const mapping of this.midiMapper.midiMappings) {
      const name = `${mapping.midiMessage.controlId} -> ${mapping.property}`;
      const guiController = this.currentMappingFolder.add(
        {
          [name]: () => this.midiMapper.removeMapping(mapping),
        },
        name
      );
      guiController.onFinishChange(function () {
        _this.#updateCurrentMidiMappings();
      });
      this.currentMappingsGUIControllers.push(guiController);
    }
  };

  #updateSavedMappings() {
    this.savedMappingsGUIControllers.forEach((controller) =>
      controller.remove()
    );
    this.savedMappingsGUIControllers = [];
    const savedMappings = this.midiMapper.getSavedMappingsList();
    for (const savedMapping of savedMappings) {
      const guiController = this.savedMappingFolder
        .add(
          {
            [savedMapping.key]: () => {
              this.mappingState.mappingName = savedMapping.key;
              this.midiMapper.loadFromStorage(savedMapping.key);
            },
          },
          savedMapping.key
        )
        .onFinishChange(() => {
          this.#updateCurrentMidiMappings();
          this.currentMappingFolder.open();
        });
      this.savedMappingsGUIControllers.push(guiController);
    }
    if (savedMappings.length > 0) this.savedMappingFolder.open();
  }

  #createNewMappingFolder(parent) {
    this.newMappingFolder = parent.addFolder("New Mapping");
    this.newMappingFolder.add(
      this.mappingState,
      "property",
      Object.keys(this.audioMidiParticlesController.params)
    );
    this.newMappingFolder
      .add(this.mappingState, "maxValue")
      .name("Max Value")
      .step(0.01);
    this.newMappingFolder
      .add(this.mappingState, "minValue")
      .name("Min Value")
      .step(0.01);
    this.newMappingFolder
      .add(this.mappingState, "currentControl")
      .name("Current Control")
      .listen();

    const _this = this;

    this.newMappingFolder
      .add({ startMapping: () => {} }, "startMapping")
      .name("Start Mapping")
      .onFinishChange(function () {
        const startEndMappingButton = this;
        if (!_this.mappingState.mappingStarted) {
          const maxValue = _this.mappingState.maxValue;
          const minValue = _this.mappingState.minValue;
          _this.midiMapper.startMapping({
            property: _this.mappingState.property,
            maxValue: maxValue,
            minValue: minValue,
          });
          startEndMappingButton.name("End Mapping");
          startEndMappingButton.updateDisplay();
        } else {
          _this.midiMapper.endMapping();
          startEndMappingButton.name("Start Mapping");
          startEndMappingButton.updateDisplay();
        }
        _this.mappingState.mappingStarted = !_this.mappingState.mappingStarted;
        _this.#updateCurrentMidiMappings();
      });
  }

  #createStorageFolder(parent) {
    this.storageFolder = parent.addFolder("Storage");

    this.storageFolder
      .add(this.mappingState, "mappingName")
      .name("Mapping Name")
      .listen();

    this.storageFolder
      .add(
        {
          load: () =>
            this.midiMapper.loadFromStorage(this.mappingState.mappingName),
        },
        "load"
      )
      .name("Load Mapping")
      .onFinishChange(() => {
        this.#updateCurrentMidiMappings();
        this.currentMappingFolder.open();
      });

    this.storageFolder
      .add(
        {
          save: () =>
            this.midiMapper.saveToStorage(this.mappingState.mappingName),
        },
        "save"
      )
      .name("Save Mapping")
      .onFinishChange(() => this.#updateSavedMappings());

    this.storageFolder
      .add(
        {
          erase: () =>
            this.midiMapper.eraseFromStorage(this.mappingState.mappingName),
        },
        "erase"
      )
      .name("Erase Mapping")
      .onFinishChange(() => this.#updateSavedMappings());
  }

  #createMidiFolder(parent) {
    const midiInputs = this.midiManager.getInputs();
    const midiOptions = [];
    for (let input of midiInputs) {
      midiOptions.push(input[1].name);
    }
    this.midiFolder = parent.addFolder("MIDI");
    this.midiFolder
      .add(this.midiManager.midiInterface, "name")
      .options(midiOptions)
      .name("MIDI Input")
      .onFinishChange((val) => {
        for (const [id, midiInput] of this.midiController.getInputs()) {
          if (midiInput.name === val) {
            this.midiManager.setActiveMidiInterface(midiInput);
          }
        }
      });
  }

  #createMappingFolder(parent) {
    this.mappingFolder = parent.addFolder("MIDI Mapping");
    this.mappingFolder.open();
  }

  #createSavedMappingsFolder(parent) {
    this.savedMappingFolder = parent.addFolder("Saved Mappings");
    this.#updateSavedMappings();
  }

  #createCurrentMappingsFolder(parent) {
    this.currentMappingFolder = parent.addFolder("Loaded Mappings");
    this.#updateCurrentMidiMappings();
  }

  init() {
    if (
      !this.midiManager ||
      !this.midiMapper ||
      this.audioMidiParticlesController.midiAvailable !== true
    )
      return;

    const firstPropertyKey = Object.keys(
      this.audioMidiParticlesController.params
    )[0];

    this.mappingState.property = firstPropertyKey;

    this.#createMidiFolder(this.gui);

    this.#createMappingFolder(this.midiFolder);

    this.#createStorageFolder(this.mappingFolder);

    this.#createSavedMappingsFolder(this.mappingFolder);

    this.#createNewMappingFolder(this.mappingFolder);

    this.#createCurrentMappingsFolder(this.mappingFolder);
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
    if (audioDevices.length === 0) return;
    this.state.audioSelected = audioDevices[0].label;
    this.audioFolder = this.gui.addFolder("Audio");
    this.audioFolder
      .add(this.state, "audioSelected")
      .options(audioDevices.map((d) => d.label))
      .name("Audio Input")
      .onFinishChange(async (val) => {
        const selectedDevice = audioDevices.filter((d) => d.label === val)[0];
        this.audioInterfaceController.listenTo(selectedDevice.deviceId);
      });
  }
}
