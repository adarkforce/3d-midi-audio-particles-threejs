import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { Particles } from "./particles.js";
import { EffectComposer, RenderPass } from "postprocessing";
import * as dat from "dat.gui";
import { AudioLaunchKeyParticlesController } from "./audio-midi-particle-controller.js";

export class Engine {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.loadingManager = new THREE.LoadingManager(
      () => {},
      () => {},
      (err) => {
        console.error(err);
      }
    );

    this.canvas = document.querySelector("canvas.webgl");

    this.clock = new THREE.Clock();

    this.#createCamera();
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    this.#createLights();
    this.#createRenderer();
    this.#setupComposer();
    this.#createParticles();

    AudioLaunchKeyParticlesController.create(this.particles).then(
      (audioMidiParticlesBinder) => {
        this.audioMidiParticlesBinder = audioMidiParticlesBinder;
        this.#setupGUI();
      }
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
  }

  #createParticles() {
    //const objLoader = new PLYLoader(this.loadingManager);

    //objLoader.load("cesar.ply", (object) => {
    //  this.particles = new Particles(object);
    //  this.scene.add(this.particles);
    //  this.particles.geometry.computeBoundingSphere();
    //  const boundingSphere = this.particles.geometry.boundingSphere;
    //  this.camera.position.copy(boundingSphere.center);
    //  this.camera.lookAt(boundingSphere.center);
    //  this.camera.position.z += 10;
    //  this.camera.position.x += 20;
    //  this.camera.position.y += 10;
    //});
    const tetraGeom = new THREE.TetrahedronBufferGeometry(15, 64);
    this.particles = new Particles(tetraGeom);
    this.scene.add(this.particles);
    this.particles.geometry.computeBoundingSphere();
    const boundingSphere = this.particles.geometry.boundingSphere;
    this.camera.position.copy(boundingSphere.center);
    this.camera.lookAt(boundingSphere.center);
    this.camera.position.z += 10;
    this.camera.position.x += 20;
    this.camera.position.y += 10;
  }

  async #setupGUI() {
    this.gui = new dat.GUI();
    this.gui.open();
    this.guiState = {
      midiSelected: "",
      audioSelected: "",
    };
    const midiInputs = this.audioMidiParticlesBinder.midiManager.getInputs();
    const audioDevices =
      await this.audioMidiParticlesBinder.audioManager.getInputDevices();

    const midiOptions = [];
    for (let input of midiInputs) {
      midiOptions.push(input[1].name);
    }
    this.guiState.midiSelected = midiOptions[0];
    this.audioMidiParticlesBinder.midiManager.setMidiInterface(midiOptions[0]);

    const midiFolder = this.gui.addFolder("Midi");
    midiFolder
      .add(this.guiState, "midiSelected")
      .options(midiOptions)
      .onFinishChange((val) => {
        this.audioMidiParticlesBinder.midiManager.setMidiInterface(val);
      });

    this.guiState.audioSelected = audioDevices[0].label;

    const audioFolder = this.gui.addFolder("Audio");
    audioFolder
      .add(this.guiState, "audioSelected")
      .options(audioDevices.map((d) => d.label))
      .onFinishChange(async (val) => {
        const selectedDevice = audioDevices.filter((d) => d.label === val)[0];
        this.audioMidiParticlesBinder.audioManager.listenTo(
          selectedDevice.deviceId
        );
      });

    const controllerFolder = this.gui.addFolder("Controls");
    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxAmplitudeValue")
      .min(0.01)
      .max(5)
      .step(0.001);

    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxFrequencyValue")
      .min(0.01)
      .max(5)
      .step(0.001);

    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxMaxDistanceValue")
      .min(0.01)
      .max(5)
      .step(0.001);

    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxSpeedX")
      .min(0.01)
      .max(5)
      .step(0.001);

    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxSpeedY")
      .min(0.01)
      .max(5)
      .step(0.001);

    controllerFolder
      .add(this.audioMidiParticlesBinder, "maxSpeedZ")
      .min(0.01)
      .max(5)
      .step(0.001);
  }

  #createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
  }

  #createLights() {
    const pointLight = new THREE.PointLight(0xffffff, 0.1);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    this.scene.add(pointLight);
  }

  #setupComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
  }

  #createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  run() {
    const tick = () => {
      //update midi audio and particles
      if (this.audioMidiParticlesBinder) this.audioMidiParticlesBinder.update();

      // Update Orbital Controls
      this.controls.update();

      // Render
      this.composer.render();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }
}
