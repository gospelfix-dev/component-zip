(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const FPS = 30;
  const FONT = '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  const MIN_COLS = 48, MIN_ROWS = 26;

  // world: floor at y = 0, tree axis on y, camera on -z looking slightly down
  const Y0 = 0.1, Y1 = 1.06, RMAX = 0.46, TIERS = 6;
  const CAM_D = 2.7, CAM_H = 0.62, PITCH = (9 * Math.PI) / 180;
  const CP = Math.cos(PITCH), SP = Math.sin(PITCH);
  const LIGHT = norm([-0.55, 0.6, -0.65]); // fixed key light, front upper left
  const HALF = norm([LIGHT[0], LIGHT[1] + 0.2, LIGHT[2] - 1]); // Blinn half vector toward the camera
  const SPIN = 0.32; // rad/s turntable speed

  const K_NEEDLE = 0, K_GARLAND = 1, K_ORN = 2, K_LIGHT = 3, K_TRUNK = 4, K_GIFT = 5;
  const NEEDLE_RAMP = codes(".,:+xX%$#");
  const GIFT_RAMP = codes(".:=#%");
  const GARLAND_RAMP = codes("..:-");
  const HOT = 1.6, FLASH = 0.3; // seconds: a new layer glows white-hot, then cools to green; flash of other pieces
  const MESSAGE = "M E R R Y   C H R I S T M A S   * 2 0 2 6";

  const LIGHT_COLORS = [[255, 226, 140], [255, 226, 140], [255, 236, 190], [255, 205, 95]]; // warm fairy lights
  const ORN_COLORS = [[220, 26, 34], [220, 26, 34], [200, 20, 30], [245, 185, 50], [240, 170, 40]]; // mostly red, some gold
  const GIFTS = [
    { x: -0.31, z: -0.17, w: 0.17, h: 0.13, d: 0.15, c: [200, 35, 42], rb: [245, 215, 120] },
    { x: 0.3, z: -0.12, w: 0.19, h: 0.15, d: 0.16, c: [50, 90, 215], rb: [235, 235, 245] },
    { x: 0.03, z: -0.37, w: 0.13, h: 0.1, d: 0.12, c: [230, 180, 60], rb: [200, 40, 50] },
    { x: -0.15, z: 0.31, w: 0.15, h: 0.16, d: 0.14, c: [170, 45, 150], rb: [240, 220, 140] },
    { x: 0.33, z: 0.27, w: 0.14, h: 0.11, d: 0.14, c: [40, 150, 90], rb: [245, 215, 120] },
  ];

  // presents that keep falling from the sky: [w, h] with a square side so a quarter tumble still sits flat
  const DROP_SIZES = [[0.16, 0.14], [0.2, 0.17], [0.13, 0.12], [0.24, 0.2]];
  const DROP_MAX = 6, GIFT_FALL = 1.1, GRAVITY = 1.3, REST = 6;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const easeOut = (p) => 1 - (1 - p) ** 3;
  const easeOutBack = (p) => 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
  const CHAR = Array.from({ length: 128 }, (_, c) => String.fromCharCode(c));
  function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function codes(s) { return Array.from(s, (c) => c.charCodeAt(0)); }

  // seedable RNG (mulberry32) so ?seed=7 always grows the same tree
  function makeRng(seed) {
    let a = seed >>> 0, spare = null;
    const random = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      random,
      uniform: (lo, hi) => lo + (hi - lo) * random(),
      pick: (arr) => arr[Math.floor(random() * arr.length)],
      normal(mu, sd) {
        if (spare !== null) { const v = spare; spare = null; return mu + sd * v; }
        let u = 0;
        while (u === 0) u = random();
        const r = Math.sqrt(-2 * Math.log(u)), th = TAU * random();
        spare = r * Math.sin(th);
        return mu + sd * r * Math.cos(th);
      },
    };
  }

  // tiered cone: each tier flares out toward its own bottom edge
  function coneR(y) {
    const u = clamp((Y1 - y) / (Y1 - Y0), 0, 1);
    const tierPos = Math.min(u * TIERS, TIERS - 1e-4);
    const local = tierPos - Math.floor(tierPos);
    return RMAX * u ** 0.78 * (0.9 + 0.1 * local ** 0.7); // bell-shaped, only a hint of tiers
  }
  const tierFromBottom = (y) => TIERS - 1 - Math.min(TIERS - 1, Math.floor(((Y1 - y) / (Y1 - Y0)) * TIERS));

  // one gift box as surface points around its center, packed [x, y, z, nx, ny, nz, ribbon] * n;
  // ribbons cross on every face
  function boxPoints(w, h, d) {
    const s = 0.011, rib = 0.014, pts = [];
    const face = (x, y, z, nx, ny, nz, ribbon) => pts.push(x, y, z, nx, ny, nz, ribbon ? 1 : 0);
    for (let lx = -w / 2; lx <= w / 2; lx += s) {
      for (let lz = -d / 2; lz <= d / 2; lz += s) {
        const ribbon = Math.abs(lx) < rib || Math.abs(lz) < rib;
        face(lx, h / 2, lz, 0, 1, 0, ribbon);
        face(lx, -h / 2, lz, 0, -1, 0, ribbon); // the bottom shows while a box tumbles
      }
      for (let ly = -h / 2; ly <= h / 2; ly += s) {
        face(lx, ly, -d / 2, 0, 0, -1, Math.abs(lx) < rib);
        face(lx, ly, d / 2, 0, 0, 1, Math.abs(lx) < rib);
      }
    }
    for (let lz = -d / 2; lz <= d / 2; lz += s) {
      for (let ly = -h / 2; ly <= h / 2; ly += s) {
        face(-w / 2, ly, lz, -1, 0, 0, Math.abs(lz) < rib);
        face(w / 2, ly, lz, 1, 0, 0, Math.abs(lz) < rib);
      }
    }
    return Float32Array.from(pts);
  }

  const giftGlyph = (k, ribbon) => (ribbon ? 43 : GIFT_RAMP[clamp(Math.floor(k * GIFT_RAMP.length), 0, GIFT_RAMP.length - 1)]);

  // ---- the tree as a point cloud ---------------------------------------------

  function buildCloud(rng, introSpeed) {
    const P = { x: [], y: [], z: [], nx: [], ny: [], nz: [], r: [], g: [], b: [], kind: [], ao: [], aux: [], t0: [], ax: [], ay: [], az: [] };
    const add = (x, y, z, n, rgb, kind, ao, aux, t0, anchor) => {
      const [nx, ny, nz] = norm(n);
      P.x.push(x); P.y.push(y); P.z.push(z); P.nx.push(nx); P.ny.push(ny); P.nz.push(nz);
      P.r.push(rgb[0]); P.g.push(rgb[1]); P.b.push(rgb[2]);
      P.kind.push(kind); P.ao.push(ao); P.aux.push(aux); P.t0.push(t0);
      const a = anchor || [x, y, z];
      P.ax.push(a[0]); P.ay.push(a[1]); P.az.push(a[2]);
    };
    // ~4% of needles carry a little snow
    const needleRgb = (lift) => rng.random() < 0.04 ? [205, 222, 212] : [18 + 25 * rng.random() + 30 * lift, 92 + 70 * rng.random() + 40 * lift, 38 + 25 * rng.random()];
    const jitter = () => Math.floor(rng.random() * 3) - 1; // per-needle glyph variation

    // build schedule (seconds at speed 1)
    const stages = [[0, "ground"], [0.8, "trunk"]];
    const T_TREE = 1.2, T_TIER = 1.0;
    for (let k = 0; k < TIERS; k++) stages.push([T_TREE + k * T_TIER, `layer ${k + 1}/${TIERS}`]);
    const T_GARLAND = T_TREE + TIERS * T_TIER + 0.3;
    const T_ORN = T_GARLAND + 1.5, T_LIGHTS = T_ORN + 1.1, T_STAR = T_LIGHTS + 1.2;
    const T_GIFTS = T_STAR + 0.7, T_TEXT = T_GIFTS + GIFTS.length * 0.4 + GIFT_FALL + 0.3;
    stages.push([T_GARLAND, "garland"], [T_ORN, "ornaments"], [T_LIGHTS, "lights"], [T_STAR, "star"], [T_GIFTS, "presents"], [T_TEXT, "greeting"]);
    // each layer grows upward over 60% of its slot, then pauses before the next one starts
    const tierTime = (y) => {
      const pos = clamp(((y - Y0) / (Y1 - Y0)) * TIERS, 0, TIERS - 1e-4);
      return T_TREE + Math.floor(pos) * T_TIER + (pos % 1) * 0.6 * T_TIER + rng.uniform(0, 0.12);
    };

    // needles: a shell around the cone, denser toward the outside
    for (let n = 0; n < 15000; ) {
      const y = Y0 + rng.random() * (Y1 - Y0);
      const R = coneR(y);
      if (rng.random() * RMAX > R) continue;
      n++;
      const a = rng.random() * TAU, rf = 0.8 + 0.22 * Math.sqrt(rng.random());
      add(R * rf * Math.cos(a), y, R * rf * Math.sin(a), [Math.cos(a), 0.45, Math.sin(a)], needleRgb(0), K_NEEDLE, rf, jitter(), tierTime(y));
    }

    // branches: rings of drooping limbs, each ring turned by the golden angle
    for (let i = 0; i < TIERS * 2; i++) {
      const u = (i + 0.5) / (TIERS * 2);
      const yi = Y1 - u * (Y1 - Y0);
      const R = coneR(yi);
      const nb = Math.round(6 + 16 * u);
      for (let b = 0; b < nb; b++) {
        const a = (TAU * b) / nb + i * 0.618 * TAU + rng.normal(0, 0.08);
        const L = R * rng.uniform(0.82, 1.06);
        const np = Math.round(L * 90);
        for (let k = 0; k < np; k++) {
          const t = 0.55 + 0.45 * rng.random();
          const r = L * t + rng.normal(0, 0.008);
          const y = yi - 0.06 * t * t * (R / RMAX) + rng.normal(0, 0.008);
          const aa = a + rng.normal(0, 0.02 / Math.max(r, 0.05));
          add(r * Math.cos(aa), y, r * Math.sin(aa), [Math.cos(aa), 0.35, Math.sin(aa)], needleRgb(t > 0.9 ? 0.6 : 0), K_NEEDLE, 0.85 + 0.2 * t, jitter(), tierTime(yi));
        }
      }
    }

    // trunk
    for (let n = 0; n < 300; n++) {
      const a = rng.random() * TAU, y = rng.random() * (Y0 + 0.04);
      add(0.05 * Math.cos(a), y, 0.05 * Math.sin(a), [Math.cos(a), 0, Math.sin(a)], [110, 66, 36], K_TRUNK, 1, 0, 0.8 + 0.4 * (y / (Y0 + 0.04)));
    }

    // garland: beaded gold strands, each draped in swags all the way round
    [0.22, 0.44, 0.64, 0.82].forEach((h, s) => {
      const yc = Y0 + h * (Y1 - Y0), NG = 700, SWAGS = 9 - s * 2;
      for (let k = 0; k < NG; k++) {
        const u = k / NG, a = u * TAU + s * 1.7;
        const y = yc + 0.02 * Math.sin(a + s) - 0.045 * (1 - h * 0.5) * Math.abs(Math.sin((a * SWAGS) / 2));
        const R = coneR(y) * 1.04;
        add(R * Math.cos(a), y, R * Math.sin(a), [Math.cos(a), 0.3, Math.sin(a)], [255, 200, 90], K_GARLAND, 1, u, T_GARLAND + 0.35 * s + 0.8 * u);
      }
    });

    // ornaments: small spheres hung on the outside, kept apart from each other
    const centers = [];
    for (let tries = 0; centers.length < 22 && tries < 4000; tries++) {
      const y = rng.uniform(Y0 + 0.06, Y1 - 0.12);
      const a = rng.random() * TAU;
      const R = coneR(y) * 1.03; // sit proud of the needles
      const c = [R * Math.cos(a), y, R * Math.sin(a)];
      if (centers.some((o) => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) < 0.13)) continue;
      centers.push(c);
    }
    const M = 160;
    for (const c of centers) {
      const rr = 0.03 + 0.016 * ((Y1 - c[1]) / (Y1 - Y0));
      const rgb = rng.pick(ORN_COLORS);
      const t0 = T_ORN + rng.uniform(0, 0.9);
      for (let j = 0; j < M; j++) {
        // Fibonacci sphere
        const yy = 1 - (2 * (j + 0.5)) / M, rad = Math.sqrt(1 - yy * yy), phi = j * 2.39996;
        const n = [Math.cos(phi) * rad, yy, Math.sin(phi) * rad];
        add(c[0] + n[0] * rr, c[1] + n[1] * rr, c[2] + n[2] * rr, n, rgb, K_ORN, 1, 0, t0, c);
      }
    }

    // lights: tiny bulbs on the surface, mostly warm white
    for (let n = 0; n < 420; ) {
      const y = Y0 + 0.03 + rng.random() * (Y1 - Y0 - 0.06);
      const R = coneR(y);
      if (rng.random() * RMAX > R) continue;
      n++;
      const a = rng.random() * TAU;
      const rgb = rng.pick(LIGHT_COLORS), ph = rng.uniform(0, TAU), t0 = T_LIGHTS + rng.uniform(0, 1.0);
      const bulbs = rng.random() < 0.3 ? 2 : 1; // some come in pairs, like "oo" on a strand
      for (let q = 0; q < bulbs; q++) {
        const aa = a + (q * 0.017) / Math.max(R, 0.05);
        add(R * Math.cos(aa), y, R * Math.sin(aa), [Math.cos(aa), 0.4, Math.sin(aa)], rgb, K_LIGHT, 1, ph + q, t0);
      }
    }

    // presents under the tree drop out of the sky one after another
    GIFTS.forEach((G, gi) => {
      const t0 = T_GIFTS + gi * 0.4, anchor = [G.x, G.h / 2, G.z];
      const box = boxPoints(G.w, G.h, G.d);
      for (let j = 0; j < box.length; j += 7) {
        const ribbon = box[j + 6];
        add(G.x + box[j], G.h / 2 + box[j + 1], G.z + box[j + 2], [box[j + 3], box[j + 4], box[j + 5]], ribbon ? G.rb : G.c, K_GIFT, 1, ribbon, t0, anchor);
      }
    });

    const textT = Array.from(MESSAGE, (_, k) => T_TEXT + 0.06 * k);
    const end = textT[textT.length - 1] + FLASH;

    // speed 0 = no intro: everything was built long ago
    const at = introSpeed > 0 ? (v) => v / introSpeed : () => -10;
    const F32 = (a) => Float32Array.from(a);
    return {
      n: P.x.length,
      x: F32(P.x), y: F32(P.y), z: F32(P.z), nx: F32(P.nx), ny: F32(P.ny), nz: F32(P.nz),
      r: F32(P.r), g: F32(P.g), b: F32(P.b), kind: Uint8Array.from(P.kind), ao: F32(P.ao), aux: F32(P.aux),
      ax: F32(P.ax), ay: F32(P.ay), az: F32(P.az),
      t0: F32(P.t0.map(at)),
      starT: at(T_STAR),
      textT: textT.map(at),
      introEnd: introSpeed > 0 ? at(end) : -1,
      stages: stages.map(([s, l]) => [at(s), l]),
      floorT: (d) => at(0.8 * d),
    };
  }

  // ---- screen ---------------------------------------------------------------

  class Renderer {
    constructor(layout, cloud, rng) {
      Object.assign(this, layout);
      this.cloud = cloud;
      this.rng = rng;
      const N = this.cols * this.rows;
      this.zbuf = new Float32Array(N);
      this.ch = new Uint8Array(N);
      this.rgb = new Float32Array(N * 3);
      this.glow = new Uint8Array(N);
      this.fitCamera();
      this.buildFloor();
      this.buildSky();
      this.buildSnow();
      this.boxes = DROP_SIZES.map(([w, h]) => ({ pts: boxPoints(w, h, h), half: h / 2 }));
      this.presents = [];
      this.nextDrop = 0;
      this.letters = 0;
    }

    // camera scale so the tree spans from ~6% to 80% of the canvas height
    fitCamera() {
      const unit = (y) => { const dy = y - CAM_H, dz = CAM_D; return (dy * CP + dz * SP) / (-dy * SP + dz * CP); };
      const ya = unit(Y1 + 0.1), yb = unit(0);
      let F = (0.8 * this.cssH) / (ya - yb);
      F = Math.min(F, (0.46 * this.cssW) / ((RMAX * 1.15) / CAM_D));
      this.F = F;
      this.ox = this.cssW / 2;
      this.oy = 0.84 * this.cssH + F * yb;
    }

    // project a world point; returns camera depth or -1 when it is off screen
    project(x, y, z, out) {
      const dy = y - CAM_H, dz = z + CAM_D;
      const yc = dy * CP + dz * SP, zc = -dy * SP + dz * CP;
      if (zc < 0.15) return -1;
      const sx = this.ox + (this.F * x) / zc, sy = this.oy - (this.F * yc) / zc;
      const col = Math.floor((sx - this.gx) / this.cw), row = Math.floor((sy - this.gy) / this.lh);
      if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return -1;
      out.cell = row * this.cols + col;
      return zc;
    }

    // the floor never moves, so it is projected once into its own buffers
    buildFloor() {
      const N = this.cols * this.rows, o = {};
      this.floorZ = new Float32Array(N).fill(Infinity);
      this.floorCh = new Uint8Array(N);
      this.floorRgb = new Float32Array(N * 3);
      this.floorT = new Float32Array(N);
      for (let z = -1.6; z <= 6; z += 0.1) {
        const span = (z + CAM_D) * 0.9;
        for (let x = -span; x <= span; x += 0.03) {
          const zc = this.project(x, 0, z, o);
          if (zc < 0 || zc >= this.floorZ[o.cell]) continue;
          const i = o.cell, d = Math.hypot(x, z);
          const fade = clamp(1.25 - (z + 1.6) / 7, 0.22, 1);
          const shadow = clamp(d / 0.55, 0.35, 1); // darker under the branches
          const s = fade * shadow;
          this.floorZ[i] = zc;
          this.floorCh[i] = zc < 2.6 ? 58 : 46; // ':' near, '.' far
          this.floorRgb[i * 3] = 95 * s; this.floorRgb[i * 3 + 1] = 108 * s; this.floorRgb[i * 3 + 2] = 150 * s;
          this.floorT[i] = this.cloud.floorT(clamp(d / 3, 0, 1));
        }
      }
      let top = this.rows;
      for (let i = 0; i < N; i++) if (this.floorCh[i]) { top = Math.floor(i / this.cols); break; }
      this.horizon = top;
    }

    buildSky() {
      const { rng, cols } = this;
      const n = Math.floor((cols * this.horizon) / 40);
      this.sky = Array.from({ length: n }, () => ({
        cell: Math.floor(rng.random() * this.horizon) * cols + Math.floor(rng.random() * cols),
        ch: rng.random() < 0.7 ? 46 : 42,
        phase: rng.uniform(0, TAU), speed: rng.uniform(0.5, 2.5),
      }));
    }

    buildSnow() {
      const { rng } = this;
      this.snow = Array.from({ length: this.reduceMotion ? 150 : 2200 }, () => ({
        x: rng.uniform(-2.5, 2.5), y: rng.uniform(0, 1.9), z: rng.uniform(-1.9, 3),
        vy: rng.uniform(0.2, 0.45), phase: rng.uniform(0, TAU),
      }));
    }

    write(cell, zc, ch, r, g, b, glow) {
      if (zc >= this.zbuf[cell]) return;
      this.zbuf[cell] = zc;
      this.ch[cell] = ch;
      this.rgb[cell * 3] = r; this.rgb[cell * 3 + 1] = g; this.rgb[cell * 3 + 2] = b;
      this.glow[cell] = glow ? 1 : 0;
    }

    frame(t, dt, theta) {
      const { rng, cloud: C } = this;
      const intro = t < C.introEnd;
      this.zbuf.set(this.floorZ);
      this.ch.set(this.floorCh);
      this.rgb.set(this.floorRgb);
      this.glow.fill(0);
      if (intro) {
        for (let i = 0; i < this.ch.length; i++) {
          if (!this.ch[i]) continue;
          const f = clamp((t - this.floorT[i]) / 0.4, 0, 1);
          if (f <= 0) { this.ch[i] = 0; this.zbuf[i] = Infinity; continue; }
          for (let c = 0; c < 3; c++) this.rgb[i * 3 + c] *= f;
        }
      }

      for (const s of this.sky) {
        if (this.ch[s.cell]) continue;
        let b = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        if (rng.random() < 0.01) b = 1;
        if (b < 0.2) continue;
        this.write(s.cell, 1e9, s.ch, 190 * b, 200 * b, 245 * b, false);
      }

      const cs = Math.cos(theta), sn = Math.sin(theta), o = {};
      for (let i = 0; i < C.n; i++) {
        let x = C.x[i], y = C.y[i], z = C.z[i], flash = 0;
        let nx0 = C.nx[i], ny0 = C.ny[i], nz0 = C.nz[i];
        const kind = C.kind[i];
        if (intro) {
          const age = t - C.t0[i];
          if (age < 0) continue;
          if (kind === K_ORN) {
            // ornaments pop out from their center
            const s = easeOutBack(Math.min(1, age / 0.4));
            x = C.ax[i] + (x - C.ax[i]) * s; y = C.ay[i] + (y - C.ay[i]) * s; z = C.az[i] + (z - C.az[i]) * s;
            flash = Math.max(0, 1 - age / FLASH) * 0.5;
          } else if (kind === K_GARLAND || kind === K_LIGHT) {
            flash = Math.max(0, 1 - age / FLASH) * 0.8;
          } else if (kind === K_GIFT) {
            // presents fall from above the frame, tumbling, and the tumble unwinds just as they land
            const p = Math.min(1, age / GIFT_FALL), a = (1 - p) * 2.6;
            const ca = Math.cos(a), sa = Math.sin(a), ly = y - C.ay[i], lz = z - C.az[i];
            y = C.ay[i] + ly * ca - lz * sa + 1.5 * (1 - p * p);
            z = C.az[i] + ly * sa + lz * ca;
            const ny = ny0 * ca - nz0 * sa;
            nz0 = ny0 * sa + nz0 * ca; ny0 = ny;
            const land = age - GIFT_FALL;
            if (land > 0) {
              y += 0.035 * Math.abs(Math.sin(land * 9)) * Math.exp(-land * 6); // a little bounce
              flash = Math.max(0, 1 - land / FLASH) * 0.6;
            }
          } else {
            // needles, trunk and presents settle in with a small drop, white-hot, then cool down
            if (age < 0.25) y += 0.06 * (1 - easeOut(age / 0.25));
            flash = Math.max(0, 1 - age / HOT) ** 1.3;
          }
        }

        const xr = x * cs - z * sn, zr = x * sn + z * cs;
        const zc = this.project(xr, y, zr, o);
        if (zc < 0 || zc >= this.zbuf[o.cell]) continue;

        const nx = nx0 * cs - nz0 * sn, nz = nx0 * sn + nz0 * cs, ny = ny0;
        const lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
        const hl = (lambert * 0.5 + 0.5) ** 1.5; // half-Lambert keeps the shadow side readable
        const depth = clamp(1.1 - (zc - CAM_D) * 1.4, 0.3, 1.25); // fog: the far side of the cone fades into the night
        let r = C.r[i], g = C.g[i], b = C.b[i], ch, glow = false, k;

        if (kind === K_NEEDLE) {
          k = (0.04 + 0.72 * hl) * (0.35 + 0.65 * C.ao[i]) * depth;
          const ramp = NEEDLE_RAMP;
          ch = ramp[clamp(Math.floor(k * ramp.length) + C.aux[i], 0, ramp.length - 1)];
          if (flash > 0.5) ch = 64; // '@' while white-hot
          else if (flash > 0.22) ch = 61; // '=' while cooling
        } else if (kind === K_ORN) {
          const spec = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]) ** 24;
          k = (0.3 + 0.85 * hl) * depth;
          r = r * k + 255 * spec * 0.9; g = g * k + 255 * spec * 0.9; b = b * k + 255 * spec * 0.9;
          ch = spec > 0.45 ? 64 : k > 0.75 ? 35 : k > 0.45 ? 37 : 111; // @ # % o: a solid glossy ball
          glow = k > 0.55;
          k = 1;
        } else if (kind === K_LIGHT) {
          const ph = C.aux[i];
          k = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.5 + (ph * 7.3) % 2.5) + ph));
          k *= lambert > -0.2 ? 1 : 0.4; // bulbs round the back are dimmer
          ch = k > 0.45 ? 111 : 46; // 'o', dimming to '.'
          glow = k > 0.5;
        } else if (kind === K_GARLAND) {
          k = (0.4 + 0.7 * hl) * (0.7 + 0.3 * Math.sin(t * 3 - C.aux[i] * 40)) * depth;
          ch = GARLAND_RAMP[clamp(Math.floor(k * GARLAND_RAMP.length), 0, GARLAND_RAMP.length - 1)];
          glow = k > 0.85;
        } else if (kind === K_GIFT) {
          k = (0.3 + 0.8 * hl) * depth;
          ch = giftGlyph(k, C.aux[i]);
        } else {
          k = (0.3 + 0.7 * hl) * depth;
          ch = hl > 0.5 ? 35 : 124;
        }
        r *= k; g *= k; b *= k;
        if (flash > 0) { r += (255 - r) * flash; g += (255 - g) * flash; b += (255 - b) * flash; }
        this.write(o.cell, zc, ch, r, g, b, glow);
      }

      this.dropPresents(t, dt, cs, sn);
      this.drawStar(t);
      this.drawSnow(t, dt);
      this.drawText(t, intro);
      let n = 0;
      for (let i = 0; i < this.ch.length; i++) if (this.ch[i]) n++;
      this.letters = n;
    }

    drawStar(t) {
      const age = t - this.cloud.starT;
      if (age < 0) return;
      // the star drops onto the top and flashes as it lands
      const p = Math.min(1, age / 0.5);
      const y = Y1 + 0.055 + 0.3 * (1 - easeOut(p));
      const dy = y - CAM_H, dz = CAM_D;
      const yc = dy * CP + dz * SP, zc = -dy * SP + dz * CP;
      const sx = this.ox, sy = this.oy - (this.F * yc) / zc;
      const R = (this.F * 0.09) / zc;
      const pulse = 0.8 + 0.2 * Math.sin(t * 5) + 0.8 * Math.max(0, 1 - age / 0.8);
      const c0 = Math.floor((sx - R - this.gx) / this.cw), c1 = Math.ceil((sx + R - this.gx) / this.cw);
      const r0 = Math.floor((sy - R - this.gy) / this.lh), r1 = Math.ceil((sy + R - this.gy) / this.lh);
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) continue;
          const px = this.gx + (col + 0.5) * this.cw - sx, py = this.gy + (row + 0.5) * this.lh - sy;
          if (!inStar(px / R, py / R)) continue;
          const edge = Math.hypot(px, py) / R > 0.55;
          this.write(row * this.cols + col, -1, edge ? 37 : 35, 255 * pulse, 222 * pulse, 90 * pulse, true);
        }
      }
      if (p < 1) return;
      // rays: a dashed horizontal line, a vertical line through the star, two short diagonals below
      const cr = Math.floor((sy - this.gy) / this.lh), cc = Math.floor((sx - this.gx) / this.cw);
      const rx = Math.ceil(R / this.cw), ry = Math.ceil(R / this.lh);
      const tw = 0.65 + 0.35 * Math.sin(t * 2.2);
      const ray = (row, col, ch, f) => {
        if (row < 0 || col < 0 || row >= this.rows || col >= this.cols || f < 0.08) return;
        this.write(row * this.cols + col, -1, ch, 255 * f, 215 * f, 110 * f, f > 0.35);
      };
      for (let k = rx + 1; k <= rx + 16; k += 2) {
        const f = tw * (1 - (k - rx) / 17);
        ray(cr, cc - k, 45, f);
        ray(cr, cc + k, 45, f);
      }
      for (let k = ry + 1; k <= ry + 5; k++) ray(cr - k, cc, 124, tw * (1 - (k - ry) / 6));
      for (let k = ry + 1; k <= ry + 4; k++) {
        const f = tw * (1 - (k - ry) / 5);
        ray(cr + k, cc, 124, f * 0.7);
        ray(cr + k, cc - (k - ry) * 2, 47, f * 0.8);
        ray(cr + k, cc + (k - ry) * 2, 92, f * 0.8);
      }
    }

    // once the tree is built, presents keep tumbling out of the sky, bounce, rest a while and fade
    dropPresents(t, dt, cs, sn) {
      const { rng } = this, o = {};
      if (!this.reduceMotion && t > this.cloud.introEnd && t >= this.nextDrop && this.presents.length < DROP_MAX) {
        this.nextDrop = t + rng.uniform(0.9, 2.2);
        // land around the tree, clear of the presents already on the floor
        let x = 0, z = 0;
        for (let tries = 0; tries < 6; tries++) {
          const ang = rng.uniform(0, TAU), rad = rng.uniform(0.52, 0.82); // farther out they swing too close to the camera
          x = rad * Math.cos(ang); z = rad * Math.sin(ang);
          if (this.presents.every((P) => Math.hypot(P.x - x, P.z - z) > 0.26)) break;
        }
        const box = this.boxes[Math.floor(rng.random() * this.boxes.length)];
        const style = GIFTS[Math.floor(rng.random() * GIFTS.length)];
        this.presents.push({
          ...box, c: style.c, rb: style.rb, x, z, y: rng.uniform(1.7, 2.2), vy: -rng.uniform(0, 0.2),
          a: rng.uniform(0, TAU), spin: rng.uniform(2, 4) * (rng.random() < 0.5 ? -1 : 1), yaw: rng.uniform(0, TAU),
          hit: -1, a1: 0,
        });
      }

      const QUARTER = TAU / 4;
      for (const P of this.presents) {
        P.vy -= GRAVITY * dt;
        P.y += P.vy * dt;
        if (P.hit < 0) P.a += P.spin * dt;
        else P.a += (P.a1 - P.a) * Math.min(1, dt * 10); // settle onto the nearest flat face
        if (P.y <= P.half) {
          P.y = P.half;
          if (P.hit < 0) { P.hit = t; P.a1 = Math.round(P.a / QUARTER) * QUARTER; }
          P.vy = P.vy < -0.3 ? -P.vy * 0.3 : 0; // bounce, smaller each time, then rest
        }
      }
      this.presents = this.presents.filter((P) => P.hit < 0 || t - P.hit < REST + 1);

      for (const P of this.presents) {
        const fade = P.hit < 0 ? 1 : clamp(REST + 1 - (t - P.hit), 0, 1);
        const flash = P.hit < 0 ? 0 : Math.max(0, 1 - (t - P.hit) / FLASH) * 0.6;
        const ca = Math.cos(P.a), sa = Math.sin(P.a), cy = Math.cos(P.yaw), sy = Math.sin(P.yaw);
        const pts = P.pts;
        for (let j = 0; j < pts.length; j += 7) {
          // tumble about the box's own x axis, turn it to its yaw, then spin with the scene
          const ly = pts[j + 1] * ca - pts[j + 2] * sa, lz = pts[j + 1] * sa + pts[j + 2] * ca;
          const wx = P.x + pts[j] * cy - lz * sy, wz = P.z + pts[j] * sy + lz * cy;
          const zc = this.project(wx * cs - wz * sn, P.y + ly, wx * sn + wz * cs, o);
          if (zc < 0 || zc >= this.zbuf[o.cell]) continue;
          const ny = pts[j + 4] * ca - pts[j + 5] * sa, nzl = pts[j + 4] * sa + pts[j + 5] * ca;
          const nwx = pts[j + 3] * cy - nzl * sy, nwz = pts[j + 3] * sy + nzl * cy;
          const nx = nwx * cs - nwz * sn, nz = nwx * sn + nwz * cs;
          const lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
          const hl = (lambert * 0.5 + 0.5) ** 1.5;
          const depth = clamp(1.1 - (zc - CAM_D) * 1.4, 0.3, 1.25);
          const k = (0.3 + 0.8 * hl) * depth;
          const ribbon = pts[j + 6], rgb = ribbon ? P.rb : P.c;
          let r = rgb[0] * k * fade, g = rgb[1] * k * fade, b = rgb[2] * k * fade;
          if (flash > 0) { r += (255 - r) * flash; g += (255 - g) * flash; b += (255 - b) * flash; }
          this.write(o.cell, zc, giftGlyph(k, ribbon), r, g, b, ribbon && P.hit < 0);
        }
      }
    }

    drawSnow(t, dt) {
      const { rng } = this, o = {};
      for (const f of this.snow) {
        f.y -= f.vy * dt;
        f.x += (0.06 + Math.sin(t * 1.3 + f.phase) * 0.12) * dt; // light wind plus a sway
        if (f.y < 0) { f.y = 1.9; f.x = rng.uniform(-2.5, 2.5); f.z = rng.uniform(-1.9, 3); }
        const zc = this.project(f.x, f.y, f.z, o);
        if (zc < 0) continue;
        const s = clamp(1.7 - zc / 3.5, 0.4, 1);
        const near = zc < 1.7;
        this.write(o.cell, zc, near ? 42 : zc < 2.8 ? 43 : 46, 235 * s, 240 * s, 255 * s, near);
        // flakes passing close to the camera are big: ".*." spread over three cells
        if (near && o.cell % this.cols > 0 && o.cell % this.cols < this.cols - 1) {
          for (const side of [o.cell - 1, o.cell + 1]) this.write(side, zc, 46, 180 * s, 190 * s, 210 * s, false);
        }
      }
    }

    drawText(t, intro) {
      const row = this.rows - 2, x0 = Math.floor(this.cols / 2) - (MESSAGE.length >> 1);
      const TEXT_RGB = [[255, 80, 80], [255, 210, 90], [110, 230, 120], [240, 240, 255]];
      const shift = Math.floor(t * 3);
      let n = 0;
      for (let k = 0; k < MESSAGE.length; k++) {
        const col = x0 + k;
        if (MESSAGE[k] === " " || col < 0 || col >= this.cols) continue;
        const age = t - this.cloud.textT[k];
        n++;
        if (intro && age < 0) continue;
        const base = TEXT_RGB[(n + shift) % TEXT_RGB.length];
        const s = 0.8 + 0.2 * Math.sin(t * 4 - n * 0.5);
        const f = intro ? clamp(1 - age / FLASH, 0, 1) : 0; // each letter flashes as it lands
        const cell = row * this.cols + col;
        this.zbuf[cell] = Infinity;
        this.write(cell, -1, MESSAGE.charCodeAt(k), ...base.map((c) => c * s + (255 - c * s) * f), true);
      }
    }
  }

  // five-pointed star in unit coordinates (y down), tip pointing up
  const STAR_POLY = Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 0.45 : 1;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  function inStar(x, y) {
    let inside = false;
    for (let i = 0, j = STAR_POLY.length - 1; i < STAR_POLY.length; j = i++) {
      const [xi, yi] = STAR_POLY[i], [xj, yj] = STAR_POLY[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  // ---- carols: public-domain tunes played on a tiny Web Audio music box ---------

  // "note:beats" tokens, "-" is a rest; chords are a root plus an optional "m"
  const SONGS = [
    {
      title: "Jingle Bells", bpm: 152, bells: true,
      melody:
        "E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4 " +
        "F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 E5:1 D5:1 D5:1 E5:1 D5:2 G5:2 " +
        "E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4 " +
        "F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 G5:1 G5:1 F5:1 D5:1 C5:4",
      chords: "C:4 C:4 C:4 C:4 F:4 C:4 G:4 G:4 C:4 C:4 C:4 C:4 F:4 C:4 G:4 C:4",
    },
    {
      title: "We Wish You a Merry Christmas", bpm: 138, bells: false,
      melody:
        "D5:1 G5:1 G5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1 E5:1 E5:1 A5:1 A5:0.5 B5:0.5 A5:0.5 G5:0.5 F#5:1 D5:1 D5:1 " +
        "B5:1 B5:0.5 C6:0.5 B5:0.5 A5:0.5 G5:1 E5:1 D5:0.5 D5:0.5 E5:1 A5:1 F#5:1 G5:2 -:1",
      chords: "-:1 G:3 C:3 A:3 D:3 B:3 Em:3 C:1 D:2 G:3",
    },
  ];
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const tokens = (str) => str.trim().split(/\s+/).map((tok) => { const [n, d] = tok.split(":"); return [n, Number(d)]; });
  const midiOf = (name) => { // "F#5" -> 78
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    return (Number(m[3]) + 1) * 12 + NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  };
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

  class CarolPlayer {
    constructor() { this.ctx = null; this.on = false; this.song = -1; this.end = 0; this.onSong = null; this.muted = false; this.timer = 0; }

    start() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        const ctx = (this.ctx = new AC());
        this.master = ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.55;
        // a little hall reverb from a decaying noise impulse
        const verb = ctx.createConvolver(), wet = ctx.createGain();
        verb.buffer = this.impulse(2.4);
        wet.gain.value = 0.3;
        this.master.connect(ctx.destination);
        this.master.connect(verb).connect(wet).connect(ctx.destination);
        this.noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        if (!this.timer) this.timer = setInterval(() => this.tick(), 250);
      }
      // suspend/resume pauses the audio clock itself, so a song picks up where it stopped
      this.ctx.resume();
      this.on = true;
      this.tick();
      return true;
    }

    stop() {
      this.on = false;
      if (this.ctx) this.ctx.suspend();
    }

    // every note of a song is scheduled up front, so jumping songs closes that context and starts a fresh one
    skip(step) {
      if (this.ctx) this.ctx.close();
      this.ctx = null;
      this.end = 0;
      this.song = (this.song + step - 1 + 2 * SONGS.length) % SONGS.length; // tick() advances one more
      return this.start();
    }

    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.value = m ? 0 : 0.55;
    }

    tick() {
      if (!this.on || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      if (now < this.end - 0.6) return;
      this.song = (this.song + 1) % SONGS.length;
      this.end = this.schedule(SONGS[this.song], Math.max(now + 0.1, this.end ? this.end + 1.2 : 0)); // a breath between songs
      if (this.onSong) this.onSong();
    }

    schedule(song, t0) {
      const spb = 60 / song.bpm;
      let t = t0;
      for (const [n, beats] of tokens(song.melody)) {
        if (n !== "-") this.bell(hz(midiOf(n)), t, beats * spb);
        t += beats * spb;
      }
      let tc = t0;
      for (const [c, beats] of tokens(song.chords)) {
        if (c !== "-") {
          const root = midiOf(c.replace("m", "") + "3");
          this.pad([root - 12, root, root + (c.endsWith("m") ? 3 : 4), root + 7], tc, beats * spb);
        }
        tc += beats * spb;
      }
      if (song.bells) for (let b = 0; t0 + b * spb < t; b++) this.jingle(t0 + b * spb, b % 2 ? 0.5 : 1);
      return t;
    }

    // music-box tine: a sine with a brief bright overtone, struck and left to ring
    bell(f, t, dur) {
      const { ctx } = this, ring = Math.max(0.7, dur * 1.8);
      const body = ctx.createOscillator(), tine = ctx.createOscillator();
      const g = ctx.createGain(), gt = ctx.createGain();
      body.frequency.value = f;
      tine.frequency.value = f * 3;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.24, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ring);
      gt.gain.setValueAtTime(0.25, t);
      gt.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      body.connect(g);
      tine.connect(gt).connect(g);
      g.connect(this.master);
      for (const o of [body, tine]) { o.start(t); o.stop(t + ring + 0.05); }
    }

    // soft triangle chord underneath, with the root an octave down as a bass
    pad(midis, t, dur) {
      const { ctx } = this;
      midis.forEach((m, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), peak = k === 0 ? 0.07 : 0.03;
        o.type = k === 0 ? "sine" : "triangle";
        o.frequency.value = hz(m);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.06);
        g.gain.setValueAtTime(peak, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.master);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    }

    // sleigh bells: a short burst of high-passed noise on every beat
    jingle(t, v) {
      const { ctx } = this;
      const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = this.noise;
      hp.type = "highpass";
      hp.frequency.value = 7000;
      g.gain.setValueAtTime(0.09 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      src.connect(hp).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 0.16);
    }

    impulse(sec) {
      const { ctx } = this, n = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
      }
      return buf;
    }
  }

  // ---- page -------------------------------------------------------------------

  const canvas = document.getElementById("tree");
  const ctx = canvas.getContext("2d");
  const ui = {
    rotation: document.getElementById("rotation"),
    letters: document.getElementById("letters"),
    dot: document.getElementById("dot"),
    status: document.getElementById("status"),
    notice: document.getElementById("notice"),
  };
  const params = new URLSearchParams(location.search);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seed = Number(params.get("seed")) || Math.floor(Math.random() * 2 ** 31);
  const introSpeed = reduceMotion ? 0 : Number(params.get("speed")) || 1;

  let view = null, cloud = null, t0 = 0, last = 0, lastDraw = 0, fps = FPS, lastUi = 0;
  let theta = 0, spin = reduceMotion ? 0.12 : SPIN, drag = null;

  function measure() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
    // small glyphs read as texture; aim for ~58 rows
    let fs = clamp(cssH / 58, 7, 14);
    fs = Math.min(fs, cssW / (MIN_COLS * 0.62), cssH / (MIN_ROWS * 1.18));
    ctx.font = `${fs}px ${FONT}`;
    const cw = ctx.measureText("M").width, lh = fs * 1.18;
    const cols = Math.floor(cssW / cw), rows = Math.floor(cssH / lh);
    return { dpr, cssW, cssH, fs, cw, lh, cols, rows, gx: (cssW - cols * cw) / 2, gy: (cssH - rows * lh) / 2, reduceMotion };
  }

  function build(withIntro) {
    const layout = measure();
    canvas.width = Math.round(layout.cssW * layout.dpr);
    canvas.height = Math.round(layout.cssH * layout.dpr);
    if (layout.cols < MIN_COLS || layout.rows < MIN_ROWS || layout.fs < 5) {
      view = null;
      ui.notice.hidden = false;
      return;
    }
    ui.notice.hidden = true;
    const rng = makeRng(seed);
    cloud = buildCloud(rng, withIntro ? introSpeed : 0);
    view = new Renderer(layout, cloud, rng);
    t0 = last = performance.now() / 1000;
  }

  function draw() {
    const { dpr, cssW, cssH, fs, cw, lh, gx, gy, cols } = view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.font = `${fs}px ${FONT}`;
    ctx.textBaseline = "top";
    const { ch, rgb, glow } = view;
    const color = (i) => `rgb(${clamp(rgb[i * 3] | 0, 0, 255)},${clamp(rgb[i * 3 + 1] | 0, 0, 255)},${clamp(rgb[i * 3 + 2] | 0, 0, 255)})`;
    for (let i = 0; i < ch.length; i++) {
      if (!ch[i]) continue;
      ctx.fillStyle = color(i);
      ctx.fillText(CHAR[ch[i]], gx + (i % cols) * cw, gy + Math.floor(i / cols) * lh);
    }
    // a real bloom on bulbs, the star and the greeting
    ctx.shadowBlur = fs * 1.1;
    for (let i = 0; i < ch.length; i++) {
      if (!glow[i] || !ch[i]) continue;
      ctx.fillStyle = ctx.shadowColor = color(i);
      ctx.fillText(CHAR[ch[i]], gx + (i % cols) * cw, gy + Math.floor(i / cols) * lh);
    }
    ctx.shadowBlur = 0;
  }

  function frame(nowMs) {
    requestAnimationFrame(frame);
    if (nowMs - lastDraw < 1000 / FPS - 2) return;
    lastDraw = nowMs;
    const now = nowMs / 1000, dt = Math.min(0.1, now - last);
    if (!view) { last = now; return; }
    if (!drag) {
      // after a flick, ease back to the turntable speed
      const base = reduceMotion ? 0.12 : SPIN;
      spin += (base - spin) * Math.min(1, dt * 1.5);
      theta += spin * dt;
    }
    view.frame(now - t0, dt, theta);
    if (now > last) fps = 0.9 * fps + 0.1 / (now - last);
    last = now;
    draw();
    if (nowMs - lastUi > 200) {
      lastUi = nowMs;
      let stage = null;
      if (now - t0 < cloud.introEnd) for (const [s, l] of cloud.stages) if (s <= now - t0) stage = l;
      ui.dot.classList.toggle("building", stage !== null);
      ui.status.textContent = stage ? `building · ${stage}` : `running · ${Math.round(fps)} fps`;
      ui.rotation.textContent = `rotation ${(((theta * 180) / Math.PI) % 360 + 360) % 360 < 100 ? " " : ""}${((((theta * 180) / Math.PI) % 360) + 360) % 360 >= 0 ? ((((theta * 180) / Math.PI) % 360) + 360) % 360 : 0}`.replace(/(\.\d)\d+/, "$1") + "°";
      ui.letters.textContent = `letters ${view.letters.toLocaleString("en-US")}`;
    }
  }

  // drag to spin the tree; a flick keeps it spinning for a moment
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, t: performance.now(), v: 0 };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const now = performance.now(), d = (e.clientX - drag.x) * 0.008;
    theta -= d;
    drag.v = -d / Math.max(0.016, (now - drag.t) / 1000);
    drag.x = e.clientX;
    drag.t = now;
  });
  const endDrag = () => {
    if (!drag) return;
    spin = clamp(drag.v, -6, 6);
    drag = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  const replay = () => build(true);
  document.getElementById("replay").addEventListener("click", replay);
  // the recorded track (Pixabay license) loops; the music-box carols take over if it cannot play
  const TRACK = { src: "carol.mp3", title: "Christmas Jazz" };
  const track = new Audio(TRACK.src);
  track.loop = true;
  track.preload = "auto"; // fetch with the page so the first click plays right away
  track.volume = 0.7;
  const carols = new CarolPlayer();
  const musicBtn = document.getElementById("music");
  const $ = (id) => document.getElementById(id);
  const player = $("player"), pill = $("unfold"), menu = $("menu"), moreBtn = $("more"), seek = $("seek");
  const fmtTime = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "-:--");
  // per-viewer conveniences only; the page works the same when storage is blocked
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  let useSynth = false, waitingForGesture = false, scrubbing = false;
  const syncTime = () => {
    if (useSynth) {
      $("timeCur").textContent = `${Math.max(0, carols.song) + 1} / ${SONGS.length}`;
      $("timeDur").textContent = "오르골";
      seek.value = 0;
      seek.style.setProperty("--p", "0%");
      return;
    }
    const d = track.duration, p = d > 0 ? clamp(track.currentTime / d, 0, 1) : 0;
    $("timeCur").textContent = fmtTime(track.currentTime);
    $("timeDur").textContent = fmtTime(d);
    if (!scrubbing) seek.value = Math.round(p * 1000);
    seek.style.setProperty("--p", `${(seek.value / 10).toFixed(1)}%`);
  };
  const syncMusic = () => {
    const on = useSynth ? carols.on : !track.paused;
    const title = useSynth ? SONGS[Math.max(0, carols.song)].title : TRACK.title;
    const loading = on && !useSynth && track.readyState < 3; // HAVE_FUTURE_DATA: sound is actually coming
    player.classList.toggle("is-playing", on);
    player.classList.toggle("is-loading", loading);
    pill.classList.toggle("is-playing", on);
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "일시정지 (M)" : "재생 (M)");
    $("songTitle").textContent = $("pillTitle").textContent = title;
    $("songArtist").textContent = loading ? "불러오는 중…"
      : waitingForGesture && !on ? "화면을 누르면 캐롤이 나와요"
      : useSynth ? "Music box · 오르골 캐롤" : "Tunetank · Pixabay";
    $("prev").setAttribute("aria-label", useSynth ? "이전 곡" : "10초 뒤로");
    $("next").setAttribute("aria-label", useSynth ? "다음 곡" : "10초 앞으로");
    $("switchSource").textContent = useSynth ? "Christmas Jazz로 바꾸기" : "오르골 캐롤로 바꾸기";
    seek.disabled = useSynth;
    syncTime();
  };
  carols.onSong = syncMusic;
  for (const ev of ["play", "playing", "waiting", "canplay", "pause"]) track.addEventListener(ev, syncMusic);
  const startSynth = () => {
    useSynth = true;
    if (carols.start()) syncMusic();
    else $("songArtist").textContent = "이 브라우저는 소리를 지원하지 않아요";
  };
  // the file could not be fetched or decoded: switch to the music box, and keep playing if asked to
  track.addEventListener("error", () => {
    const wanted = !track.paused;
    useSynth = true;
    if (wanted) startSynth();
    else syncMusic();
  });
  const startMusic = () => {
    if (useSynth) { if (!carols.on) startSynth(); return; }
    track.play().catch((err) => {
      // autoplay blocked: the browser wants a click or key first; any other failure falls back to the music box
      if (err && err.name === "NotAllowedError") armGesture();
      else startSynth();
    });
  };
  // keydown, pointerdown (mouse) and pointerup/touchend (touch) are the events that count as user activation
  const GESTURES = ["keydown", "pointerdown", "pointerup", "touchend"];
  const onGesture = (e) => {
    disarmGesture();
    // the play button and the M key start the music themselves; starting it here too would toggle it straight off
    if (musicBtn.contains(e.target) || e.key === "m" || e.key === "M") return;
    startMusic();
  };
  const disarmGesture = () => {
    waitingForGesture = false;
    for (const ev of GESTURES) window.removeEventListener(ev, onGesture, true);
  };
  const armGesture = () => {
    if (waitingForGesture) return;
    waitingForGesture = true;
    for (const ev of GESTURES) window.addEventListener(ev, onGesture, true);
    syncMusic();
  };
  const toggleMusic = () => {
    if (useSynth) {
      if (carols.on) { carols.stop(); syncMusic(); } else startSynth();
    } else if (!track.paused) {
      track.pause();
    } else {
      startMusic();
    }
  };
  musicBtn.addEventListener("click", toggleMusic);
  for (const ev of ["timeupdate", "loadedmetadata", "durationchange"]) track.addEventListener(ev, syncTime);
  seek.addEventListener("input", () => {
    scrubbing = true;
    if (track.duration > 0) track.currentTime = (seek.value / 1000) * track.duration;
    syncTime();
  });
  seek.addEventListener("change", () => { scrubbing = false; });

  // rewind / fast-forward: 10 s in the recording, a whole song in the music box
  const skip = (step) => {
    if (useSynth) {
      if (carols.skip(step)) syncMusic();
    } else if (track.duration > 0) {
      track.currentTime = clamp(track.currentTime + step * 10, 0, track.duration - 0.25);
      syncTime();
    }
  };
  $("prev").addEventListener("click", () => skip(-1));
  $("next").addEventListener("click", () => skip(1));

  const setMuted = (m) => {
    track.muted = m;
    carols.setMuted(m);
    player.classList.toggle("is-muted", m);
    $("volume").setAttribute("aria-pressed", String(m));
    $("volume").setAttribute("aria-label", m ? "소리 켜기" : "음소거");
  };
  $("volume").addEventListener("click", () => setMuted(!track.muted));

  const setLiked = (v) => {
    $("like").setAttribute("aria-pressed", String(v));
    $("like").setAttribute("aria-label", v ? "좋아요 취소" : "좋아요");
    store.set("tree3d-liked", v ? "1" : null);
  };
  $("like").addEventListener("click", () => setLiked($("like").getAttribute("aria-pressed") !== "true"));
  setLiked(store.get("tree3d-liked") === "1");

  // the ⋯ menu: switch between the recording and the music box, or fold the card away
  const setMenu = (open) => {
    menu.hidden = !open;
    moreBtn.setAttribute("aria-expanded", String(open));
  };
  moreBtn.addEventListener("click", (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  window.addEventListener("click", (e) => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
  $("switchSource").addEventListener("click", () => {
    setMenu(false);
    const wasOn = useSynth ? carols.on : !track.paused;
    if (useSynth) carols.stop(); else track.pause();
    useSynth = !useSynth;
    if (wasOn) startMusic(); else syncMusic();
  });
  const setFolded = (folded, focus) => {
    player.hidden = folded;
    pill.hidden = !folded;
    store.set("tree3d-player-folded", folded ? "1" : null);
    if (focus) (folded ? pill : moreBtn).focus();
  };
  $("fold").addEventListener("click", () => { setMenu(false); setFolded(true, true); });
  pill.addEventListener("click", () => setFolded(false, true));
  setFolded(store.get("tree3d-player-folded") === "1", false);

  // start gate: browsers only allow sound after a tap or key, so that first tap starts the music and the build together
  const gate = $("gate");
  let openGate;
  const gateOpened = new Promise((r) => { openGate = r; });
  const start = () => {
    if (gate.hidden) return;
    gate.hidden = true;
    startMusic(); // still inside the gesture, so play() is allowed
    openGate();
  };
  gate.addEventListener("click", start);
  $("start").focus({ focusVisible: false }); // Enter or Space works at once, without a ring flashing for mouse users

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey) return;
    if (!gate.hidden) { if (!e.repeat && e.key !== "Tab") { e.preventDefault(); start(); } return; }
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); moreBtn.focus(); return; }
    if (e.key === "m" || e.key === "M") toggleMusic();
    if (e.key === "r" || e.key === "R") replay();
  });

  // a resize redraws the finished tree instead of replaying the whole build
  let resizeTimer = 0, observedOnce = false;
  new ResizeObserver(() => {
    if (!observedOnce) { observedOnce = true; return; }
    if (!gate.hidden) return; // the first build waits for the gate
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // mid-build (e.g. a phone's address bar sliding away), resume the intro where it was instead of restarting it
      const elapsed = performance.now() / 1000 - t0;
      const building = view && cloud && elapsed < cloud.introEnd;
      build(!view || building);
      if (building) t0 -= elapsed;
    }, 150);
  }).observe(canvas);

  const fontReady = document.fonts ? document.fonts.load(`16px "IBM Plex Mono"`).catch(() => {}) : Promise.resolve();
  Promise.all([Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]), gateOpened]).then(() => {
    build(true);
    requestAnimationFrame(frame);
  });
})();
