import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

export class Particles extends THREE.Object3D {
  constructor(geometry) {
    super();
    this.geometry = geometry;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extensons GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        frequency: { value: 1.0 },
        amplitude: { value: 1.0 },
        maxDistance: { value: 1.0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.add(this.points);
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

  setMaxDistance(maxDist) {
    this.material.uniforms.maxDistance.value = maxDist;
  }
}
