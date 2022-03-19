import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Particles } from "./particles.js";
const WIDTH = 32;
export class Engine {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.tetraGeom = new THREE.IcosahedronBufferGeometry(1, WIDTH);
    this.particles = new Particles(this.tetraGeom);
    this.particles.geometry.computeBoundingSphere();
    const boundingSphere = this.particles.geometry.boundingSphere;
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.camera.position.copy(boundingSphere.center);

    this.canvas = document.querySelector("canvas.webgl");

    this.scene = new THREE.Scene();
    this.scene.add(this.particles);
    this.scene.add(this.camera);

    this.clock = new THREE.Clock();

    this.createLights();
    this.createRenderer();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
  }

  createLights() {
    const pointLight = new THREE.PointLight(0xffffff, 0.1);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    this.scene.add(pointLight);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
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
      const elapsedTime = this.clock.getElapsedTime();

      this.particles.setTimeElapsed(elapsedTime);

      // Update objects

      // Update Orbital Controls
      // this.controls.update();

      // Render
      this.renderer.render(this.scene, this.camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }
}
