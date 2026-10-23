import{i as e,r as t,t as n}from"./index-CSskJyf9.js";var r=e(t(),1),i=n(),a=4,o=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uFlow;
uniform float uHue;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform vec2 uShift;
uniform vec4 uCursor;
uniform vec4 uPulses[${a}];
uniform float uSpectrum;
uniform float uTilt;
uniform vec3 uIntro;
uniform float uLightMode;
uniform float uOpacity;
out vec4 fragColor;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x);
  float fy = floor(y);
  float fz = floor(pz);
  float cx = ceil(x);
  float cy = ceil(y);
  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 uv, float bend) {
  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);
}

vec2 turn(vec2 p, vec2 center) {
  float c = cos(uTilt);
  float s = sin(uTilt);
  vec2 d = p - center;
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
  vec2 cursor = turn(uCursor.xy, center);
  vec2 field = screen + uShift;
  float t = 0.4 * uFlow;

  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;
  float gap = cursor.y + uShift.y - uBandHeight;
  float near = exp(-gap * gap / 0.16);
  float bend = reach * gap * near * 0.55;

  float pulse = 0.0;
  for (int i = 0; i < ${a}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);
    pulse += wave.z * exp(-x * x);
  }
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;

  float glow1 = auroraGlow(t, field, bend) * boost;
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;
  col *= uBrightness;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float energy = max(col.r, max(col.g, col.b));
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);
    float top = max(average.r, max(average.g, average.b));
    float spread = top - min(average.r, min(average.g, average.b));
    float core = smoothstep(0.55, 1.6, energy);
    float depth = 1.25 + 0.45 * core;
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));
    density = clamp(density * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
  } else {
    float alpha = clamp(length(col), 0.0, 1.0);
    vec3 color = clamp(col, 0.0, 1.0);
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);
  }
}`,c=(e,t,n)=>Math.min(n,Math.max(t,e)),l=e=>{let t=String(e||``).trim(),n=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);if(n){let e=n[1].length===3?n[1].replace(/./g,e=>e+e):n[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)/255)}let r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);return r?[r[1],r[2],r[3]].map(e=>c(parseFloat(e)/255,0,1)):null},u=(e,t,n)=>{let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)),e.deleteShader(r),null)):null},d=e=>{let t=u(e,e.VERTEX_SHADER,o),n=u(e,e.FRAGMENT_SHADER,s),r=t&&n?e.createProgram():null;if(!t||!n||!r)return t&&e.deleteShader(t),n&&e.deleteShader(n),null;if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),e.deleteShader(t),e.deleteShader(n),!e.getProgramParameter(r,e.LINK_STATUS))return console.error(e.getProgramInfoLog(r)),e.deleteProgram(r),null;let i={},a=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let t=0;t<a;t++){let n=e.getActiveUniform(r,t);n&&(i[n.name.replace(/\[0\]$/,``)]=e.getUniformLocation(r,n.name))}return{program:r,uniforms:i}},f=e=>{let t=c(e,0,1);return t*t*t*(t*(t*6-15)+10)},p=({speed:e=.6,scale:t=1.5,brightness:n=1,color1:o=`#f7f7f7`,color2:s=`#e100ff`,noiseFrequency:u=2.5,noiseAmplitude:p=1,bandHeight:m=.5,bandSpread:h=1,octaveDecay:g=.1,layerOffset:_=0,colorSpeed:v=1,spectrum:y=1,tilt:b=0,enableMouseInteraction:x=!0,mouseInfluence:S=.25,clickPulse:C=!0,intro:w=!0,lightMode:T=!1,opacity:E=1,className:D=``,style:O})=>{let k=(0,r.useRef)(null),A=(0,r.useRef)(null),j=(0,r.useRef)(null),[M,N]=(0,r.useState)(0),P={speed:Math.max(0,e),scale:Math.max(.01,t),brightness:Math.max(0,n),color1:l(o)||[.969,.969,.969],color2:l(s)||[.882,0,1],noiseFrequency:Math.max(.01,u),noiseAmplitude:Math.max(0,p),bandHeight:m,bandSpread:Math.max(0,h),octaveDecay:Math.max(0,g),layerOffset:_,colorSpeed:v,spectrum:c(y,0,1),tilt:c(b,-90,90)*Math.PI/180,mouse:x,influence:Math.max(0,S),clickPulse:C,intro:w,light:T,opacity:c(E,0,1)},F=(0,r.useRef)(P);return F.current=P,(0,r.useEffect)(()=>{j.current?.()}),(0,r.useEffect)(()=>{let e=k.current,t=A.current;if(!e||!t)return;let n=t.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:`high-performance`}),r=n?d(n):null;if(!n||!r)return;let i=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,o=n.createVertexArray(),s={width:1,height:1},l={x:.5,y:.5,inside:!1},u={x:.5,y:.5,presence:0},p=[],m=new Float32Array(16),h=0,g=0,_=F.current.intro&&!i&&M===0?0:1,v=0,y=0,b=!0,x=document.visibilityState!==`hidden`,S=!1,C=()=>{let n=F.current,r=e.getBoundingClientRect(),i=Math.max(1,r.width),a=Math.max(1,r.height),o=c(.35+.04*n.noiseFrequency*n.scale,.5,1),l=Math.max(1,Math.round(i*o)),u=Math.max(1,Math.round(a*o));(t.width!==l||t.height!==u)&&(t.width=l,t.height=u),s.width=i,s.height=a},w=e=>{if(v=0,S)return;let a=F.current,d=c((e-y)/1e3||0,0,.05);y=Math.max(y,e);let C=i?.35:1;h+=d*a.speed*C,g+=d*a.speed*a.colorSpeed*C,_<1&&(_=Math.min(1,_+d/2));let T=a.mouse&&l.inside,E=1-Math.exp(-d/.325);u.x+=((T?l.x:.5)-u.x)*E,u.y+=((T?l.y:.5)-u.y)*E,u.presence+=(+!!T-u.presence)*(1-Math.exp(-d/(T?.45:.8)));for(let e=p.length-1;e>=0;e--)p[e].age+=d,p[e].age>=2.6&&p.splice(e,1);m.fill(0),p.forEach((e,t)=>{m[t*4]=e.x,m[t*4+1]=e.y,m[t*4+2]=f(e.age/.18)*(1-f((e.age-.18)/2.42)),m[t*4+3]=e.age});let D=1-(1-_)**3,O=s.width/s.height,k=Math.min(1,a.influence*4)*u.presence;n.viewport(0,0,t.width,t.height),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.useProgram(r.program),n.bindVertexArray(o);let A=r.uniforms;n.uniform2f(A.uResolution,t.width,t.height),n.uniform1f(A.uFlow,h),n.uniform1f(A.uHue,g),n.uniform1f(A.uScale,a.scale),n.uniform1f(A.uBrightness,a.brightness),n.uniform3f(A.uColor1,a.color1[0],a.color1[1],a.color1[2]),n.uniform3f(A.uColor2,a.color2[0],a.color2[1],a.color2[2]),n.uniform1f(A.uNoiseFreq,a.noiseFrequency),n.uniform1f(A.uNoiseAmp,a.noiseAmplitude),n.uniform1f(A.uBandHeight,a.bandHeight),n.uniform1f(A.uBandSpread,a.bandSpread),n.uniform1f(A.uOctaveDecay,a.octaveDecay),n.uniform1f(A.uLayerOffset,a.layerOffset),n.uniform2f(A.uShift,(u.x-.5)*a.influence*!!a.mouse,(u.y-.5)*a.influence*!!a.mouse),n.uniform4f(A.uCursor,u.x*O,u.y,k,0),n.uniform4fv(A.uPulses,m),n.uniform1f(A.uSpectrum,a.spectrum),n.uniform1f(A.uTilt,a.tilt),n.uniform3f(A.uIntro,f(_/.7),1+3*(1-D)*(1-D),.25+.75*D),n.uniform1f(A.uLightMode,+!!a.light),n.uniform1f(A.uOpacity,a.opacity),n.drawArrays(n.TRIANGLES,0,3);let j=Math.abs(u.x-(T?l.x:.5))>1e-4||Math.abs(u.y-(T?l.y:.5))>1e-4||Math.abs(+!!T-u.presence)>.001||p.length>0;(a.speed>0||_<1||j)&&b&&x&&(v=requestAnimationFrame(w))},T=()=>{!v&&!S&&b&&x&&(y=performance.now(),v=requestAnimationFrame(w))};j.current=()=>{C(),T()};let E=t=>{let n=e.getBoundingClientRect();return{x:(t.clientX-n.left)/Math.max(1,n.width),y:1-(t.clientY-n.top)/Math.max(1,n.height),inside:t.clientX>=n.left&&t.clientX<=n.right&&t.clientY>=n.top&&t.clientY<=n.bottom}},D=e=>{let t=E(e);l.x=t.x,l.y=t.y,l.inside=t.inside,T()},O=e=>{let t=F.current,n=E(e);n.inside&&t.clickPulse&&!i&&(p.push({x:n.x*(s.width/s.height),y:n.y,age:0}),p.length>a&&p.shift(),T())},P=()=>{l.inside=!1,T()},I=e=>{e.pointerType!==`mouse`&&P()};window.addEventListener(`pointermove`,D,{passive:!0}),window.addEventListener(`pointerdown`,O,{passive:!0}),window.addEventListener(`pointerup`,I,{passive:!0}),window.addEventListener(`pointercancel`,I,{passive:!0}),document.documentElement.addEventListener(`pointerleave`,P);let L=e=>{e.preventDefault(),S=!0,cancelAnimationFrame(v),v=0},R=()=>N(e=>e+1);t.addEventListener(`webglcontextlost`,L),t.addEventListener(`webglcontextrestored`,R);let z=new ResizeObserver(()=>{C(),T()});z.observe(e);let B=new IntersectionObserver(e=>{b=e.some(e=>e.isIntersecting),T()});B.observe(e);let V=()=>{x=document.visibilityState!==`hidden`,T()};return document.addEventListener(`visibilitychange`,V),C(),T(),()=>{cancelAnimationFrame(v),j.current=null,z.disconnect(),B.disconnect(),window.removeEventListener(`pointermove`,D),window.removeEventListener(`pointerdown`,O),window.removeEventListener(`pointerup`,I),window.removeEventListener(`pointercancel`,I),document.documentElement.removeEventListener(`pointerleave`,P),document.removeEventListener(`visibilitychange`,V),t.removeEventListener(`webglcontextlost`,L),t.removeEventListener(`webglcontextrestored`,R),n.isContextLost()||(n.deleteVertexArray(o),n.deleteProgram(r.program))}},[M]),(0,i.jsx)(`div`,{ref:k,className:`soft-aurora${D?` ${D}`:``}`,style:O,children:(0,i.jsx)(`canvas`,{ref:A,className:`soft-aurora__canvas`,"aria-hidden":`true`})})};export{p as default};