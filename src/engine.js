import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Particles } from "./particles.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as dat from "dat.gui";
import { AudioMidiParticlesController } from "./audio-midi-particle-controller.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GUIAudio, GUIControls, GUIMidi } from "./gui.js";

export class Engine {
  constructor() {
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

    AudioMidiParticlesController.create(this.particles).then(
      (audioMidiParticlesController) => {
        this.audioMidiParticlesController = audioMidiParticlesController;
        this.#setupGUI();
      }
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
  }

  #createParticles() {
    const tetraGeom = new THREE.TetrahedronBufferGeometry(15, 128);
    this.particles = new Particles(tetraGeom);
    this.scene.add(this.particles);
    this.particles.geometry.computeBoundingSphere();
    const boundingSphere = this.particles.geometry.boundingSphere;
    this.camera.position.copy(boundingSphere.center);
    this.camera.lookAt(boundingSphere.center);
    this.camera.translateZ(30);
  }

  async #setupGUI() {
    this.gui = new dat.GUI();
    this.gui.open();
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
    this.composer.setSize(this.sizes.width, this.sizes.height);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new ShaderPass(FXAAShader));
    this.composer.addPass(new ShaderPass(GammaCorrectionShader));
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
      this.composer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  tick() {
    //update midi audio and particles
    if (this.audioMidiParticlesController)
      this.audioMidiParticlesController.update();

    //this.camera.rotation.x += 0.001;
    this.particles.rotateY(0.001);

    // Update Orbital Controls
    this.controls.update();

    // Render
    this.composer.render();
  }

  run() {
    const _tick = () => {
      this.tick();
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
