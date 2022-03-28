import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

export class Particles extends THREE.Object3D {
  constructor(geometry) {
    super();
    this.geometry = geometry;

    this.textureLoader = new THREE.TextureLoader();

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extensons GL_OES_standard_derivatives : enable",
      },
      transparent: true,
      uniforms: {
        time: { value: 0 },
        frequency: { value: 1.0 },
        amplitude: { value: 0.5 },
        maxDistance: { value: 1.0 },
        timeX: { value: 0.05 },
        timeY: { value: 0.05 },
        timeZ: { value: 0.05 },
        uNoiseTexture: { value: null },
        diffuse: { value: new THREE.Color(0xffffff) },
        opacity: { value: 0.8 },
        interpolation: { value: 0.1 },
      },
      blending: THREE.AdditiveBlending,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.add(this.points);

    this.updateMatrixWorld();

    this.#loadTextures();
  }

  #loadTextures() {
    this.textureLoader.load("perlin.jpeg", (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      this.material.uniforms.uNoiseTexture.value = texture;
      texture.needsUpdate = true;
    });
  }

  setInterpolation(interpolation) {
    this.material.uniforms.interpolation.value = interpolation;
  }

  setTimeElapsed(time) {
    this.material.uniforms.time.value = time;
  }

  setFrequency(freq) {
    this.material.uniforms.frequency.value = freq;
  }

  setAmplitude(amp) {
    this.material.uniforms.amplitude.value = amp;
  }

  setTimeMultiplierX(timeX) {
    this.material.uniforms.timeX.value = timeX;
  }

  setTimeMultiplierY(timeY) {
    this.material.uniforms.timeY.value = timeY;
  }

  setTimeMultiplierZ(timeZ) {
    this.material.uniforms.timeZ.value = timeZ;
  }

  setMaxDistance(maxDist) {
    this.material.uniforms.maxDistance.value = maxDist;
  }
}
