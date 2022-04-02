import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Particles } from "./particles.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as dat from "dat.gui";
import { AudioMidiParticlesController } from "./audio-midi-particle-controller.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { GUIAudio, GUIControls, GUIMidi } from "./gui.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

export class Engine {
  constructor() {
    this._debug = false;
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.canvas = document.querySelector("canvas.webgl");

    this.clock = new THREE.Clock();

    this.#createCamera();
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    this.#createLights();
    this.#createRenderer();
    this.#setupComposer();
    this.#createParticles();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    this.stats = new Stats();
    AudioMidiParticlesController.create(this.particles).then(
      (audioMidiParticlesController) => {
        this.audioMidiParticlesController = audioMidiParticlesController;
        this.#setupGUI();
      }
    );
  }

  #createParticles() {
    const tetraGeom = new THREE.TetrahedronBufferGeometry(15, 256);
    this.particles = new Particles(tetraGeom);
    this.scene.add(this.particles);
    this.particles.geometry.computeBoundingSphere();
    const boundingSphere = this.particles.geometry.boundingSphere;
    this.camera.position.copy(boundingSphere.center.clone());
  }

  async #setupGUI() {
    this.gui = new dat.GUI();
    this.guiAudio = new GUIAudio(
      this.gui,
      this.audioMidiParticlesController.audioInterfaceController
    );
    this.guiMidi = new GUIMidi(this.gui, this.audioMidiParticlesController);
    this.guiControls = new GUIControls(
      this.gui,
      this.audioMidiParticlesController
    );

    await this.guiAudio.init();
    this.guiMidi.init();
    this.guiControls.init();

    if (this._debug) document.body.appendChild(this.stats.dom);
    this.gui.close();
  }

  set debug(val) {
    this._debug = val;
    try {
      if (!this._debug) document.body.removeChild(this.stats.dom);
    } catch (err) {}
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

    const smaaPass = new SMAAPass(
      this.sizes.width * this.renderer.getPixelRatio(),
      this.sizes.height * this.renderer.getPixelRatio()
    );
    this.composer.addPass(smaaPass);

    this.composer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  #createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
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
      this.composer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  tick(elapsedTime) {
    //update midi audio and particles
    if (this.audioMidiParticlesController) {
      this.audioMidiParticlesController.update();
      const center = this.particles.geometry.boundingSphere.center;
      this.camera.lookAt(center);
      this.camera.position.x +=
        0.5 *
        Math.cos(
          elapsedTime *
            Math.log(this.audioMidiParticlesController.params.frequency)
        );
      this.camera.position.z +=
        0.5 *
        Math.sin(
          elapsedTime * this.audioMidiParticlesController.params.amplitude
        );
    }

    this.controls.update();

    if (this.stats && !this._debug) this.stats.update();

    this.composer.render();
  }

  run() {
    const _tick = () => {
      const elapsedTime = this.clock.getElapsedTime();
      this.tick(elapsedTime);
      this.loopHandler = requestAnimationFrame(() => _tick());
    };

    _tick();
  }

  stop() {
    if (this.loopHandler) {
      cancelAnimationFrame(this.loopHandler);
    }
  }
}
