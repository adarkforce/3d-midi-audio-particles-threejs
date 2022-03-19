
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d);

varying vec2 vUv;

uniform float time;
uniform float amplitude;
uniform float frequency;
uniform float maxDistance;


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

void main()	{
	
	vec3 newpos = position;
 
	vec3 target = position + curl(frequency * newpos) * amplitude;

	float d = length( newpos - target ) / maxDistance;

	newpos = mix( position, target, pow( d, 5. ) );

	vec4 mvPosition = modelViewMatrix * vec4(target, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = 2. * (1. / - mvPosition.z);
	
}