import{i as e,r as t,t as n}from"./index-CitdFmZn.js";var r=e(t(),1),i=n(),a=2400,o=5,s=2.6,c=7.5,l=.56,u=24,d={focus:0,part:1,none:2},f={dots:0,dashes:.45,lines:1},p={depth:0,along:1,across:2},m=[0,.75,.35],h=[[0,0,0,0],[1.9,-4.6,-.08,2.4],[-1.05,2,.12,4.1]],ee=[1,.5,.55],g=Math.PI/180,_=1/(2*Math.tan(l/2)),v=`#version 300 es
precision highp float;
`,te=`${v}
${`
uniform float uTime;
uniform float uTwist;
uniform float uRoll;
uniform float uWaves;
uniform float uWidth;
uniform float uRibbon;
uniform mat3 uOrient;
uniform float uScale;
uniform vec4 uPlace;
uniform float uVolume;

float hash11(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}

vec3 centerLocal(float s) {
  float t = uTime;
  float ph = uPlace.w;
  float x = s * ${u.toFixed(1)};
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;
  return vec3(x, y, z);
}

float twistAt(float s, float layer) {
  float x = s * ${u.toFixed(1)};
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);
}

vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {
  vec3 c0 = centerLocal(s);
  vec3 c1 = centerLocal(s + 0.004);
  vec3 tangent = normalize(c1 - c0);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 n0 = normalize(up - tangent * dot(up, tangent));
  vec3 b0 = cross(tangent, n0);
  float th = twistAt(s, layer);
  vec3 across = cos(th) * n0 + sin(th) * b0;
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;
  normal = uOrient * sheet;
  return uOrient * (local * uScale);
}
`}
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform vec2 uViewport;
uniform float uDpr;
uniform float uFibers;
uniform float uDots;
uniform float uFlow;
uniform float uSize;
uniform float uFocus;
uniform float uDof;
uniform float uMaxCoc;
uniform float uFocal;
uniform float uIntro;
uniform vec4 uPulse;
uniform vec4 uHover;
uniform float uPart;
uniform float uDotLength;
uniform float uSparkle;
uniform float uDepthSpread;
uniform float uGain;
uniform float uTips;
uniform float uTint;
uniform float uGradient;
uniform float uFold;

out vec2 vLocal;
out float vRadius;
out float vSegment;
out vec3 vLight;
out float vTint;

vec3 project(vec3 world, out float depth) {
  vec4 clip = uViewProj * vec4(world, 1.0);
  depth = clip.w;
  vec2 ndc = clip.xy / clip.w;
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);
}

vec2 part(vec2 px) {
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;
  vec2 away = px - uHover.xy;
  float dist = length(away);
  float radius = uHover.z;
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);
}

void main() {
  int perFiber = int(uDots);
  int fiber = gl_InstanceID / perFiber;
  int bead = gl_InstanceID - fiber * perFiber;
  float fi = float(fiber);
  float fk = float(bead);

  float seed = hash11(fi * 1.731 + uRibbon * 17.0);
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;
  float sNext = s + 1.0 / uDots;
  float layer = mod(fi, 3.0) - 1.0;
  float slot = floor(fi / 3.0);
  float perLayer = max(floor(uFibers / 3.0), 1.0);
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);

  vec3 normal;
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);
  vec3 nextNormal;
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);

  float depth;
  vec3 p0 = project(world, depth);
  float nextDepth;
  vec3 p1 = project(nextWorld, nextDepth);
  vec2 px = part(p0.xy);
  vec2 pxNext = part(p1.xy);

  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);
  float radius = baseRadius + coc;
  float spill = max(10.0 * uDpr, baseRadius);
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);

  vec3 toEye = normalize(uEye - world);
  float facing = abs(dot(normalize(normal), toEye));
  float focalPx = uViewport.y * ${_.toFixed(5)} / max(depth, 0.1);
  float widthPx = 2.0 * uWidth * uScale * focalPx;
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);
  float spacingFace = length(nextWorld - world) * focalPx;
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));
  float fold = pow(1.0 - facing, 6.0) * uFold;
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);

  vec2 segment = (pxNext - px) * uDotLength;
  float segmentLength = length(segment);
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);
  vec2 perp = vec2(-axis.y, axis.x);
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);
  float along = mix(-radius, segmentLength + radius, corner.x);
  float across = mix(-radius, radius, corner.y);
  vec2 position = px + axis * along + perp * across;

  vLocal = vec2(along, across);
  vRadius = radius;
  vSegment = segmentLength;
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);
  if (intensity < 0.0005) position = vec2(-1e4);
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);
}`,ne=`${v}
uniform mat4 uViewProj;
uniform vec2 uViewport;
uniform float uDpr;
uniform float uTime;
uniform float uSize;
uniform float uFocus;
uniform float uDof;
uniform float uMaxCoc;
uniform float uFocal;
uniform float uIntro;
uniform float uSparkle;
uniform float uScale;
uniform float uGradient;
uniform float uGain;

out vec2 vLocal;
out float vRadius;
out float vSegment;
out vec3 vLight;
out float vTint;

float hash11(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}

void main() {
  float id = float(gl_InstanceID);
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));
  vec3 box = vec3(9.0, 5.4, 6.0);
  vec3 p = (seed - 0.5) * box;
  p.z -= 0.6;
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));
  p *= mix(1.0, uScale, 0.5);
  vec4 clip = uViewProj * vec4(p, 1.0);
  float depth = clip.w;
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);
  float radius = baseRadius + coc;
  float spill = max(10.0 * uDpr, baseRadius);
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;
  vec2 position = px + corner * radius;
  vLocal = corner * radius;
  vRadius = radius;
  vSegment = 0.0;
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);
}`,y=`${v}
uniform vec3 uGlowColor;
uniform vec3 uLineColor;
uniform vec3 uSecondaryColor;
in vec2 vLocal;
in float vRadius;
in float vSegment;
in vec3 vLight;
in float vTint;
out vec4 outColor;
void main() {
  float along = clamp(vLocal.x, 0.0, vSegment);
  float d = length(vec2(vLocal.x - along, vLocal.y));
  float rho = d / max(vRadius, 1e-3);
  if (rho > 1.0) discard;
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));
  float core = exp(-rho * rho * 3.2);
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);
}`,b=`${v}
out vec2 vUv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`,x=`${v}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
vec3 pick(vec2 uv) {
  vec3 c = texture(uSource, uv).rgb;
  float peak = max(max(c.r, c.g), c.b);
  return c * smoothstep(0.35, 1.2, peak);
}
void main() {
  vec2 o = uTexel;
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));
  outColor = vec4(c * 0.25, 1.0);
}`,S=`${v}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  vec3 c = texture(uSource, vUv).rgb * 4.0;
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;
  outColor = vec4(c / 8.0, 1.0);
}`,C=`${v}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
  outColor = vec4(c / 12.0, 1.0);
}`,re=`${v}
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uGlow;
uniform float uBrightness;
uniform float uLightMode;
uniform float uGrain;
uniform float uVignette;
uniform float uFrame;
uniform vec2 uView;
uniform float uDpr;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 scene = texture(uScene, vUv);
  vec3 bloom = texture(uBloom, vUv).rgb;
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;
  float reach = max(uVignette * 0.3, 1e-4);
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;
  if (uLightMode > 0.5) {
    float amount = scene.a * uBrightness;
    float ink = (1.0 - exp(-amount * 1.5)) * mask;
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));
    outColor = vec4(tone * ink, ink);
    return;
  }
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;
  float peak = max(color.r, max(color.g, color.b));
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);
  outColor = vec4(color, max(color.r, max(color.g, color.b)));
}`,ie=`uTime.uTwist.uRoll.uWaves.uWidth.uRibbon.uOrient.uScale.uPlace.uVolume.uViewProj.uEye.uViewport.uDpr.uFibers.uDots.uFlow.uSize.uFocus.uDof.uMaxCoc.uFocal.uIntro.uPulse.uHover.uPart.uDotLength.uSparkle.uDepthSpread.uGain.uTips.uTint.uGradient.uFold.uGlowColor.uLineColor.uSecondaryColor`.split(`.`),ae=[`uViewProj`,`uViewport`,`uDpr`,`uTime`,`uSize`,`uFocus`,`uDof`,`uMaxCoc`,`uFocal`,`uIntro`,`uSparkle`,`uScale`,`uGradient`,`uGain`,`uGlowColor`,`uLineColor`,`uSecondaryColor`],w=[`uSource`,`uTexel`],oe=[`uScene`,`uBloom`,`uGlow`,`uBrightness`,`uLightMode`,`uGrain`,`uVignette`,`uFrame`,`uView`,`uDpr`],T=(e,t,n)=>Math.min(n,Math.max(t,e)),E=(e,t,n)=>{let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null},D=(e,t,n,r)=>{let i=E(e,e.VERTEX_SHADER,t),a=E(e,e.FRAGMENT_SHADER,n),o=e.createProgram();if(!i||!a||!o)return null;if(e.attachShader(o,i),e.attachShader(o,a),e.linkProgram(o),e.deleteShader(i),e.deleteShader(a),!e.getProgramParameter(o,e.LINK_STATUS))return e.deleteProgram(o),null;let s={};for(let t of r)s[t]=e.getUniformLocation(o,t);return{program:o,uniforms:s}},se=(e,t,n,r)=>{let i=1/Math.tan(e/2),a=1/(n-r);return[i/t,0,0,0,0,i,0,0,0,0,(r+n)*a,-1,0,0,2*r*n*a,0]},ce=(e,t)=>{let n=Array(16);for(let r=0;r<4;r+=1)for(let i=0;i<4;i+=1)n[r*4+i]=e[i]*t[r*4]+e[4+i]*t[r*4+1]+e[8+i]*t[r*4+2]+e[12+i]*t[r*4+3];return n},le=(e,t,n)=>{let r=Math.cos(e),i=Math.sin(e),a=Math.cos(t),o=Math.sin(t),s=Math.cos(n),c=Math.sin(n),l=[r,0,-i,0,1,0,i,0,r],u=[1,0,0,0,a,o,0,-o,a],d=[s,c,0,-c,s,0,0,0,1],f=(e,t)=>{let n=Array(9);for(let r=0;r<3;r+=1)for(let i=0;i<3;i+=1)n[r*3+i]=e[i]*t[r*3]+e[3+i]*t[r*3+1]+e[6+i]*t[r*3+2];return n};return f(d,f(u,l))},ue=(e,t)=>[e[0]*t[0]+e[3]*t[1]+e[6]*t[2],e[1]*t[0]+e[4]*t[1]+e[7]*t[2],e[2]*t[0]+e[5]*t[1]+e[8]*t[2]],O=({glowColor:e=`#8b5cf6`,lineColor:t,secondaryColor:n,gradient:_=`depth`,speed:v=.5,scale:E=1,rotation:O=18,rollSpeed:k=.15,layers:A=3,waves:j=1,twist:M=1.2,threads:N=72,volume:P=.7,spread:F=1,density:I=1,thickness:L=1,flow:R=.4,fiberStyle:z=`dots`,tips:B=0,foldGlow:de=1,perspective:fe=.65,depthOfField:pe=.85,focusDepth:me=0,particles:V=.5,sparkle:H=.5,glow:U=.8,brightness:W=1,vignette:G=.3,grain:K=.06,mouseInteraction:q=!0,hoverEffect:J=`focus`,mouseStrength:Y=1,pulseOnClick:X=!0,intro:Z=!0,lightMode:he=!1,paused:ge=!1,dpr:_e,...ve})=>{let ye=(0,r.useRef)(null),be=(0,r.useRef)(null),Q=(0,r.useRef)(null),xe={glowColor:String(e),lineColor:t?String(t):``,secondaryColor:n?String(n):``,gradient:p[_]??0,speed:Math.max(0,v),scale:T(E,.3,3),rotation:O*g,rollSpeed:k,layers:T(Math.round(A),1,3),waves:Math.max(0,j),twist:Math.max(0,M),threads:T(Math.round(N),6,180),volume:T(P,0,2),spread:T(F,.2,3),density:T(I,.2,3),thickness:T(L,.2,4),flow:R,dotLength:f[z]??0,tips:T(B,0,1),foldGlow:T(de,0,3),perspective:T(fe,0,1),depthOfField:T(pe,0,2),focusDepth:T(me,-1,1),particles:T(V,0,2),sparkle:T(H,0,2),glow:Math.max(0,U),brightness:Math.max(0,W),vignette:T(G,0,1),grain:Math.max(0,K),mouseInteraction:q,hover:d[J]??0,mouseStrength:Math.max(0,Y),pulseOnClick:X,intro:Z,lightMode:he,paused:ge,dpr:_e},$=(0,r.useRef)(xe);$.current=xe,(0,r.useEffect)(()=>{let e=ye.current,t=be.current,n=t?.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!e||!t||!n)return;let r=!!n.getExtension(`EXT_color_buffer_float`),i=D(n,te,y,ie),d=D(n,ne,y,ae),f=D(n,b,x,w),p=D(n,b,S,w),g=D(n,b,C,w),_=D(n,b,re,oe);if(!i||!d||!f||!p||!g||!_)return;let v=r?n.RGBA16F:n.RGBA8,E=()=>({texture:null,framebuffer:n.createFramebuffer(),width:0,height:0}),O=(e,t,r)=>{if(e.texture&&e.width===t&&e.height===r)return;e.texture&&n.deleteTexture(e.texture);let i=n.createTexture();n.bindTexture(n.TEXTURE_2D,i),n.texStorage2D(n.TEXTURE_2D,1,v,t,r),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,e.framebuffer),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,i,0),e.texture=i,e.width=t,e.height=r},k=E(),A=Array.from({length:o},E),j=n.createVertexArray(),M=document.createElement(`canvas`);M.width=1,M.height=1;let N=M.getContext(`2d`,{willReadFrequently:!0}),P=window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches??!1,F={time:0,roll:0,flow:0,frame:0,intro:$.current.intro&&!P?0:s,width:1,height:1,fit:1,colorKey:``,glow:[.55,.36,.96],line:[1,.85,.98],secondary:[.44,.29,.77],pointer:{x:0,y:0,inside:!1},hover:{x:0,y:0,presence:0,placed:!1},look:{x:0,y:0,vx:0,vy:0},focus:c+$.current.focusDepth*3,pulse:{s:0,age:9,strength:0,ribbon:0},camera:null},I=0,L=0,R=!0,z=!0,B=(e,t)=>{if(!N||!e)return t;let n=/^[0-9a-f]{3,8}$/i.test(e)?`#${e}`:e;N.clearRect(0,0,1,1),N.fillStyle=`#000000`,N.fillStyle=n,N.fillRect(0,0,1,1);let[r,i,a]=N.getImageData(0,0,1,1).data;return[r/255,i/255,a/255]},de=e=>{let t=`${e.glowColor}|${e.lineColor}|${e.secondaryColor}|${e.lightMode}`;t!==F.colorKey&&(F.colorKey=t,F.glow=B(e.glowColor,[.55,.36,.96]),F.secondary=e.secondaryColor?B(e.secondaryColor,F.glow):F.glow.map(e=>e*.8),e.lineColor?F.line=B(e.lineColor,F.glow):F.line=e.lightMode?F.glow:F.glow.map(e=>e+(1-e)*.72))},fe=(e,t,n,r)=>{let i=h[n],a=i[3],o=e*u;return[o,r*(.52*Math.sin(o*.43+t*.31+a)+.26*Math.sin(o*.79-t*.23+1.3+a*.7))+i[0]+o*i[2],r*.65*Math.sin(o*.33+t*.19+.7+a*1.3)+i[1]]},pe=e=>{let t=F.width/Math.max(F.height,1),n=[0,0,c],r=se(l,t,.1,60),i=[1,0,0,0,0,1,0,0,0,0,1,0,-n[0],-n[1],-n[2],1],a=le(e.perspective*.85+F.look.x*.22,.12-F.look.y*.14,e.rotation);return{eye:n,viewProj:ce(r,i),orient:a}},me=(e,t)=>{let n=e.viewProj,r=n[0]*t[0]+n[4]*t[1]+n[8]*t[2]+n[12],i=n[1]*t[0]+n[5]*t[1]+n[9]*t[2]+n[13],a=n[3]*t[0]+n[7]*t[1]+n[11]*t[2]+n[15];return{x:(r/a*.5+.5)*F.width,y:(.5-i/a*.5)*F.height,depth:a}},V=(e,t,n)=>{let r=F.camera;if(!r)return null;let i=null;for(let a=0;a<e.layers;a+=1)for(let o=0;o<=96;o+=1){let s=o/96-.5,c=fe(s,F.time,a,e.waves).map(t=>t*e.scale*F.fit),l=ue(r.orient,c),u=me(r,l),d=Math.hypot(u.x-t,u.y-n);(!i||d<i.gap)&&(i={gap:d,s,ribbon:a,depth:u.depth})}return i},H=()=>{let n=$.current,r=Math.max(1,e.clientWidth),i=Math.max(1,e.clientHeight),o=Math.min(n.dpr||window.devicePixelRatio||1,2),s=Math.max(r,i)*o,c=s>a?o*a/s:o,l=Math.max(1,Math.round(r*c)),u=Math.max(1,Math.round(i*c));(t.width!==l||t.height!==u)&&(t.width=l,t.height=u),F.width=r,F.height=i,F.fit=T(r/i/1.5,.6,1),W()},U=(e,t,r,i)=>{n.bindFramebuffer(n.FRAMEBUFFER,t.framebuffer),n.viewport(0,0,t.width,t.height),n.useProgram(e.program),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,r.texture),n.uniform1i(e.uniforms.uSource,0),n.uniform2f(e.uniforms.uTexel,i[0],i[1]),n.drawArrays(n.TRIANGLES,0,3)},W=()=>{let e=$.current;de(e);let r=pe(e);F.camera=r;let a=t.height/Math.max(F.height,1),l=e.paused||P?1:T(F.intro/s,0,1),u=1-(1-l)*(1-l)*(1-l);O(k,t.width,t.height),n.bindVertexArray(j),n.bindFramebuffer(n.FRAMEBUFFER,k.framebuffer),n.viewport(0,0,t.width,t.height),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.enable(n.BLEND),n.blendFunc(n.ONE,n.ONE);let v=Math.round(260*e.density),te=22*T(Math.sqrt(56e3/(e.threads*v*e.layers)),.45,1),ne=Math.max(.8*e.thickness,.45)**2/.64,y=(e.threads/72*e.density*ne)**-.75;n.useProgram(i.program);let b=i.uniforms;n.uniform1f(b.uTime,F.time),n.uniform1f(b.uTwist,e.twist),n.uniform1f(b.uRoll,F.roll),n.uniform1f(b.uWaves,e.waves),n.uniform1f(b.uWidth,.62*e.spread),n.uniformMatrix3fv(b.uOrient,!1,r.orient),n.uniform1f(b.uScale,e.scale*F.fit),n.uniformMatrix4fv(b.uViewProj,!1,r.viewProj),n.uniform3f(b.uEye,r.eye[0],r.eye[1],r.eye[2]),n.uniform2f(b.uViewport,t.width,t.height),n.uniform1f(b.uDpr,a),n.uniform1f(b.uFibers,e.threads),n.uniform1f(b.uDots,v),n.uniform1f(b.uFlow,F.flow),n.uniform1f(b.uSize,1.6*e.thickness),n.uniform1f(b.uFocus,F.focus),n.uniform1f(b.uDof,e.depthOfField),n.uniform1f(b.uMaxCoc,te),n.uniform1f(b.uFocal,c),n.uniform1f(b.uIntro,u),n.uniform4f(b.uPulse,F.pulse.s,F.pulse.age,F.pulse.strength,F.pulse.ribbon),n.uniform4f(b.uHover,F.hover.x*a,(F.height-F.hover.y)*a,140*a,F.hover.presence*e.mouseStrength),n.uniform1f(b.uPart,+(e.hover===1)),n.uniform1f(b.uDotLength,e.dotLength),n.uniform1f(b.uSparkle,e.sparkle),n.uniform1f(b.uDepthSpread,.12),n.uniform1f(b.uVolume,e.volume),n.uniform3f(b.uGlowColor,F.glow[0],F.glow[1],F.glow[2]),n.uniform3f(b.uLineColor,F.line[0],F.line[1],F.line[2]),n.uniform3f(b.uSecondaryColor,F.secondary[0],F.secondary[1],F.secondary[2]),n.uniform1f(b.uTips,e.tips),n.uniform1f(b.uGradient,e.gradient),n.uniform1f(b.uFold,e.foldGlow);for(let t=0;t<e.layers;t+=1){let r=h[t];n.uniform1f(b.uRibbon,t),n.uniform4f(b.uPlace,r[0],r[1],r[2],r[3]),n.uniform1f(b.uGain,ee[t]*y),n.uniform1f(b.uTint,m[t]),n.drawArraysInstanced(n.TRIANGLE_STRIP,0,4,e.threads*v)}let x=Math.round(420*e.particles);if(x>0){n.useProgram(d.program);let i=d.uniforms;n.uniformMatrix4fv(i.uViewProj,!1,r.viewProj),n.uniform2f(i.uViewport,t.width,t.height),n.uniform1f(i.uDpr,a),n.uniform1f(i.uTime,F.time),n.uniform1f(i.uSize,2.2*e.thickness),n.uniform1f(i.uFocus,F.focus),n.uniform1f(i.uDof,e.depthOfField),n.uniform1f(i.uMaxCoc,22),n.uniform1f(i.uFocal,c),n.uniform1f(i.uIntro,u),n.uniform1f(i.uSparkle,e.sparkle),n.uniform1f(i.uScale,e.scale*F.fit),n.uniform1f(i.uGradient,e.gradient),n.uniform1f(i.uGain,1/e.thickness),n.uniform3f(i.uGlowColor,F.glow[0],F.glow[1],F.glow[2]),n.uniform3f(i.uLineColor,F.line[0],F.line[1],F.line[2]),n.uniform3f(i.uSecondaryColor,F.secondary[0],F.secondary[1],F.secondary[2]),n.drawArraysInstanced(n.TRIANGLE_STRIP,0,4,x)}n.disable(n.BLEND);let S=e.glow>.001&&!e.lightMode;if(n.bindVertexArray(j),S){A.forEach((e,n)=>{O(e,Math.max(1,Math.round(t.width/2**(n+1))),Math.max(1,Math.round(t.height/2**(n+1))))}),U(f,A[0],k,[.5/k.width,.5/k.height]);for(let e=1;e<o;e+=1)U(p,A[e],A[e-1],[1/A[e-1].width,1/A[e-1].height]);n.enable(n.BLEND),n.blendFunc(n.ONE,n.ONE);for(let e=4;e>0;--e)U(g,A[e-1],A[e],[.5/A[e].width,.5/A[e].height]);n.disable(n.BLEND)}n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,t.width,t.height),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.useProgram(_.program);let C=_.uniforms;n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,k.texture),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,S?A[0].texture:k.texture),n.uniform1i(C.uScene,0),n.uniform1i(C.uBloom,1),n.uniform1f(C.uGlow,S?e.glow:0),n.uniform1f(C.uBrightness,e.brightness),n.uniform1f(C.uLightMode,+!!e.lightMode),n.uniform1f(C.uGrain,e.grain),n.uniform1f(C.uVignette,e.vignette),n.uniform1f(C.uFrame,F.frame%977),n.uniform2f(C.uView,t.width,t.height),n.uniform1f(C.uDpr,a),n.drawArrays(n.TRIANGLES,0,3),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,null),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,null),n.bindVertexArray(null)},G=e=>{if(I=0,!z||!R||document.hidden)return;let t=$.current,n=L?(e-L)/1e3:1/60,r=Math.min(.05,n);L=e;let i=!t.paused&&!P;i?(F.frame+=1,F.time+=r*t.speed,F.roll+=r*t.speed*t.rollSpeed,F.flow+=r*t.flow*12,F.intro+=Math.min(n,1)):F.intro<s&&(F.intro=s),F.pulse.age+=r,F.pulse.strength=Math.max(0,1-F.pulse.age/1.8)**2;let{pointer:a,hover:o,look:l}=F,u=t.mouseInteraction&&a.inside&&!P;u&&!o.placed&&(o.x=a.x,o.y=a.y,o.placed=!0),o.x+=(a.x-o.x)*(1-Math.exp(-r/.08)),o.y+=(a.y-o.y)*(1-Math.exp(-r/.08));let d=+!!u;o.presence+=(d-o.presence)*(1-Math.exp(-r/(d>o.presence?.3:.6))),!u&&o.presence<.001&&(o.placed=!1);let f=u?(a.x/F.width-.5)*.5:0,p=u?(.5-a.y/F.height)*.5:0;l.vx+=(30*(f-l.x)-11*l.vx)*r,l.vy+=(30*(p-l.y)-11*l.vy)*r,l.x+=l.vx*r,l.y+=l.vy*r;let m=c+t.focusDepth*3,h=m;if(u&&t.hover===0){let e=V(t,o.x,o.y);e&&(h=m+(e.depth-m)*o.presence*Math.min(1,t.mouseStrength))}F.focus+=(h-F.focus)*(1-Math.exp(-r/.35)),W();let ee=Math.abs(d-o.presence)>.002||Math.abs(f-l.x)>2e-4||Math.abs(p-l.y)>2e-4||Math.abs(h-F.focus)>.001||F.pulse.strength>.001;i||ee?I=requestAnimationFrame(G):L=0},K=()=>{!I&&z&&R&&!document.hidden&&(I=requestAnimationFrame(G))},q=t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top;F.pointer.x=r,F.pointer.y=i,F.pointer.inside=r>=0&&i>=0&&r<=n.width&&i<=n.height,K()},J=t=>{let n=$.current;if(!n.mouseInteraction||!n.pulseOnClick||t.button!==0||P||t.target instanceof Element&&t.target.closest(`a, button, input, textarea, select, label, [role="button"]`))return;let r=e.getBoundingClientRect(),i=t.clientX-r.left,a=t.clientY-r.top;if(i<0||a<0||i>r.width||a>r.height)return;let o=V(n,i,a);o&&(F.pulse={s:o.s,age:0,strength:1,ribbon:o.ribbon}),K()},Y=()=>{F.pointer.inside=!1,K()},X=()=>{L=0,K()},Z=new ResizeObserver(H);Z.observe(e);let he=new IntersectionObserver(e=>{R=e.some(e=>e.isIntersecting),R&&(L=0,K())});return he.observe(e),window.addEventListener(`pointermove`,q,{passive:!0}),window.addEventListener(`pointerdown`,J),document.documentElement.addEventListener(`pointerleave`,Y),document.addEventListener(`visibilitychange`,X),H(),K(),Q.current=()=>{I||W(),K()},()=>{z=!1,cancelAnimationFrame(I),Q.current=null,Z.disconnect(),he.disconnect(),window.removeEventListener(`pointermove`,q),window.removeEventListener(`pointerdown`,J),document.documentElement.removeEventListener(`pointerleave`,Y),document.removeEventListener(`visibilitychange`,X),n.deleteVertexArray(j),[k,...A].forEach(e=>{e.texture&&n.deleteTexture(e.texture),n.deleteFramebuffer(e.framebuffer)}),[i,d,f,p,g,_].forEach(e=>n.deleteProgram(e.program))}},[]),(0,r.useEffect)(()=>{Q.current?.()});let{className:Se=``,...Ce}=ve;return(0,i.jsx)(`div`,{ref:ye,className:`ghost-fibers-container${Se?` ${Se}`:``}`,...Ce,children:(0,i.jsx)(`canvas`,{ref:be,className:`ghost-fibers-canvas`,"aria-hidden":`true`})})};export{O as default};