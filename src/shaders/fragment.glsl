varying vec2 vUv;
uniform float time;
uniform float delta;
void main()	{

	gl_FragColor = vec4( vec3(vUv.y,1.-vUv.x,1.0 - vUv.x), 1.0 );
}