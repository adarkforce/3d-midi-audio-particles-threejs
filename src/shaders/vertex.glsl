
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d);

uniform float time;
uniform float amplitude;
uniform float frequency;
uniform float maxDistance;
uniform float interpolation;

uniform float timeX;
uniform float timeY;
uniform float timeZ;
uniform sampler2D uNoiseTexture; 

vec3 curl(vec3 pos) {
	float x = pos.x;
	float y = pos.y;
	float z = pos.z;

    float	eps	= 1., eps2 = 2. * eps;
    float	n1,	n2,	a,	b;

    x += time * .05;
    y += time * .05;
    z += time * .05;

    vec3	curl = vec3(0.);

    n1	=	snoise2(vec2( x,	y	+	eps ));
    n2	=	snoise2(vec2( x,	y	-	eps ));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise2(vec2( x,	z	+	eps));
    n2	=	snoise2(vec2( x,	z	-	eps));
    b	=	(n1	-	n2)/eps2;

    curl.x	=	a	-	b;

    n1	=	snoise2(vec2( y,	z	+	eps));
    n2	=	snoise2(vec2( y,	z	-	eps));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise2(vec2( x	+	eps,	z));
    n2	=	snoise2(vec2( x	+	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.y	=	a	-	b;

    n1	=	snoise2(vec2( x	+	eps,	y));
    n2	=	snoise2(vec2( x	-	eps,	y));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise2(vec2(  y	+	eps,	z));
    n2	=	snoise2(vec2(  y	-	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.z	=	a	-	b;

    return	curl;
} 

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main()	{

    #include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
 
	vec3 newpos = position;

    vec4 noiseTextel = texture2D( uNoiseTexture, vec2(mod(uv.x + time * 0.05, 1.), mod(uv.y + time * 0.05, 1.)) - 0.5);
    vec4 noiseTextel2 = texture2D( uNoiseTexture, uv);

    float amp = amplitude + noiseTextel.r * .3;
    amp = mix(amp, amp + timeX * .001, .75);

    float freq = frequency + noiseTextel2.r * .1;

    float freqPosX = freq * newpos.x;
    freqPosX = mix(freqPosX, freqPosX + timeX, interpolation);

    float freqPosY = freq * newpos.y;
    freqPosY = mix(freqPosY, freqPosY + timeY, interpolation);

    float freqPosZ = freq * newpos.z;
    freqPosZ = mix(freqPosZ, freqPosZ + timeZ, interpolation);
 
	vec3 target = newpos + curl(vec3(freqPosX, freqPosY, freqPosZ )) * amp;

	float d = length( position - target ) / maxDistance;

    target = mod(target, 2. * noiseTextel.r);
    
	newpos = mix( position, target, pow(d, 3.) );

	mvPosition = modelViewMatrix * vec4(newpos, 1.0);
	
    gl_Position = projectionMatrix * mvPosition;
	
    gl_PointSize = 30. * (1. / - mvPosition.z);

    #include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

	
}