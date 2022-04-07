uniform float time;
uniform vec3 diffuse;
uniform float opacity;

 

void main()	{

	float d = length(2.0 * gl_PointCoord - 1.0);
	if (d > 1.0) {
		discard;
	}
 
	gl_FragColor = vec4( vec3(1.0), opacity);
 
}