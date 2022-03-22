
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d);

varying vec2 vUv;
varying vec3 vColor;

uniform float time;
uniform float amplitude;
uniform float frequency;
uniform float maxDistance;

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

    x += time * .5 + timeX;
    y += time * .5 + timeY;
    z += time * .5 + timeZ;

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
  
    float amp = amplitude *  noiseTextel.r * 10.;
    float freq = frequency * noiseTextel.r * 5.;

   // vColor = vec3(noiseTextel.r - .5);
 
	vec3 target = newpos + curl(freq * newpos) * amp;

	float d = length( position - target ) / maxDistance;
    
	newpos = mix( position, target, d );

	mvPosition = modelViewMatrix * vec4(target, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = 20. * (1. / - mvPosition.z);

    #include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

	
}