/*
 * Persistent nebula particle field.
 * WebGL2 keeps tens of thousands of particles on the GPU; Canvas 2D is the
 * compatibility and reduced-motion fallback. The rest of the site never
 * depends on this renderer, so a graphics failure cannot block navigation.
 */
(() => {
  'use strict';

  let canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(pointer: coarse)');
  const query = new URLSearchParams(location.search);
  const forceCanvas = query.has('particleFallback');
  const forceReduced = query.has('particleReduced');
  const MAX_PARTICLES = 68000; // Higher OBS/browser stability without losing particle atmosphere.
  const TRAIL_LENGTH = 6;
  const MAX_PULSES = 4;
  const TAU = Math.PI * 2;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const wrap = value => ((value % 1) + 1) % 1;
  const isDark = () => document.body.dataset.theme === 'dark';

  const pointer = {
    targetX: .5,
    targetY: .5,
    x: .5,
    y: .5,
    strength: 0,
    speed: 0,
    active: false,
    lastX: .5,
    lastY: .5,
    lastTime: performance.now(),
  };
  const trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: .5, y: .5 }));
  const pulses = [];
  let charge = null,chargeTimer = 0;
  const RELEASE_AFTER_MS = 390;
  function discharge(){
    if(!charge)return;
    const {x,y,clicks}=charge;
    charge=null;chargeTimer=0;
    pulses.unshift({x,y,startedAt:performance.now(),strength:clamp(.84+Math.log2(1+clicks)*.74,1,4.8)});
    if(pulses.length>MAX_PULSES)pulses.length=MAX_PULSES;
  }
  function accumulateClick(x,y){
    const near=charge&&Math.hypot((charge.x-x)*innerWidth,(charge.y-y)*innerHeight)<Math.min(230,innerWidth*.22);
    if(charge&&!near)discharge();
    if(!charge)charge={x,y,clicks:0,lastHit:0};
    charge.x=x;charge.y=y;charge.clicks=Math.min(32,charge.clicks+1);charge.lastHit=performance.now();
    clearTimeout(chargeTimer);
    chargeTimer=setTimeout(discharge,RELEASE_AFTER_MS);
  }

  let renderer = null;
  let animationFrame = 0;
  let previousFrame = performance.now();
  let resizeFrame = 0;
  let fallbackReason = null;

  function publishStats(stats) {
    if (!canvas || !stats) return;
    canvas.dataset.particleBackend = String(stats.backend || 'none');
    canvas.dataset.particleCount = String(stats.count || 0);
    canvas.dataset.particleDpr = String(stats.dpr || 1);
    canvas.dataset.particleFps = String(stats.averageFps || 0);
    canvas.dataset.particleP95 = String(stats.p95FrameMs || 0);
    canvas.dataset.particleReduced = String(Boolean(stats.reducedMotion));
  }

  function particleBudget(width, height) {
    const areaCount = Math.round((width * height) / 14);
    const mobile = width < 600;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    const floor = mobile ? 8500 : 22000;
    const ceiling = mobile ? 21000 : MAX_PARTICLES;
    return clamp(Math.round(areaCount * (lowPower ? .57 : 1)), floor, ceiling);
  }

  function pixelRatio(width) {
    const mobile = width < 600 || coarsePointer.matches;
    return Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5);
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ result >>> 15, result | 1);
      result ^= result + Math.imul(result ^ result >>> 7, result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }

  function createDistribution(count) {
    const random = seededRandom(0xB10E2026);
    const base = new Float32Array(count * 2);
    const meta = new Float32Array(count * 4);
    const clouds = [
      [.05, .22, .17, .095, .28],
      [.24, .37, .20, .115, -.36],
      [.48, .56, .22, .13, .22],
      [.72, .35, .19, .105, -.48],
      [.93, .62, .18, .13, .34],
      [.34, .79, .17, .09, .68],
    ];

    const gaussian = () => {
      const a = Math.max(.000001, random());
      const b = random();
      return Math.sqrt(-2 * Math.log(a)) * Math.cos(TAU * b);
    };

    for (let index = 0; index < count; index += 1) {
      const distribution = random();
      const phase = random();
      let x;
      let y;
      let kind;

      if (distribution < .68) {
        const cloud = clouds[Math.floor(random() * clouds.length)];
        const along = clamp(gaussian(), -2.75, 2.75);
        const across = clamp(gaussian(), -2.5, 2.5);
        const cos = Math.cos(cloud[4]);
        const sin = Math.sin(cloud[4]);
        const ribbon = Math.sin(along * 3.7 + phase * TAU) * cloud[3] * .22;
        x = cloud[0] + cos * along * cloud[2] - sin * across * cloud[3] * .34 - sin * ribbon;
        y = cloud[1] + sin * along * cloud[2] + cos * across * cloud[3] * .34 + cos * ribbon;
        kind = random() < .025 ? 2 : random() < .21 ? 1 : 0;
      } else if (distribution < .9) {
        x = random();
        y = random();
        kind = random() < .012 ? 2 : random() < .1 ? 1 : 0;
      } else {
        const cloud = clouds[Math.floor(random() * clouds.length)];
        const angle = random() * TAU;
        const radius = Math.pow(random(), 1.8) * .085;
        x = cloud[0] + Math.cos(angle) * radius;
        y = cloud[1] + Math.sin(angle) * radius * .58;
        kind = random() < .73 ? 1 : 0;
      }

      const depth = clamp(Math.pow(random(), .78), .03, 1);
      base[index * 2] = wrap(x);
      base[index * 2 + 1] = wrap(y);
      meta[index * 4] = phase;
      meta[index * 4 + 1] = depth;
      meta[index * 4 + 2] = kind;
      meta[index * 4 + 3] = random();
    }

    return { base, meta };
  }

  function replaceCanvas() {
    const replacement = canvas.cloneNode(false);
    replacement.removeAttribute('width');
    replacement.removeAttribute('height');
    canvas.replaceWith(replacement);
    canvas = replacement;
    return replacement;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown shader error';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'Unknown program link error';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  const vertexShader = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aBase;
    layout(location = 1) in vec4 aMeta;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uDpr;
    uniform float uTheme;
    uniform float uPointerStrength;
    uniform float uPointerSpeed;
    uniform vec2 uTrail[${TRAIL_LENGTH}];
    uniform vec4 uPulses[${MAX_PULSES}];

    out vec4 vColor;
    out float vKind;

    void main() {
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float phase = aMeta.x * 6.28318530718;
      float depth = aMeta.y;
      float kind = aMeta.z;
      float tint = aMeta.w;
      vec2 p = aBase;

      float slow = uTime * .12;
      vec2 flowA = vec2(
        sin(p.y * 8.4 + slow * 1.55 + phase) + cos((p.x + p.y) * 5.2 - slow),
        cos(p.x * 7.1 - slow * 1.27 + phase * .73) - sin((p.x - p.y) * 6.8 + slow * .83)
      );
      vec2 flowB = vec2(
        sin(p.y * 17.0 - slow * .72 + phase * 1.31),
        cos(p.x * 15.0 + slow * .64 - phase * .91)
      );
      p += (flowA * .0125 + flowB * .0048) * mix(.32, 1.24, depth);
      p += vec2(sin(slow * .37 + phase), cos(slow * .29 - phase)) * .0038 * depth;

      float cursorGlow = 0.0;
      for (int index = 0; index < ${TRAIL_LENGTH}; index++) {
        vec2 delta = p - uTrail[index];
        delta.x *= aspect;
        float distanceToPointer = length(delta);
        float history = 1.0 - float(index) / float(${TRAIL_LENGTH});
        float radius = mix(.077, .1645, history); // Reduced by 30%.
        float falloff = (1.0 - smoothstep(0.0, radius, distanceToPointer)) * history * uPointerStrength;
        vec2 normal = delta / max(distanceToPointer, .0001);
        vec2 tangent = vec2(-normal.y, normal.x);
        float eddy = .72 + .28 * sin(distanceToPointer * 52.0 - uTime * 4.2 + float(index));
        vec2 displacement = (tangent * (.035 + uPointerSpeed * .04) * eddy + normal * .019) * falloff;
        displacement.x /= aspect;
        p += displacement;
        cursorGlow += falloff * .18;
      }

      float pulseGlow = 0.0;
      for (int index = 0; index < ${MAX_PULSES}; index++) {
        vec4 pulse = uPulses[index];
        vec2 delta = p - pulse.xy;
        delta.x *= aspect;
        float distanceToPulse = length(delta);
        vec2 normal = delta / max(distanceToPulse, .0001);
        if (pulse.z < -.5) {
          // A new elastic wobble on EVERY click; size continues growing beyond 9 clicks.
          float sinceTap = max(0.0, -pulse.z - 1.0);
          float envelope = exp(-sinceTap * 7.2);
          float elastic = sin(sinceTap * 38.0 + 1.2) * envelope;
          float mass = min(1.0, log2(1.0 + pulse.w) / 5.1);
          float gather = 1.0 - smoothstep(0.0, .115 + mass * .04, distanceToPulse);
          vec2 tangent = vec2(-normal.y, normal.x);
          vec2 displacement = (-normal * (.010 + mass * .021)
                              + normal * elastic * .024
                              + tangent * elastic * .014) * gather;
          displacement.x /= aspect;
          p += displacement;
          float core = exp(-pow(distanceToPulse / (.021 + mass * .033), 2.0));
          float iris = exp(-pow((distanceToPulse - (.023 + sinceTap * .064)) / .011, 2.0));
          pulseGlow += core * (.22 + mass * .44) + gather * (.09 + mass * .12)
                     + iris * envelope * .54;
        } else {
          float front = pulse.z * .255;
          float band = exp(-pow((distanceToPulse - front) / .044, 2.0)) * pulse.w;
          vec2 displacement = normal * band * .075;
          displacement.x /= aspect;
          p += displacement;
          pulseGlow += band;
        }
      }

      vec2 clip = p * 2.0 - 1.0;
      gl_Position = vec4(clip, 0.0, 1.0);

      float twinkle = .86 + .14 * sin(uTime * mix(.7, 1.6, tint) + phase);
      float pointSize = mix(.72, 2.15, depth);
      if (kind > 1.5) pointSize = mix(mix(1.0,2.3,depth),mix(12.0,42.0,depth),uTheme);
      else if (kind > .5) pointSize *= 1.48;
      pointSize += pulseGlow * 4.0 + cursorGlow * 1.2;
      gl_PointSize = clamp(pointSize * uDpr * twinkle, 1.0, 64.0);

      vec3 lightA = vec3(.055, .145, .205);
      vec3 lightB = vec3(.16, .31, .39);
      vec3 darkA = vec3(.21, .62, .82);
      vec3 darkB = vec3(.61, .89, 1.0);
      vec3 lightColor = mix(lightA, lightB, tint);
      vec3 darkColor = mix(darkA, darkB, tint);
      if (kind > .5 && kind < 1.5) {
        lightColor = mix(lightColor, vec3(.17, .22, .43), .46);
        darkColor = mix(darkColor, vec3(.69, .62, 1.0), .34);
      }
      vec3 color = mix(lightColor, darkColor, uTheme);
      color = mix(color, vec3(.58, .94, 1.0), clamp(pulseGlow * .72 + cursorGlow * .28, 0.0, .72));
      float baseAlpha = mix(.29, .68, depth);
      if (kind > 1.5) baseAlpha = mix(mix(.35,.58,depth),mix(.014,.052,depth),uTheme);
      else if (kind > .5) baseAlpha = min(.9, baseAlpha * 1.18);
      baseAlpha *= mix(1.25, 1.0, uTheme);
      baseAlpha *= 1.0 + pulseGlow * 1.55 + cursorGlow * 1.35;
      vColor = vec4(color, baseAlpha);
      vKind = kind;
    }
  `;

  const fragmentShader = `#version 300 es
    precision highp float;
    in vec4 vColor;
    in float vKind;
    out vec4 outColor;

    void main() {
      vec2 point = gl_PointCoord * 2.0 - 1.0;
      float radius = length(point);
      if (radius > 1.0) discard;
      float halo = 1.0 - smoothstep(.18, 1.0, radius);
      float core = 1.0 - smoothstep(.04, .42, radius);
      float shape = vKind > 1.5 ? halo * halo : max(core, halo * .38);
      outColor = vec4(vColor.rgb, vColor.a * shape);
    }
  `;

  class WebGLNebula {
    constructor(target, onFailure) {
      this.canvas = target;
      this.onFailure = onFailure;
      this.backend = 'webgl2';
      this.gl = target.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        desynchronized: false,
      });
      if (!this.gl) throw new Error('WebGL2 is unavailable');

      this.program = createProgram(this.gl, vertexShader, fragmentShader);
      this.distribution = createDistribution(MAX_PARTICLES);
      this.samples = [];
      this.frameCount = 0;
      this.targetCount = 0;
      this.currentCount = 0;
      this.minimumCount = 0;
      this.dpr = 1;
      this.theme = isDark() ? 1 : 0;
      this.avgFps = 0;
      this.p95Ms = 0;
      this.lastQualityChange = 0;
      this.startedAt = performance.now();
      this.lost = false;

      this.uniforms = {
        resolution: this.gl.getUniformLocation(this.program, 'uResolution'),
        time: this.gl.getUniformLocation(this.program, 'uTime'),
        dpr: this.gl.getUniformLocation(this.program, 'uDpr'),
        theme: this.gl.getUniformLocation(this.program, 'uTheme'),
        pointerStrength: this.gl.getUniformLocation(this.program, 'uPointerStrength'),
        pointerSpeed: this.gl.getUniformLocation(this.program, 'uPointerSpeed'),
        trail: this.gl.getUniformLocation(this.program, 'uTrail[0]'),
        pulses: this.gl.getUniformLocation(this.program, 'uPulses[0]'),
      };

      const gl = this.gl;
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.baseBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.baseBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.distribution.base, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      this.metaBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.metaBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.distribution.meta, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);

      this.handleContextLost = event => {
        event.preventDefault();
        if (this.lost) return;
        this.lost = true;
        this.onFailure('webgl-context-lost');
      };
      target.addEventListener('webglcontextlost', this.handleContextLost, { once: true });
      this.resize();
    }

    resize() {
      const width = innerWidth;
      const height = innerHeight;
      this.dpr = pixelRatio(width);
      this.canvas.width = Math.max(1, Math.round(width * this.dpr));
      this.canvas.height = Math.max(1, Math.round(height * this.dpr));
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.targetCount = particleBudget(width, height);
      this.minimumCount = Math.min(this.targetCount, width < 600 ? 7800 : 19500);
      if (!this.currentCount) this.currentCount = this.targetCount;
      else this.currentCount = Math.min(this.targetCount, Math.max(this.currentCount, this.minimumCount));
      publishStats(this.getStats());
    }

    recordFrame(delta, time) {
      if (delta <= 0 || delta > 120) return;
      this.samples.push(delta);
      if (this.samples.length > 180) this.samples.shift();
      this.frameCount += 1;
      if (this.samples.length < 90 || this.frameCount % 90 !== 0) return;

      const total = this.samples.reduce((sum, value) => sum + value, 0);
      const sorted = [...this.samples].sort((a, b) => a - b);
      this.avgFps = 1000 / (total / this.samples.length);
      this.p95Ms = sorted[Math.floor((sorted.length - 1) * .95)];
      publishStats(this.getStats());

      if (time - this.lastQualityChange < 2500) return;
      // A stable 30 Hz display or an automated/background browser should not
      // be mistaken for GPU pressure. Reduce only when the cadence is below
      // an interactive 22 fps for several samples.
      if (this.avgFps < 22 && this.currentCount > this.minimumCount) {
        this.currentCount = Math.max(this.minimumCount, Math.round(this.currentCount * .82));
        this.lastQualityChange = time;
        publishStats(this.getStats());
      } else if (this.avgFps < 16 && this.currentCount <= this.minimumCount && this.dpr > 1) {
        this.dpr = 1;
        this.canvas.width = Math.max(1, innerWidth);
        this.canvas.height = Math.max(1, innerHeight);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.lastQualityChange = time;
        publishStats(this.getStats());
      } else if (this.avgFps > 45 && this.currentCount < this.targetCount && time - this.lastQualityChange > 5000) {
        this.currentCount = Math.min(this.targetCount, Math.round(this.currentCount * 1.1));
        this.lastQualityChange = time;
        publishStats(this.getStats());
      }
    }

    render(time, delta) {
      if (this.lost) return;
      const gl = this.gl;
      this.recordFrame(delta, time);
      this.theme = mix(this.theme, isDark() ? 1 : 0, Math.min(1, delta / 260));

      const trailData = new Float32Array(TRAIL_LENGTH * 2);
      for (let index = 0; index < TRAIL_LENGTH; index += 1) {
        trailData[index * 2] = trail[index].x;
        trailData[index * 2 + 1] = trail[index].y;
      }
      const pulseData = new Float32Array(MAX_PULSES * 4);
      const reserved = charge ? 1 : 0;
      if(charge){
        pulseData[0]=charge.x;pulseData[1]=charge.y;pulseData[2]=-1-Math.min(.5,(time-charge.lastHit)/1000);
        pulseData[3]=charge.clicks;
      }
      for(let index=reserved;index<MAX_PULSES;index+=1){
        const pulse=pulses[index-reserved];
        if(!pulse)continue;
        const age=(time-pulse.startedAt)/1000;
        if(age<0||age>1.35)continue;
        const fade=1-age/1.35;
        pulseData[index*4]=pulse.x;pulseData[index*4+1]=pulse.y;
        pulseData[index*4+2]=age;pulseData[index*4+3]=fade*pulse.strength;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (this.theme > .5) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.useProgram(this.program);
      gl.uniform2f(this.uniforms.resolution, innerWidth, innerHeight);
      gl.uniform1f(this.uniforms.time, (time - this.startedAt) / 1000);
      gl.uniform1f(this.uniforms.dpr, this.dpr);
      gl.uniform1f(this.uniforms.theme, this.theme);
      gl.uniform1f(this.uniforms.pointerStrength, pointer.strength);
      gl.uniform1f(this.uniforms.pointerSpeed, pointer.speed);
      gl.uniform2fv(this.uniforms.trail, trailData);
      gl.uniform4fv(this.uniforms.pulses, pulseData);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.POINTS, 0, this.currentCount);
      gl.bindVertexArray(null);
    }

    getStats() {
      return {
        backend: this.backend,
        count: this.currentCount,
        targetCount: this.targetCount,
        dpr: this.dpr,
        averageFps: Number(this.avgFps.toFixed(1)),
        p95FrameMs: Number(this.p95Ms.toFixed(1)),
        samples: this.samples.length,
        reducedMotion: false,
        fallbackReason,
      };
    }

    destroy() {
      this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
      if (this.lost) return;
      const gl = this.gl;
      gl.deleteBuffer(this.baseBuffer);
      gl.deleteBuffer(this.metaBuffer);
      gl.deleteVertexArray(this.vao);
      gl.deleteProgram(this.program);
    }
  }

  class CanvasNebula {
    constructor(target, reduced) {
      this.canvas = target;
      this.backend = 'canvas2d';
      this.reduced = reduced;
      this.context = target.getContext('2d', { alpha: true, desynchronized: true });
      if (!this.context) throw new Error('Canvas 2D is unavailable');
      this.points = [];
      this.lastDraw = 0;
      this.lastSampleTime = 0;
      this.dirty = true;
      this.avgFps = 0;
      this.samples = [];
      this.resize();
    }

    resize() {
      const width = innerWidth;
      const height = innerHeight;
      this.dpr = Math.min(pixelRatio(width), 1.25);
      this.canvas.width = Math.max(1, Math.round(width * this.dpr));
      this.canvas.height = Math.max(1, Math.round(height * this.dpr));
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.count = clamp(Math.round((width * height) / 240), width < 600 ? 1800 : 2400, 3600);
      const data = createDistribution(this.count);
      this.points = Array.from({ length: this.count }, (_, index) => ({
        x: data.base[index * 2],
        y: data.base[index * 2 + 1],
        phase: data.meta[index * 4],
        depth: data.meta[index * 4 + 1],
        kind: data.meta[index * 4 + 2],
        tint: data.meta[index * 4 + 3],
      }));
      this.dirty = true;
      publishStats(this.getStats());
    }

    markDirty() {
      this.dirty = true;
    }

    position(point, time) {
      const width = innerWidth;
      const height = innerHeight;
      const phase = point.phase * TAU;
      const motion = this.reduced ? 0 : 1;
      let x = point.x * width;
      let y = (1 - point.y) * height;
      x += (Math.sin(point.y * 10 + time * .17 + phase) * 12 + Math.cos(point.x * 7 - time * .11 + phase) * 7) * point.depth * motion;
      y += (Math.cos(point.x * 9 - time * .14 + phase) * 10 - Math.sin(point.y * 8 + time * .09 + phase) * 6) * point.depth * motion;

      if (!this.reduced && pointer.strength > .001) {
        const dx = x - pointer.x * width;
        const dy = y - (1 - pointer.y) * height;
        const distance = Math.hypot(dx, dy) || 1;
        const radius = Math.min(168, Math.max(101.5, height * .161)); // Reduced by 30%.
        const force = Math.pow(Math.max(0, 1 - distance / radius), 2) * pointer.strength;
        x += (-dy / distance * (32 + pointer.speed * 38) + dx / distance * 17) * force;
        y += (dx / distance * (32 + pointer.speed * 38) + dy / distance * 17) * force;
      }

      if(!this.reduced&&charge){
        const dx=x-charge.x*width,dy=y-(1-charge.y)*height;
        const distance=Math.hypot(dx,dy)||1;
        const pull=Math.max(0,1-distance/Math.min(155,height*.20))*.45;
        const age=Math.min(.5,(performance.now()-charge.lastHit)/1000);
        const jolt=Math.sin(age*38+1.2)*Math.exp(-age*7.2);
        const mass=Math.log2(1+charge.clicks);
        x-=dx/distance*pull*(7+mass*8-jolt*19);
        y-=dy/distance*pull*(7+mass*8-jolt*19);
        x+=-dy/distance*pull*jolt*11;
        y+=dx/distance*pull*jolt*11;
      }
      if (!this.reduced) {
        for (const pulse of pulses) {
          const age = (performance.now() - pulse.startedAt) / 1000;
          if (age < 0 || age > 1.35) continue;
          const dx = x - pulse.x * width;
          const dy = y - (1 - pulse.y) * height;
          const distance = Math.hypot(dx, dy) || 1;
          const front = age * Math.min(300, height * .34);
          const band = Math.exp(-Math.pow((distance - front) / 32, 2)) * (1 - age / 1.35);
          x += dx / distance * band * 38;
          y += dy / distance * band * 38;
        }
      }
      return [x, y];
    }

    render(time, delta) {
      if (this.reduced && !this.dirty) return;
      if (!this.reduced && time - this.lastDraw < 32) return;
      const drawDelta = this.lastSampleTime ? time - this.lastSampleTime : 0;
      this.lastSampleTime = time;
      this.lastDraw = time;
      this.dirty = false;
      if (!this.reduced && drawDelta > 0 && drawDelta < 120) {
        this.samples.push(drawDelta);
        if (this.samples.length > 90) this.samples.shift();
        const average = this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length;
        this.avgFps = 1000 / average;
        if (this.samples.length % 30 === 0) publishStats(this.getStats());
      }

      const context = this.context;
      const dark = isDark();
      const seconds = time / 1000;
      context.clearRect(0, 0, innerWidth, innerHeight);
      context.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      const palettes = dark
        ? ['rgba(69,174,216,.48)', 'rgba(151,218,255,.68)', 'rgba(105,92,214,.055)']
        : ['rgba(20,55,73,.64)', 'rgba(44,65,108,.74)', 'rgba(38,78,94,.08)'];

      for (let kind = 2; kind >= 0; kind -= 1) {
        context.beginPath();
        for (const point of this.points) {
          if (Math.round(point.kind) !== kind) continue;
          const [x, y] = this.position(point, seconds);
          const size = kind === 2 ? (dark ? mix(8,26,point.depth) : mix(.65,1.55,point.depth)) : kind === 1 ? mix(.9, 2.1, point.depth) : mix(.55, 1.45, point.depth);
          context.moveTo(x + size, y);
          context.arc(x, y, size, 0, TAU);
        }
        context.fillStyle = palettes[kind];
        context.fill();
      }
      context.globalCompositeOperation = 'source-over';
      if(charge&&!this.reduced){
        const px=charge.x*innerWidth,py=(1-charge.y)*innerHeight;
        const age=Math.min(.5,(performance.now()-charge.lastHit)/1000);
        const wobble=Math.sin(age*38+1.2)*Math.exp(-age*7.2);
        const radius=14+Math.log2(1+charge.clicks)*10;
        const glow=context.createRadialGradient(px,py,0,px,py,radius);
        glow.addColorStop(0,'rgba(180,252,247,.52)');
        glow.addColorStop(.32,'rgba(85,204,223,.20)');
        glow.addColorStop(1,'rgba(85,204,223,0)');
        context.fillStyle=glow;context.beginPath();context.arc(px,py,radius,0,TAU);context.fill();
        context.beginPath();context.arc(px,py,Math.max(5,radius*.48+wobble*9),0,TAU);
        context.strokeStyle='rgba(85,204,223,'+(.18+Math.abs(wobble)*.46)+')';
        context.lineWidth=1.5+Math.abs(wobble)*2;context.stroke();
      }
    }

    getStats() {
      return {
        backend: this.backend,
        count: this.count,
        targetCount: this.count,
        dpr: this.dpr,
        averageFps: Number(this.avgFps.toFixed(1)),
        p95FrameMs: 0,
        samples: this.samples.length,
        reducedMotion: this.reduced,
        fallbackReason,
      };
    }

    destroy() {}
  }

  function activateRenderer(reason) {
    if (renderer) renderer.destroy();
    fallbackReason = reason || null;
    const reduced = forceReduced || reduceMotion.matches;

    if (!reduced && !forceCanvas && !reason) {
      try {
        renderer = new WebGLNebula(canvas, failure => {
          replaceCanvas();
          activateRenderer(failure);
        });
        return;
      } catch (error) {
        fallbackReason = error instanceof Error ? error.message : 'webgl-initialization-failed';
      }
    }

    try {
      const fallbackCanvas = canvas.getContext('2d') ? canvas : replaceCanvas();
      renderer = new CanvasNebula(fallbackCanvas, reduced);
    } catch (error) {
      fallbackReason = error instanceof Error ? error.message : 'particle-renderer-unavailable';
      renderer = null;
    }
  }

  function updatePointer(time, delta) {
    const activeTarget = pointer.active ? 1 : 0;
    pointer.strength = mix(pointer.strength, activeTarget, Math.min(1, delta / (pointer.active ? 95 : 420)));
    pointer.x = mix(pointer.x, pointer.targetX, Math.min(1, delta / 58));
    pointer.y = mix(pointer.y, pointer.targetY, Math.min(1, delta / 58));
    trail[0].x = mix(trail[0].x, pointer.x, Math.min(1, delta / 42));
    trail[0].y = mix(trail[0].y, pointer.y, Math.min(1, delta / 42));
    for (let index = 1; index < trail.length; index += 1) {
      const follow = Math.min(1, delta / (62 + index * 34));
      trail[index].x = mix(trail[index].x, trail[index - 1].x, follow);
      trail[index].y = mix(trail[index].y, trail[index - 1].y, follow);
    }
    pointer.speed *= Math.pow(.12, delta / 1000);
    while (pulses.length && time - pulses[pulses.length - 1].startedAt > 1500) pulses.pop();
  }

  function frame(time) {
    animationFrame = requestAnimationFrame(frame);
    if (document.hidden || document.body.classList.contains('pre-entry') || !renderer) {
      previousFrame = time;
      return;
    }
    const delta = clamp(time - previousFrame, 0, 64);
    previousFrame = time;
    updatePointer(time, delta);
    renderer.render(time, delta);
  }

  function setPointer(event) {
    const now = performance.now();
    const x = clamp(event.clientX / Math.max(innerWidth, 1), 0, 1);
    const y = clamp(1 - event.clientY / Math.max(innerHeight, 1), 0, 1);
    const elapsed = Math.max(8, now - pointer.lastTime);
    const distance = Math.hypot((x - pointer.lastX) * innerWidth, (y - pointer.lastY) * innerHeight);
    pointer.speed = clamp(mix(pointer.speed, distance / elapsed / 1.7, .55), 0, 1);
    pointer.targetX = x;
    pointer.targetY = y;
    pointer.lastX = x;
    pointer.lastY = y;
    pointer.lastTime = now;
    if (!pointer.active) {
      pointer.x = x;
      pointer.y = y;
      for (const point of trail) {
        point.x = x;
        point.y = y;
      }
    }
    pointer.active = true;
  }

  addEventListener('pointermove', setPointer, { passive: true });
  addEventListener('pointerdown', event => {
    if(document.body.classList.contains('pre-entry')||event.button>0)return;
    setPointer(event);
    if(forceReduced||reduceMotion.matches)return;
    accumulateClick(pointer.targetX,pointer.targetY);
  }, { passive: true });
  addEventListener('pointerout', event => {
    if (!event.relatedTarget) pointer.active = false;
  }, { passive: true });
  addEventListener('blur', () => { pointer.active = false; }, { passive: true });
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => renderer?.resize());
  }, { passive: true });

  const themeObserver = new MutationObserver(() => renderer?.markDirty?.());
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  const restartForMotionPreference = () => {
    replaceCanvas();
    activateRenderer(forceReduced || reduceMotion.matches ? 'reduced-motion' : null);
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', restartForMotionPreference);
  else reduceMotion.addListener(restartForMotionPreference);

  window.__particleField = {
    getStats: () => renderer?.getStats() || {
      backend: 'none',
      count: 0,
      reducedMotion: forceReduced || reduceMotion.matches,
      fallbackReason,
    },
    pulse: (x = innerWidth / 2, y = innerHeight / 2) => {
      if(forceReduced||reduceMotion.matches)return false;
      accumulateClick(clamp(x/Math.max(innerWidth,1),0,1),clamp(1-y/Math.max(innerHeight,1),0,1));
      return true;
    },
  };

  activateRenderer(forceCanvas ? 'forced-canvas-fallback' : forceReduced ? 'reduced-motion' : null);
  animationFrame = requestAnimationFrame(frame);
})();

