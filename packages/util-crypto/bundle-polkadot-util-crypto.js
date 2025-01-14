const polkadotUtilCrypto = (function (exports, util) {
  'use strict';

  const global = window;

  function evaluateThis(fn) {
    return fn('return this');
  }
  const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : evaluateThis(Function);
  function exposeGlobal(name, fallback) {
    if (typeof xglobal[name] === 'undefined') {
      xglobal[name] = fallback;
    }
  }

  const BigInt$1 = typeof xglobal.BigInt === 'function' && typeof xglobal.BigInt.asIntN === 'function' ? xglobal.BigInt : () => Number.NaN;

  exposeGlobal('BigInt', BigInt$1);

  const crypto$1 = {};

  const crypto$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': crypto$1
  });

  /*! noble-secp256k1 - MIT License (c) Paul Miller (paulmillr.com) */
  const _0n$1 = BigInt(0);
  const _1n$1 = BigInt(1);
  const _2n$1 = BigInt(2);
  const _3n = BigInt(3);
  const _8n = BigInt(8);
  const POW_2_256 = _2n$1 ** BigInt(256);
  const CURVE = {
      a: _0n$1,
      b: BigInt(7),
      P: POW_2_256 - _2n$1 ** BigInt(32) - BigInt(977),
      n: POW_2_256 - BigInt('432420386565659656852420866394968145599'),
      h: _1n$1,
      Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
      Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
      beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
  };
  function weistrass(x) {
      const { a, b } = CURVE;
      return mod(x ** _3n + a * x + b);
  }
  const USE_ENDOMORPHISM = CURVE.a === _0n$1;
  class JacobianPoint {
      constructor(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
      }
      static fromAffine(p) {
          if (!(p instanceof Point)) {
              throw new TypeError('JacobianPoint#fromAffine: expected Point');
          }
          return new JacobianPoint(p.x, p.y, _1n$1);
      }
      static toAffineBatch(points) {
          const toInv = invertBatch(points.map((p) => p.z));
          return points.map((p, i) => p.toAffine(toInv[i]));
      }
      static normalizeZ(points) {
          return JacobianPoint.toAffineBatch(points).map(JacobianPoint.fromAffine);
      }
      equals(other) {
          const a = this;
          const b = other;
          const az2 = mod(a.z * a.z);
          const az3 = mod(a.z * az2);
          const bz2 = mod(b.z * b.z);
          const bz3 = mod(b.z * bz2);
          return mod(a.x * bz2) === mod(az2 * b.x) && mod(a.y * bz3) === mod(az3 * b.y);
      }
      negate() {
          return new JacobianPoint(this.x, mod(-this.y), this.z);
      }
      double() {
          const X1 = this.x;
          const Y1 = this.y;
          const Z1 = this.z;
          const A = mod(X1 ** _2n$1);
          const B = mod(Y1 ** _2n$1);
          const C = mod(B ** _2n$1);
          const D = mod(_2n$1 * (mod(mod((X1 + B) ** _2n$1)) - A - C));
          const E = mod(_3n * A);
          const F = mod(E ** _2n$1);
          const X3 = mod(F - _2n$1 * D);
          const Y3 = mod(E * (D - X3) - _8n * C);
          const Z3 = mod(_2n$1 * Y1 * Z1);
          return new JacobianPoint(X3, Y3, Z3);
      }
      add(other) {
          if (!(other instanceof JacobianPoint)) {
              throw new TypeError('JacobianPoint#add: expected JacobianPoint');
          }
          const X1 = this.x;
          const Y1 = this.y;
          const Z1 = this.z;
          const X2 = other.x;
          const Y2 = other.y;
          const Z2 = other.z;
          if (X2 === _0n$1 || Y2 === _0n$1)
              return this;
          if (X1 === _0n$1 || Y1 === _0n$1)
              return other;
          const Z1Z1 = mod(Z1 ** _2n$1);
          const Z2Z2 = mod(Z2 ** _2n$1);
          const U1 = mod(X1 * Z2Z2);
          const U2 = mod(X2 * Z1Z1);
          const S1 = mod(Y1 * Z2 * Z2Z2);
          const S2 = mod(mod(Y2 * Z1) * Z1Z1);
          const H = mod(U2 - U1);
          const r = mod(S2 - S1);
          if (H === _0n$1) {
              if (r === _0n$1) {
                  return this.double();
              }
              else {
                  return JacobianPoint.ZERO;
              }
          }
          const HH = mod(H ** _2n$1);
          const HHH = mod(H * HH);
          const V = mod(U1 * HH);
          const X3 = mod(r ** _2n$1 - HHH - _2n$1 * V);
          const Y3 = mod(r * (V - X3) - S1 * HHH);
          const Z3 = mod(Z1 * Z2 * H);
          return new JacobianPoint(X3, Y3, Z3);
      }
      subtract(other) {
          return this.add(other.negate());
      }
      multiplyUnsafe(scalar) {
          let n = normalizeScalar(scalar);
          if (!USE_ENDOMORPHISM) {
              let p = JacobianPoint.ZERO;
              let d = this;
              while (n > _0n$1) {
                  if (n & _1n$1)
                      p = p.add(d);
                  d = d.double();
                  n >>= _1n$1;
              }
              return p;
          }
          let { k1neg, k1, k2neg, k2 } = splitScalarEndo(n);
          let k1p = JacobianPoint.ZERO;
          let k2p = JacobianPoint.ZERO;
          let d = this;
          while (k1 > _0n$1 || k2 > _0n$1) {
              if (k1 & _1n$1)
                  k1p = k1p.add(d);
              if (k2 & _1n$1)
                  k2p = k2p.add(d);
              d = d.double();
              k1 >>= _1n$1;
              k2 >>= _1n$1;
          }
          if (k1neg)
              k1p = k1p.negate();
          if (k2neg)
              k2p = k2p.negate();
          k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
          return k1p.add(k2p);
      }
      precomputeWindow(W) {
          const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
          let points = [];
          let p = this;
          let base = p;
          for (let window = 0; window < windows; window++) {
              base = p;
              points.push(base);
              for (let i = 1; i < 2 ** (W - 1); i++) {
                  base = base.add(p);
                  points.push(base);
              }
              p = base.double();
          }
          return points;
      }
      wNAF(n, affinePoint) {
          if (!affinePoint && this.equals(JacobianPoint.BASE))
              affinePoint = Point.BASE;
          const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
          if (256 % W) {
              throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
          }
          let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
          if (!precomputes) {
              precomputes = this.precomputeWindow(W);
              if (affinePoint && W !== 1) {
                  precomputes = JacobianPoint.normalizeZ(precomputes);
                  pointPrecomputes.set(affinePoint, precomputes);
              }
          }
          let p = JacobianPoint.ZERO;
          let f = JacobianPoint.ZERO;
          const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
          const windowSize = 2 ** (W - 1);
          const mask = BigInt(2 ** W - 1);
          const maxNumber = 2 ** W;
          const shiftBy = BigInt(W);
          for (let window = 0; window < windows; window++) {
              const offset = window * windowSize;
              let wbits = Number(n & mask);
              n >>= shiftBy;
              if (wbits > windowSize) {
                  wbits -= maxNumber;
                  n += _1n$1;
              }
              if (wbits === 0) {
                  let pr = precomputes[offset];
                  if (window % 2)
                      pr = pr.negate();
                  f = f.add(pr);
              }
              else {
                  let cached = precomputes[offset + Math.abs(wbits) - 1];
                  if (wbits < 0)
                      cached = cached.negate();
                  p = p.add(cached);
              }
          }
          return { p, f };
      }
      multiply(scalar, affinePoint) {
          let n = normalizeScalar(scalar);
          let point;
          let fake;
          if (USE_ENDOMORPHISM) {
              let { k1neg, k1, k2neg, k2 } = splitScalarEndo(n);
              let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
              let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
              if (k1neg)
                  k1p = k1p.negate();
              if (k2neg)
                  k2p = k2p.negate();
              k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
              point = k1p.add(k2p);
              fake = f1p.add(f2p);
          }
          else {
              let { p, f } = this.wNAF(n, affinePoint);
              point = p;
              fake = f;
          }
          return JacobianPoint.normalizeZ([point, fake])[0];
      }
      toAffine(invZ = invert(this.z)) {
          const invZ2 = invZ ** _2n$1;
          const x = mod(this.x * invZ2);
          const y = mod(this.y * invZ2 * invZ);
          return new Point(x, y);
      }
  }
  JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1n$1);
  JacobianPoint.ZERO = new JacobianPoint(_0n$1, _1n$1, _0n$1);
  const pointPrecomputes = new WeakMap();
  class Point {
      constructor(x, y) {
          this.x = x;
          this.y = y;
      }
      _setWindowSize(windowSize) {
          this._WINDOW_SIZE = windowSize;
          pointPrecomputes.delete(this);
      }
      static fromCompressedHex(bytes) {
          const isShort = bytes.length === 32;
          const x = bytesToNumber(isShort ? bytes : bytes.slice(1));
          const y2 = weistrass(x);
          let y = sqrtMod(y2);
          const isYOdd = (y & _1n$1) === _1n$1;
          if (isShort) {
              if (isYOdd)
                  y = mod(-y);
          }
          else {
              const isFirstByteOdd = (bytes[0] & 1) === 1;
              if (isFirstByteOdd !== isYOdd)
                  y = mod(-y);
          }
          const point = new Point(x, y);
          point.assertValidity();
          return point;
      }
      static fromUncompressedHex(bytes) {
          const x = bytesToNumber(bytes.slice(1, 33));
          const y = bytesToNumber(bytes.slice(33));
          const point = new Point(x, y);
          point.assertValidity();
          return point;
      }
      static fromHex(hex) {
          const bytes = ensureBytes(hex);
          const header = bytes[0];
          if (bytes.length === 32 || (bytes.length === 33 && (header === 0x02 || header === 0x03))) {
              return this.fromCompressedHex(bytes);
          }
          if (bytes.length === 65 && header === 0x04)
              return this.fromUncompressedHex(bytes);
          throw new Error(`Point.fromHex: received invalid point. Expected 32-33 compressed bytes or 65 uncompressed bytes, not ${bytes.length}`);
      }
      static fromPrivateKey(privateKey) {
          return Point.BASE.multiply(normalizePrivateKey(privateKey));
      }
      static fromSignature(msgHash, signature, recovery) {
          let h = msgHash instanceof Uint8Array ? bytesToNumber(msgHash) : hexToNumber(msgHash);
          const sig = normalizeSignature(signature);
          const { r, s } = sig;
          if (recovery !== 0 && recovery !== 1) {
              throw new Error('Cannot recover signature: invalid yParity bit');
          }
          const prefix = 2 + (recovery & 1);
          const P_ = Point.fromHex(`0${prefix}${pad64(r)}`);
          const sP = JacobianPoint.fromAffine(P_).multiplyUnsafe(s);
          const hG = JacobianPoint.BASE.multiply(h);
          const rinv = invert(r, CURVE.n);
          const Q = sP.subtract(hG).multiplyUnsafe(rinv);
          const point = Q.toAffine();
          point.assertValidity();
          return point;
      }
      toRawBytes(isCompressed = false) {
          return hexToBytes(this.toHex(isCompressed));
      }
      toHex(isCompressed = false) {
          const x = pad64(this.x);
          if (isCompressed) {
              return `${this.y & _1n$1 ? '03' : '02'}${x}`;
          }
          else {
              return `04${x}${pad64(this.y)}`;
          }
      }
      toHexX() {
          return this.toHex(true).slice(2);
      }
      toRawX() {
          return this.toRawBytes(true).slice(1);
      }
      assertValidity() {
          const msg = 'Point is not on elliptic curve';
          const { P } = CURVE;
          const { x, y } = this;
          if (x === _0n$1 || y === _0n$1 || x >= P || y >= P)
              throw new Error(msg);
          const left = mod(y * y);
          const right = weistrass(x);
          if ((left - right) % P !== _0n$1)
              throw new Error(msg);
      }
      equals(other) {
          return this.x === other.x && this.y === other.y;
      }
      negate() {
          return new Point(this.x, mod(-this.y));
      }
      double() {
          return JacobianPoint.fromAffine(this).double().toAffine();
      }
      add(other) {
          return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
      }
      subtract(other) {
          return this.add(other.negate());
      }
      multiply(scalar) {
          return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
      }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
  Point.ZERO = new Point(_0n$1, _0n$1);
  function sliceDer(s) {
      return Number.parseInt(s[0], 16) >= 8 ? '00' + s : s;
  }
  class Signature {
      constructor(r, s) {
          this.r = r;
          this.s = s;
      }
      static fromCompact(hex) {
          if (typeof hex !== 'string' && !(hex instanceof Uint8Array)) {
              throw new TypeError(`Signature.fromCompact: Expected string or Uint8Array`);
          }
          const str = hex instanceof Uint8Array ? bytesToHex(hex) : hex;
          if (str.length !== 128)
              throw new Error('Signature.fromCompact: Expected 64-byte hex');
          const sig = new Signature(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
          sig.assertValidity();
          return sig;
      }
      static fromDER(hex) {
          const fn = 'Signature.fromDER';
          if (typeof hex !== 'string' && !(hex instanceof Uint8Array)) {
              throw new TypeError(`${fn}: Expected string or Uint8Array`);
          }
          const str = hex instanceof Uint8Array ? bytesToHex(hex) : hex;
          const length = parseByte(str.slice(2, 4));
          if (str.slice(0, 2) !== '30' || length !== str.length - 4 || str.slice(4, 6) !== '02') {
              throw new Error(`${fn}: Invalid signature ${str}`);
          }
          const rLen = parseByte(str.slice(6, 8));
          const rEnd = 8 + rLen;
          const rr = str.slice(8, rEnd);
          if (rr.startsWith('00') && parseByte(rr.slice(2, 4)) <= 0x7f) {
              throw new Error(`${fn}: Invalid r with trailing length`);
          }
          const r = hexToNumber(rr);
          const separator = str.slice(rEnd, rEnd + 2);
          if (separator !== '02') {
              throw new Error(`${fn}: Invalid r-s separator`);
          }
          const sLen = parseByte(str.slice(rEnd + 2, rEnd + 4));
          const diff = length - sLen - rLen - 10;
          if (diff > 0 || diff === -4) {
              throw new Error(`${fn}: Invalid total length`);
          }
          if (sLen > length - rLen - 4) {
              throw new Error(`${fn}: Invalid s`);
          }
          const sStart = rEnd + 4;
          const ss = str.slice(sStart, sStart + sLen);
          if (ss.startsWith('00') && parseByte(ss.slice(2, 4)) <= 0x7f) {
              throw new Error(`${fn}: Invalid s with trailing length`);
          }
          const s = hexToNumber(ss);
          const sig = new Signature(r, s);
          sig.assertValidity();
          return sig;
      }
      static fromHex(hex) {
          return this.fromDER(hex);
      }
      assertValidity() {
          const { r, s } = this;
          if (!isWithinCurveOrder(r))
              throw new Error('Invalid Signature: r must be 0 < r < n');
          if (!isWithinCurveOrder(s))
              throw new Error('Invalid Signature: s must be 0 < s < n');
      }
      toDERRawBytes(isCompressed = false) {
          return hexToBytes(this.toDERHex(isCompressed));
      }
      toDERHex(isCompressed = false) {
          const sHex = sliceDer(numberToHex(this.s));
          if (isCompressed)
              return sHex;
          const rHex = sliceDer(numberToHex(this.r));
          const rLen = numberToHex(rHex.length / 2);
          const sLen = numberToHex(sHex.length / 2);
          const length = numberToHex(rHex.length / 2 + sHex.length / 2 + 4);
          return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
      }
      toRawBytes() {
          return this.toDERRawBytes();
      }
      toHex() {
          return this.toDERHex();
      }
      toCompactRawBytes() {
          return hexToBytes(this.toCompactHex());
      }
      toCompactHex() {
          return pad64(this.r) + pad64(this.s);
      }
  }
  function concatBytes(...arrays) {
      if (arrays.length === 1)
          return arrays[0];
      const length = arrays.reduce((a, arr) => a + arr.length, 0);
      const result = new Uint8Array(length);
      for (let i = 0, pad = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          result.set(arr, pad);
          pad += arr.length;
      }
      return result;
  }
  function bytesToHex(uint8a) {
      let hex = '';
      for (let i = 0; i < uint8a.length; i++) {
          hex += uint8a[i].toString(16).padStart(2, '0');
      }
      return hex;
  }
  function pad64(num) {
      return num.toString(16).padStart(64, '0');
  }
  function pad32b(num) {
      return hexToBytes(pad64(num));
  }
  function numberToHex(num) {
      const hex = num.toString(16);
      return hex.length & 1 ? `0${hex}` : hex;
  }
  function hexToNumber(hex) {
      if (typeof hex !== 'string') {
          throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
      }
      return BigInt(`0x${hex}`);
  }
  function hexToBytes(hex) {
      if (typeof hex !== 'string') {
          throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
      }
      if (hex.length % 2)
          throw new Error('hexToBytes: received invalid unpadded hex');
      const array = new Uint8Array(hex.length / 2);
      for (let i = 0; i < array.length; i++) {
          const j = i * 2;
          array[i] = Number.parseInt(hex.slice(j, j + 2), 16);
      }
      return array;
  }
  function ensureBytes(hex) {
      return hex instanceof Uint8Array ? hex : hexToBytes(hex);
  }
  function bytesToNumber(bytes) {
      return hexToNumber(bytesToHex(bytes));
  }
  function parseByte(str) {
      return Number.parseInt(str, 16) * 2;
  }
  function normalizeScalar(num) {
      if (typeof num === 'number' && num > 0 && Number.isSafeInteger(num))
          return BigInt(num);
      if (typeof num === 'bigint' && isWithinCurveOrder(num))
          return num;
      throw new TypeError('Expected valid private scalar: 0 < scalar < curve.n');
  }
  function mod(a, b = CURVE.P) {
      const result = a % b;
      return result >= 0 ? result : b + result;
  }
  function pow2(x, power) {
      const { P } = CURVE;
      let res = x;
      while (power-- > _0n$1) {
          res *= res;
          res %= P;
      }
      return res;
  }
  function sqrtMod(x) {
      const { P } = CURVE;
      const _6n = BigInt(6);
      const _11n = BigInt(11);
      const _22n = BigInt(22);
      const _23n = BigInt(23);
      const _44n = BigInt(44);
      const _88n = BigInt(88);
      const b2 = (x * x * x) % P;
      const b3 = (b2 * b2 * x) % P;
      const b6 = (pow2(b3, _3n) * b3) % P;
      const b9 = (pow2(b6, _3n) * b3) % P;
      const b11 = (pow2(b9, _2n$1) * b2) % P;
      const b22 = (pow2(b11, _11n) * b11) % P;
      const b44 = (pow2(b22, _22n) * b22) % P;
      const b88 = (pow2(b44, _44n) * b44) % P;
      const b176 = (pow2(b88, _88n) * b88) % P;
      const b220 = (pow2(b176, _44n) * b44) % P;
      const b223 = (pow2(b220, _3n) * b3) % P;
      const t1 = (pow2(b223, _23n) * b22) % P;
      const t2 = (pow2(t1, _6n) * b2) % P;
      return pow2(t2, _2n$1);
  }
  function invert(number, modulo = CURVE.P) {
      if (number === _0n$1 || modulo <= _0n$1) {
          throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
      }
      let a = mod(number, modulo);
      let b = modulo;
      let x = _0n$1, u = _1n$1;
      while (a !== _0n$1) {
          const q = b / a;
          const r = b % a;
          const m = x - u * q;
          b = a, a = r, x = u, u = m;
      }
      const gcd = b;
      if (gcd !== _1n$1)
          throw new Error('invert: does not exist');
      return mod(x, modulo);
  }
  function invertBatch(nums, n = CURVE.P) {
      const len = nums.length;
      const scratch = new Array(len);
      let acc = _1n$1;
      for (let i = 0; i < len; i++) {
          if (nums[i] === _0n$1)
              continue;
          scratch[i] = acc;
          acc = mod(acc * nums[i], n);
      }
      acc = invert(acc, n);
      for (let i = len - 1; i >= 0; i--) {
          if (nums[i] === _0n$1)
              continue;
          const tmp = mod(acc * nums[i], n);
          nums[i] = mod(acc * scratch[i], n);
          acc = tmp;
      }
      return nums;
  }
  const divNearest = (a, b) => (a + b / _2n$1) / b;
  const POW_2_128 = _2n$1 ** BigInt(128);
  function splitScalarEndo(k) {
      const { n } = CURVE;
      const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
      const b1 = -_1n$1 * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
      const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
      const b2 = a1;
      const c1 = divNearest(b2 * k, n);
      const c2 = divNearest(-b1 * k, n);
      let k1 = mod(k - c1 * a1 - c2 * a2, n);
      let k2 = mod(-c1 * b1 - c2 * b2, n);
      const k1neg = k1 > POW_2_128;
      const k2neg = k2 > POW_2_128;
      if (k1neg)
          k1 = n - k1;
      if (k2neg)
          k2 = n - k2;
      if (k1 > POW_2_128 || k2 > POW_2_128)
          throw new Error('splitScalarEndo: Endomorphism failed');
      return { k1neg, k1, k2neg, k2 };
  }
  function _abc6979(msgHash, privateKey) {
      if (msgHash == null)
          throw new Error(`sign: expected valid msgHash, not "${msgHash}"`);
      const num = typeof msgHash === 'string' ? hexToNumber(msgHash) : bytesToNumber(msgHash);
      const h1 = pad32b(num);
      const h1n = bytesToNumber(h1);
      const x = pad32b(privateKey);
      let v = new Uint8Array(32).fill(1);
      let k = new Uint8Array(32).fill(0);
      const b0 = Uint8Array.from([0x00]);
      const b1 = Uint8Array.from([0x01]);
      return { h1, h1n, x, v, k, b0, b1 };
  }
  function getQRSrfc6979Sync(msgHash, privateKey) {
      const privKey = normalizePrivateKey(privateKey);
      let { h1, h1n, x, v, k, b0, b1 } = _abc6979(msgHash, privKey);
      const hmac = utils.hmacSha256Sync;
      if (!hmac)
          throw new Error('utils.hmacSha256Sync is undefined, you need to set it');
      k = hmac(k, v, b0, x, h1);
      if (k instanceof Promise)
          throw new Error('To use sync sign(), ensure utils.hmacSha256 is sync');
      v = hmac(k, v);
      k = hmac(k, v, b1, x, h1);
      v = hmac(k, v);
      for (let i = 0; i < 1000; i++) {
          v = hmac(k, v);
          let qrs = calcQRSFromK(v, h1n, privKey);
          if (qrs)
              return qrs;
          k = hmac(k, v, b0);
          v = hmac(k, v);
      }
      throw new TypeError('secp256k1: Tried 1,000 k values for sign(), all were invalid');
  }
  function isWithinCurveOrder(num) {
      return 0 < num && num < CURVE.n;
  }
  function calcQRSFromK(v, msg, priv) {
      const k = bytesToNumber(v);
      if (!isWithinCurveOrder(k))
          return;
      const max = CURVE.n;
      const q = Point.BASE.multiply(k);
      const r = mod(q.x, max);
      const s = mod(invert(k, max) * (msg + r * priv), max);
      if (r === _0n$1 || s === _0n$1)
          return;
      return [q, r, s];
  }
  function normalizePrivateKey(key) {
      let num;
      if (typeof key === 'bigint') {
          num = key;
      }
      else if (typeof key === 'number' && Number.isSafeInteger(key) && key > 0) {
          num = BigInt(key);
      }
      else if (typeof key === 'string') {
          if (key.length !== 64)
              throw new Error('Expected 32 bytes of private key');
          num = hexToNumber(key);
      }
      else if (key instanceof Uint8Array) {
          if (key.length !== 32)
              throw new Error('Expected 32 bytes of private key');
          num = bytesToNumber(key);
      }
      else {
          throw new TypeError('Expected valid private key');
      }
      if (!isWithinCurveOrder(num))
          throw new Error('Expected private key: 0 < key < n');
      return num;
  }
  function normalizeSignature(signature) {
      if (signature instanceof Signature) {
          signature.assertValidity();
          return signature;
      }
      else {
          return Signature.fromDER(signature);
      }
  }
  function getPublicKey(privateKey, isCompressed = false) {
      const point = Point.fromPrivateKey(privateKey);
      if (typeof privateKey === 'string') {
          return point.toHex(isCompressed);
      }
      return point.toRawBytes(isCompressed);
  }
  function recoverPublicKey(msgHash, signature, recovery) {
      const point = Point.fromSignature(msgHash, signature, recovery);
      return typeof msgHash === 'string' ? point.toHex() : point.toRawBytes();
  }
  function QRSToSig(qrs, opts, str = false) {
      const [q, r, s] = qrs;
      let { canonical, der, recovered } = opts;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n$1);
      let adjustedS = s;
      const HIGH_NUMBER = CURVE.n >> _1n$1;
      if (s > HIGH_NUMBER && canonical) {
          adjustedS = CURVE.n - s;
          recovery ^= 1;
      }
      const sig = new Signature(r, adjustedS);
      sig.assertValidity();
      const hex = der === false ? sig.toCompactHex() : sig.toDERHex();
      const hashed = str ? hex : hexToBytes(hex);
      return recovered ? [hashed, recovery] : hashed;
  }
  function signSync(msgHash, privKey, opts = {}) {
      return QRSToSig(getQRSrfc6979Sync(msgHash, privKey), opts, typeof msgHash === 'string');
  }
  Point.BASE._setWindowSize(8);
  const crypto = {
      node: crypto$1,
      web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
  };
  const utils = {
      isValidPrivateKey(privateKey) {
          try {
              normalizePrivateKey(privateKey);
              return true;
          }
          catch (error) {
              return false;
          }
      },
      randomBytes: (bytesLength = 32) => {
          if (crypto.web) {
              return crypto.web.getRandomValues(new Uint8Array(bytesLength));
          }
          else if (crypto.node) {
              const { randomBytes } = crypto.node;
              return new Uint8Array(randomBytes(bytesLength).buffer);
          }
          else {
              throw new Error("The environment doesn't have randomBytes function");
          }
      },
      randomPrivateKey: () => {
          let i = 8;
          while (i--) {
              const b32 = utils.randomBytes(32);
              const num = bytesToNumber(b32);
              if (isWithinCurveOrder(num) && num !== _1n$1)
                  return b32;
          }
          throw new Error('Valid private key was not found in 8 iterations. PRNG is broken');
      },
      sha256: async (message) => {
          if (crypto.web) {
              const buffer = await crypto.web.subtle.digest('SHA-256', message.buffer);
              return new Uint8Array(buffer);
          }
          else if (crypto.node) {
              const { createHash } = crypto.node;
              return Uint8Array.from(createHash('sha256').update(message).digest());
          }
          else {
              throw new Error("The environment doesn't have sha256 function");
          }
      },
      hmacSha256: async (key, ...messages) => {
          if (crypto.web) {
              const ckey = await crypto.web.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']);
              const message = concatBytes(...messages);
              const buffer = await crypto.web.subtle.sign('HMAC', ckey, message);
              return new Uint8Array(buffer);
          }
          else if (crypto.node) {
              const { createHmac } = crypto.node;
              const hash = createHmac('sha256', key);
              for (let message of messages) {
                  hash.update(message);
              }
              return Uint8Array.from(hash.digest());
          }
          else {
              throw new Error("The environment doesn't have hmac-sha256 function");
          }
      },
      sha256Sync: undefined,
      hmacSha256Sync: undefined,
      precompute(windowSize = 8, point = Point.BASE) {
          const cached = point === Point.BASE ? point : new Point(point.x, point.y);
          cached._setWindowSize(windowSize);
          cached.multiply(_3n);
          return cached;
      },
  };

  const asmJsInit = null;

  const chars$1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function base64Decode$1(data) {
    const bytes = [];
    let byte = 0;
    let bits = 0;
    for (let i = 0; i < data.length && data[i] !== '='; i++) {
      byte = byte << 6 | chars$1.indexOf(data[i]);
      if ((bits += 6) >= 8) {
        bytes.push(byte >>> (bits -= 8) & 0xff);
      }
    }
    return Uint8Array.from(bytes);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function getAugmentedNamespace(n) {
  	if (n.__esModule) return n;
  	var a = Object.defineProperty({}, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  function commonjsRequire (path) {
  	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }

  const sizeCompressed = 171007;
  const sizeUncompressed$1 = 349686;
  const bytes$1 = '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';
  var bytes_1 = { bytes: bytes$1, sizeCompressed, sizeUncompressed: sizeUncompressed$1 };

  const bytes = bytes_1.bytes;
  const sizeUncompressed = bytes_1.sizeUncompressed;

  const u8 = Uint8Array,
        u16 = Uint16Array,
        u32$1 = Uint32Array;
  const clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  const fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
  0, 0,
  0]);
  const fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
  0, 0]);
  const freb = (eb, start) => {
    const b = new u16(31);
    for (let i = 0; i < 31; ++i) {
      b[i] = start += 1 << eb[i - 1];
    }
    const r = new u32$1(b[30]);
    for (let i = 1; i < 30; ++i) {
      for (let j = b[i]; j < b[i + 1]; ++j) {
        r[j] = j - b[i] << 5 | i;
      }
    }
    return [b, r];
  };
  const [fl, revfl] = freb(fleb, 2);
  fl[28] = 258, revfl[258] = 28;
  const [fd] = freb(fdeb, 0);
  const rev = new u16(32768);
  for (let i = 0; i < 32768; ++i) {
    let x = (i & 0xAAAA) >>> 1 | (i & 0x5555) << 1;
    x = (x & 0xCCCC) >>> 2 | (x & 0x3333) << 2;
    x = (x & 0xF0F0) >>> 4 | (x & 0x0F0F) << 4;
    rev[i] = ((x & 0xFF00) >>> 8 | (x & 0x00FF) << 8) >>> 1;
  }
  const hMap = (cd, mb, r) => {
    const s = cd.length;
    let i = 0;
    const l = new u16(mb);
    for (; i < s; ++i) ++l[cd[i] - 1];
    const le = new u16(mb);
    for (i = 0; i < mb; ++i) {
      le[i] = le[i - 1] + l[i - 1] << 1;
    }
    let co;
    if (r) {
      co = new u16(1 << mb);
      const rvb = 15 - mb;
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          const sv = i << 4 | cd[i];
          const r = mb - cd[i];
          let v = le[cd[i] - 1]++ << r;
          for (const m = v | (1 << r) - 1; v <= m; ++v) {
            co[rev[v] >>> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i = 0; i < s; ++i) co[i] = rev[le[cd[i] - 1]++] >>> 15 - cd[i];
    }
    return co;
  };
  const flt = new u8(288);
  for (let i = 0; i < 144; ++i) flt[i] = 8;
  for (let i = 144; i < 256; ++i) flt[i] = 9;
  for (let i = 256; i < 280; ++i) flt[i] = 7;
  for (let i = 280; i < 288; ++i) flt[i] = 8;
  const fdt = new u8(32);
  for (let i = 0; i < 32; ++i) fdt[i] = 5;
  const flrm = hMap(flt, 9, 1);
  const fdrm = hMap(fdt, 5, 1);
  const bits = (d, p, m) => {
    const o = p >>> 3;
    return (d[o] | d[o + 1] << 8) >>> (p & 7) & m;
  };
  const bits16 = (d, p) => {
    const o = p >>> 3;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >>> (p & 7);
  };
  const shft = p => (p >>> 3) + (p & 7 && 1);
  const slc = (v, s, e) => {
    if (s == null || s < 0) s = 0;
    if (e == null || e > v.length) e = v.length;
    const n = new (v instanceof u16 ? u16 : v instanceof u32$1 ? u32$1 : u8)(e - s);
    n.set(v.subarray(s, e));
    return n;
  };
  const max = a => {
    let m = a[0];
    for (let i = 1; i < a.length; ++i) {
      if (a[i] > m) m = a[i];
    }
    return m;
  };
  const inflt = (dat, buf, st) => {
    const noSt = !st || st.i;
    if (!st) st = {};
    const sl = dat.length;
    const noBuf = !buf || !noSt;
    if (!buf) buf = new u8(sl * 3);
    const cbuf = l => {
      let bl = buf.length;
      if (l > bl) {
        const nbuf = new u8(Math.max(bl << 1, l));
        nbuf.set(buf);
        buf = nbuf;
      }
    };
    let final = st.f || 0,
        pos = st.p || 0,
        bt = st.b || 0,
        lm = st.l,
        dm = st.d,
        lbt = st.m,
        dbt = st.n;
    if (final && !lm) return buf;
    const tbts = sl << 3;
    do {
      if (!lm) {
        st.f = final = bits(dat, pos, 1);
        const type = bits(dat, pos + 1, 3);
        pos += 3;
        if (!type) {
          const s = shft(pos) + 4,
                l = dat[s - 4] | dat[s - 3] << 8,
                t = s + l;
          if (t > sl) {
            if (noSt) throw 'unexpected EOF';
            break;
          }
          if (noBuf) cbuf(bt + l);
          buf.set(dat.subarray(s, t), bt);
          st.b = bt += l, st.p = pos = t << 3;
          continue;
        } else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;else if (type == 2) {
          const hLit = bits(dat, pos, 31) + 257,
                hcLen = bits(dat, pos + 10, 15) + 4;
          const tl = hLit + bits(dat, pos + 5, 31) + 1;
          pos += 14;
          const ldt = new u8(tl);
          const clt = new u8(19);
          for (let i = 0; i < hcLen; ++i) {
            clt[clim[i]] = bits(dat, pos + i * 3, 7);
          }
          pos += hcLen * 3;
          const clb = max(clt),
                clbmsk = (1 << clb) - 1;
          if (!noSt && pos + tl * (clb + 7) > tbts) break;
          const clm = hMap(clt, clb, 1);
          for (let i = 0; i < tl;) {
            const r = clm[bits(dat, pos, clbmsk)];
            pos += r & 15;
            const s = r >>> 4;
            if (s < 16) {
              ldt[i++] = s;
            } else {
              let c = 0,
                  n = 0;
              if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3;else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
              while (n--) ldt[i++] = c;
            }
          }
          const lt = ldt.subarray(0, hLit),
                dt = ldt.subarray(hLit);
          lbt = max(lt);
          dbt = max(dt);
          lm = hMap(lt, lbt, 1);
          dm = hMap(dt, dbt, 1);
        } else throw 'invalid block type';
        if (pos > tbts) throw 'unexpected EOF';
      }
      if (noBuf) cbuf(bt + 131072);
      const lms = (1 << lbt) - 1,
            dms = (1 << dbt) - 1;
      const mxa = lbt + dbt + 18;
      while (noSt || pos + mxa < tbts) {
        const c = lm[bits16(dat, pos) & lms],
              sym = c >>> 4;
        pos += c & 15;
        if (pos > tbts) throw 'unexpected EOF';
        if (!c) throw 'invalid length/literal';
        if (sym < 256) buf[bt++] = sym;else if (sym == 256) {
          lm = undefined;
          break;
        } else {
          let add = sym - 254;
          if (sym > 264) {
            const i = sym - 257,
                  b = fleb[i];
            add = bits(dat, pos, (1 << b) - 1) + fl[i];
            pos += b;
          }
          const d = dm[bits16(dat, pos) & dms],
                dsym = d >>> 4;
          if (!d) throw 'invalid distance';
          pos += d & 15;
          let dt = fd[dsym];
          if (dsym > 3) {
            const b = fdeb[dsym];
            dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
          }
          if (pos > tbts) throw 'unexpected EOF';
          if (noBuf) cbuf(bt + 131072);
          const end = bt + add;
          for (; bt < end; bt += 4) {
            buf[bt] = buf[bt - dt];
            buf[bt + 1] = buf[bt + 1 - dt];
            buf[bt + 2] = buf[bt + 2 - dt];
            buf[bt + 3] = buf[bt + 3 - dt];
          }
          bt = end;
        }
      }
      st.l = lm, st.p = pos, st.b = bt;
      if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt == buf.length ? buf : slc(buf, 0, bt);
  };
  const zlv = d => {
    if ((d[0] & 15) != 8 || d[0] >>> 4 > 7 || (d[0] << 8 | d[1]) % 31) throw 'invalid zlib data';
    if (d[1] & 32) throw 'invalid zlib data: preset dictionaries not supported';
  };
  function unzlibSync(data, out) {
    return inflt((zlv(data), data.subarray(2, -4)), out);
  }

  const wasmBytes = unzlibSync(base64Decode$1(bytes), new Uint8Array(sizeUncompressed));

  let wasm = null;
  let cachegetInt32 = null;
  let cachegetUint8 = null;
  async function initWasm(wasmBytes, asmFn, wbg) {
    try {
      util.assert(typeof WebAssembly !== 'undefined' && wasmBytes && wasmBytes.length, 'WebAssembly is not available in your environment');
      const source = await WebAssembly.instantiate(wasmBytes, {
        wbg
      });
      wasm = source.instance.exports;
    } catch (error) {
      if (asmFn) {
        wasm = asmFn(wbg);
      } else {
        console.error('FATAL: Unable to initialize @polkadot/wasm-crypto');
        console.error(error);
        wasm = null;
      }
    }
  }
  function withWasm(fn) {
    return (...params) => {
      util.assert(wasm, 'The WASM interface has not been initialized. Ensure that you wait for the initialization Promise with waitReady() from @polkadot/wasm-crypto (or cryptoWaitReady() from @polkadot/util-crypto) before attempting to use WASM-only interfaces.');
      return fn(wasm, ...params);
    };
  }
  function getWasm() {
    return wasm;
  }
  function getInt32() {
    if (cachegetInt32 === null || cachegetInt32.buffer !== wasm.memory.buffer) {
      cachegetInt32 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32;
  }
  function getUint8() {
    if (cachegetUint8 === null || cachegetUint8.buffer !== wasm.memory.buffer) {
      cachegetUint8 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8;
  }
  function getU8a(ptr, len) {
    return getUint8().subarray(ptr / 1, ptr / 1 + len);
  }
  function getString(ptr, len) {
    return util.u8aToString(getU8a(ptr, len));
  }
  function allocU8a(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8().set(arg, ptr / 1);
    return [ptr, arg.length];
  }
  function allocString(arg) {
    return allocU8a(util.stringToU8a(arg));
  }
  function resultU8a() {
    const r0 = getInt32()[8 / 4 + 0];
    const r1 = getInt32()[8 / 4 + 1];
    const ret = getU8a(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return ret;
  }
  function resultString() {
    return util.u8aToString(resultU8a());
  }

  function getRandomValues(arr) {
    return crypto$1.getRandomValues(arr);
  }

  const DEFAULT_CRYPTO = {
    getRandomValues
  };
  const DEFAULT_SELF = {
    crypto: DEFAULT_CRYPTO
  };
  const heap = new Array(32).fill(undefined).concat(undefined, null, true, false);
  let heapNext = heap.length;
  function getObject(idx) {
    return heap[idx];
  }
  function dropObject(idx) {
    if (idx < 36) {
      return;
    }
    heap[idx] = heapNext;
    heapNext = idx;
  }
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  function addObject(obj) {
    if (heapNext === heap.length) {
      heap.push(heap.length + 1);
    }
    const idx = heapNext;
    heapNext = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  function __wbindgen_is_undefined(idx) {
    return getObject(idx) === undefined;
  }
  function __wbindgen_throw(ptr, len) {
    throw new Error(getString(ptr, len));
  }
  function __wbg_self_1b7a39e3a92c949c() {
    return addObject(DEFAULT_SELF);
  }
  function __wbg_require_604837428532a733(ptr, len) {
    throw new Error(`Unable to require ${getString(ptr, len)}`);
  }
  function __wbg_crypto_968f1772287e2df0(_idx) {
    return addObject(DEFAULT_CRYPTO);
  }
  function __wbg_getRandomValues_a3d34b4fee3c2869(_idx) {
    return addObject(DEFAULT_CRYPTO.getRandomValues);
  }
  function __wbg_getRandomValues_f5e14ab7ac8e995d(_arg0, ptr, len) {
    DEFAULT_CRYPTO.getRandomValues(getU8a(ptr, len));
  }
  function __wbg_randomFillSync_d5bd2d655fdf256a(_idx, _ptr, _len) {
    throw new Error('randomFillsync is not available');
  }
  function __wbindgen_object_drop_ref(idx) {
    takeObject(idx);
  }
  function abort() {
    throw new Error('abort');
  }

  const imports = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __wbindgen_is_undefined: __wbindgen_is_undefined,
    __wbindgen_throw: __wbindgen_throw,
    __wbg_self_1b7a39e3a92c949c: __wbg_self_1b7a39e3a92c949c,
    __wbg_require_604837428532a733: __wbg_require_604837428532a733,
    __wbg_crypto_968f1772287e2df0: __wbg_crypto_968f1772287e2df0,
    __wbg_getRandomValues_a3d34b4fee3c2869: __wbg_getRandomValues_a3d34b4fee3c2869,
    __wbg_getRandomValues_f5e14ab7ac8e995d: __wbg_getRandomValues_f5e14ab7ac8e995d,
    __wbg_randomFillSync_d5bd2d655fdf256a: __wbg_randomFillSync_d5bd2d655fdf256a,
    __wbindgen_object_drop_ref: __wbindgen_object_drop_ref,
    abort: abort
  });

  const wasmPromise = initWasm(wasmBytes, asmJsInit, imports).catch(() => null);
  const bip39Generate = withWasm((wasm, words) => {
    wasm.ext_bip39_generate(8, words);
    return resultString();
  });
  const bip39ToEntropy = withWasm((wasm, phrase) => {
    wasm.ext_bip39_to_entropy(8, ...allocString(phrase));
    return resultU8a();
  });
  const bip39ToMiniSecret = withWasm((wasm, phrase, password) => {
    wasm.ext_bip39_to_mini_secret(8, ...allocString(phrase), ...allocString(password));
    return resultU8a();
  });
  const bip39ToSeed = withWasm((wasm, phrase, password) => {
    wasm.ext_bip39_to_seed(8, ...allocString(phrase), ...allocString(password));
    return resultU8a();
  });
  const bip39Validate = withWasm((wasm, phrase) => {
    const ret = wasm.ext_bip39_validate(...allocString(phrase));
    return ret !== 0;
  });
  const ed25519KeypairFromSeed = withWasm((wasm, seed) => {
    wasm.ext_ed_from_seed(8, ...allocU8a(seed));
    return resultU8a();
  });
  const ed25519Sign$1 = withWasm((wasm, pubkey, seckey, message) => {
    wasm.ext_ed_sign(8, ...allocU8a(pubkey), ...allocU8a(seckey), ...allocU8a(message));
    return resultU8a();
  });
  const ed25519Verify$1 = withWasm((wasm, signature, message, pubkey) => {
    const ret = wasm.ext_ed_verify(...allocU8a(signature), ...allocU8a(message), ...allocU8a(pubkey));
    return ret !== 0;
  });
  const secp256k1FromSeed = withWasm((wasm, seckey) => {
    wasm.ext_secp_from_seed(8, ...allocU8a(seckey));
    return resultU8a();
  });
  const secp256k1Compress$1 = withWasm((wasm, pubkey) => {
    wasm.ext_secp_pub_compress(8, ...allocU8a(pubkey));
    return resultU8a();
  });
  const secp256k1Expand$1 = withWasm((wasm, pubkey) => {
    wasm.ext_secp_pub_expand(8, ...allocU8a(pubkey));
    return resultU8a();
  });
  const secp256k1Recover$1 = withWasm((wasm, msgHash, sig, recovery) => {
    wasm.ext_secp_recover(8, ...allocU8a(msgHash), ...allocU8a(sig), recovery);
    return resultU8a();
  });
  const secp256k1Sign$1 = withWasm((wasm, msgHash, seckey) => {
    wasm.ext_secp_sign(8, ...allocU8a(msgHash), ...allocU8a(seckey));
    return resultU8a();
  });
  const sr25519DeriveKeypairHard = withWasm((wasm, pair, cc) => {
    wasm.ext_sr_derive_keypair_hard(8, ...allocU8a(pair), ...allocU8a(cc));
    return resultU8a();
  });
  const sr25519DeriveKeypairSoft = withWasm((wasm, pair, cc) => {
    wasm.ext_sr_derive_keypair_soft(8, ...allocU8a(pair), ...allocU8a(cc));
    return resultU8a();
  });
  const sr25519DerivePublicSoft = withWasm((wasm, pubkey, cc) => {
    wasm.ext_sr_derive_public_soft(8, ...allocU8a(pubkey), ...allocU8a(cc));
    return resultU8a();
  });
  const sr25519KeypairFromSeed = withWasm((wasm, seed) => {
    wasm.ext_sr_from_seed(8, ...allocU8a(seed));
    return resultU8a();
  });
  const sr25519Sign$1 = withWasm((wasm, pubkey, secret, message) => {
    wasm.ext_sr_sign(8, ...allocU8a(pubkey), ...allocU8a(secret), ...allocU8a(message));
    return resultU8a();
  });
  const sr25519Verify$1 = withWasm((wasm, signature, message, pubkey) => {
    const ret = wasm.ext_sr_verify(...allocU8a(signature), ...allocU8a(message), ...allocU8a(pubkey));
    return ret !== 0;
  });
  const sr25519Agree = withWasm((wasm, pubkey, secret) => {
    wasm.ext_sr_agree(8, ...allocU8a(pubkey), ...allocU8a(secret));
    return resultU8a();
  });
  const vrfSign = withWasm((wasm, secret, context, message, extra) => {
    wasm.ext_vrf_sign(8, ...allocU8a(secret), ...allocU8a(context), ...allocU8a(message), ...allocU8a(extra));
    return resultU8a();
  });
  const vrfVerify = withWasm((wasm, pubkey, context, message, extra, outAndProof) => {
    const ret = wasm.ext_vrf_verify(...allocU8a(pubkey), ...allocU8a(context), ...allocU8a(message), ...allocU8a(extra), ...allocU8a(outAndProof));
    return ret !== 0;
  });
  const blake2b$1 = withWasm((wasm, data, key, size) => {
    wasm.ext_blake2b(8, ...allocU8a(data), ...allocU8a(key), size);
    return resultU8a();
  });
  const hmacSha256 = withWasm((wasm, key, data) => {
    wasm.ext_hmac_sha256(8, ...allocU8a(key), ...allocU8a(data));
    return resultU8a();
  });
  const hmacSha512 = withWasm((wasm, key, data) => {
    wasm.ext_hmac_sha512(8, ...allocU8a(key), ...allocU8a(data));
    return resultU8a();
  });
  const keccak256 = withWasm((wasm, data) => {
    wasm.ext_keccak256(8, ...allocU8a(data));
    return resultU8a();
  });
  const keccak512 = withWasm((wasm, data) => {
    wasm.ext_keccak512(8, ...allocU8a(data));
    return resultU8a();
  });
  const pbkdf2$1 = withWasm((wasm, data, salt, rounds) => {
    wasm.ext_pbkdf2(8, ...allocU8a(data), ...allocU8a(salt), rounds);
    return resultU8a();
  });
  const scrypt$1 = withWasm((wasm, password, salt, log2n, r, p) => {
    wasm.ext_scrypt(8, ...allocU8a(password), ...allocU8a(salt), log2n, r, p);
    return resultU8a();
  });
  const sha256$1 = withWasm((wasm, data) => {
    wasm.ext_sha256(8, ...allocU8a(data));
    return resultU8a();
  });
  const sha512$1 = withWasm((wasm, data) => {
    wasm.ext_sha512(8, ...allocU8a(data));
    return resultU8a();
  });
  const twox = withWasm((wasm, data, rounds) => {
    wasm.ext_twox(8, ...allocU8a(data), rounds);
    return resultU8a();
  });
  function isReady() {
    return !!getWasm();
  }
  function waitReady() {
    return wasmPromise.then(() => isReady());
  }

  const cryptoIsReady = isReady;
  function cryptoWaitReady() {
    return waitReady().then(() => true).catch(error => {
      console.error('Unable to initialize @polkadot/util-crypto', error);
      return false;
    });
  }

  /*! noble-hashes - MIT License (c) 2021 Paul Miller (paulmillr.com) */
  const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift);
  const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
  if (!isLE)
      throw new Error('Non little-endian hardware is not supported');
  Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
  (() => {
      const nodeRequire = typeof module !== 'undefined' &&
          typeof module.require === 'function' &&
          module.require.bind(module);
      try {
          if (nodeRequire) {
              const { setImmediate } = nodeRequire('timers');
              return () => new Promise((resolve) => setImmediate(resolve));
          }
      }
      catch (e) { }
      return () => new Promise((resolve) => setTimeout(resolve, 0));
  })();
  function toBytes(data) {
      if (typeof data === 'string')
          data = new TextEncoder().encode(data);
      if (!(data instanceof Uint8Array))
          throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
      return data;
  }
  function assertNumber(n) {
      if (!Number.isSafeInteger(n))
          throw new Error(`Wrong integer: ${n}`);
  }
  function assertHash(hash) {
      if (typeof hash !== 'function' || typeof hash.init !== 'function')
          throw new Error('Hash should be wrapped by utils.wrapConstructor');
      assertNumber(hash.outputLen);
      assertNumber(hash.blockLen);
  }
  class Hash {
      clone() {
          return this._cloneInto();
      }
  }
  const isPlainObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor === Object;
  function checkOpts(def, _opts) {
      if (_opts !== undefined && (typeof _opts !== 'object' || !isPlainObject(_opts)))
          throw new TypeError('Options should be object or undefined');
      const opts = Object.assign(def, _opts);
      return opts;
  }
  function wrapConstructor(hashConstructor) {
      const hashC = (message) => hashConstructor().update(toBytes(message)).digest();
      const tmp = hashConstructor();
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = () => hashConstructor();
      hashC.init = hashC.create;
      return hashC;
  }
  function wrapConstructorWithOpts(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      hashC.init = hashC.create;
      return hashC;
  }

  class HMAC extends Hash {
      constructor(hash, _key) {
          super();
          this.finished = false;
          this.destroyed = false;
          assertHash(hash);
          const key = toBytes(_key);
          this.iHash = hash.create();
          if (!(this.iHash instanceof Hash))
              throw new TypeError('Expected instance of class which extends utils.Hash');
          const blockLen = (this.blockLen = this.iHash.blockLen);
          this.outputLen = this.iHash.outputLen;
          const pad = new Uint8Array(blockLen);
          pad.set(key.length > this.iHash.blockLen ? hash.create().update(key).digest() : key);
          for (let i = 0; i < pad.length; i++)
              pad[i] ^= 0x36;
          this.iHash.update(pad);
          this.oHash = hash.create();
          for (let i = 0; i < pad.length; i++)
              pad[i] ^= 0x36 ^ 0x5c;
          this.oHash.update(pad);
          pad.fill(0);
      }
      update(buf) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          this.iHash.update(buf);
          return this;
      }
      digestInto(out) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          if (!(out instanceof Uint8Array) || out.length !== this.outputLen)
              throw new Error('HMAC: Invalid output buffer');
          if (this.finished)
              throw new Error('digest() was already called');
          this.finished = true;
          this.iHash.digestInto(out);
          this.oHash.update(out);
          this.oHash.digestInto(out);
          this.destroy();
      }
      digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
      }
      _cloneInto(to) {
          to || (to = Object.create(Object.getPrototypeOf(this), {}));
          const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
      }
      destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
      }
  }
  const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac.create = (hash, key) => new HMAC(hash, key);
  hmac.init = hmac.create;

  function setBigUint64(view, byteOffset, value, isLE) {
      if (typeof view.setBigUint64 === 'function')
          return view.setBigUint64(byteOffset, value, isLE);
      const _32n = BigInt(32);
      const _u32_max = BigInt(0xffffffff);
      const wh = Number((value >> _32n) & _u32_max);
      const wl = Number(value & _u32_max);
      const h = isLE ? 4 : 0;
      const l = isLE ? 0 : 4;
      view.setUint32(byteOffset + h, wh, isLE);
      view.setUint32(byteOffset + l, wl, isLE);
  }
  class SHA2 extends Hash {
      constructor(blockLen, outputLen, padOffset, isLE) {
          super();
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
      }
      update(data) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          const { view, buffer, blockLen, finished } = this;
          if (finished)
              throw new Error('digest() was already called');
          data = toBytes(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
              const take = Math.min(blockLen - this.pos, len - pos);
              if (take === blockLen) {
                  const dataView = createView(data);
                  for (; blockLen <= len - pos; pos += blockLen)
                      this.process(dataView, pos);
                  continue;
              }
              buffer.set(data.subarray(pos, pos + take), this.pos);
              this.pos += take;
              pos += take;
              if (this.pos === blockLen) {
                  this.process(view, 0);
                  this.pos = 0;
              }
          }
          this.length += data.length;
          this.roundClean();
          return this;
      }
      digestInto(out) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          if (!(out instanceof Uint8Array) || out.length < this.outputLen)
              throw new Error('_Sha2: Invalid output buffer');
          if (this.finished)
              throw new Error('digest() was already called');
          this.finished = true;
          const { buffer, view, blockLen, isLE } = this;
          let { pos } = this;
          buffer[pos++] = 0b10000000;
          this.buffer.subarray(pos).fill(0);
          if (this.padOffset > blockLen - pos) {
              this.process(view, 0);
              pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
              buffer[i] = 0;
          setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
          this.process(view, 0);
          const oview = createView(out);
          this.get().forEach((v, i) => oview.setUint32(4 * i, v, isLE));
      }
      digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
      }
      _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const { blockLen, buffer, length, finished, destroyed, pos } = this;
          to.length = length;
          to.pos = pos;
          to.finished = finished;
          to.destroyed = destroyed;
          if (length % blockLen)
              to.buffer.set(buffer);
          return to;
      }
  }

  const Chi = (a, b, c) => (a & b) ^ (~a & c);
  const Maj = (a, b, c) => (a & b) ^ (a & c) ^ (b & c);
  const SHA256_K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  const IV$1 = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  const SHA256_W = new Uint32Array(64);
  class SHA256 extends SHA2 {
      constructor() {
          super(64, 32, 8, false);
          this.A = IV$1[0] | 0;
          this.B = IV$1[1] | 0;
          this.C = IV$1[2] | 0;
          this.D = IV$1[3] | 0;
          this.E = IV$1[4] | 0;
          this.F = IV$1[5] | 0;
          this.G = IV$1[6] | 0;
          this.H = IV$1[7] | 0;
      }
      get() {
          const { A, B, C, D, E, F, G, H } = this;
          return [A, B, C, D, E, F, G, H];
      }
      set(A, B, C, D, E, F, G, H) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
      }
      process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
              SHA256_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
              const W15 = SHA256_W[i - 15];
              const W2 = SHA256_W[i - 2];
              const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ (W15 >>> 3);
              const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ (W2 >>> 10);
              SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
          }
          let { A, B, C, D, E, F, G, H } = this;
          for (let i = 0; i < 64; i++) {
              const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
              const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
              const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
              const T2 = (sigma0 + Maj(A, B, C)) | 0;
              H = G;
              G = F;
              F = E;
              E = (D + T1) | 0;
              D = C;
              C = B;
              B = A;
              A = (T1 + T2) | 0;
          }
          A = (A + this.A) | 0;
          B = (B + this.B) | 0;
          C = (C + this.C) | 0;
          D = (D + this.D) | 0;
          E = (E + this.E) | 0;
          F = (F + this.F) | 0;
          G = (G + this.G) | 0;
          H = (H + this.H) | 0;
          this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
          SHA256_W.fill(0);
      }
      destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          this.buffer.fill(0);
      }
  }
  const sha256 = wrapConstructor(() => new SHA256());

  const U32_MASK64 = BigInt(2 ** 32 - 1);
  const _32n$1 = BigInt(32);
  function fromBig(n, le = false) {
      if (le)
          return { h: Number(n & U32_MASK64), l: Number((n >> _32n$1) & U32_MASK64) };
      return { h: Number((n >> _32n$1) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
      let Ah = new Uint32Array(lst.length);
      let Al = new Uint32Array(lst.length);
      for (let i = 0; i < lst.length; i++) {
          const { h, l } = fromBig(lst[i], le);
          [Ah[i], Al[i]] = [h, l];
      }
      return [Ah, Al];
  }
  const shrSH = (h, l, s) => h >>> s;
  const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
  const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
  const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
  const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
  const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
  const rotr32H = (h, l) => l;
  const rotr32L = (h, l) => h;
  const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
  const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
  const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
  const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
  function add(Ah, Al, Bh, Bl) {
      const l = (Al >>> 0) + (Bl >>> 0);
      return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
  }
  const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
  const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
  const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;

  const [SHA512_Kh, SHA512_Kl] = split([
      '0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc',
      '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118',
      '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2',
      '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694',
      '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65',
      '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5',
      '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4',
      '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70',
      '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df',
      '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b',
      '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30',
      '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8',
      '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8',
      '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3',
      '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec',
      '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b',
      '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178',
      '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b',
      '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c',
      '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'
  ].map(n => BigInt(n)));
  const SHA512_W_H = new Uint32Array(80);
  const SHA512_W_L = new Uint32Array(80);
  class SHA512 extends SHA2 {
      constructor() {
          super(128, 64, 16, false);
          this.Ah = 0x6a09e667 | 0;
          this.Al = 0xf3bcc908 | 0;
          this.Bh = 0xbb67ae85 | 0;
          this.Bl = 0x84caa73b | 0;
          this.Ch = 0x3c6ef372 | 0;
          this.Cl = 0xfe94f82b | 0;
          this.Dh = 0xa54ff53a | 0;
          this.Dl = 0x5f1d36f1 | 0;
          this.Eh = 0x510e527f | 0;
          this.El = 0xade682d1 | 0;
          this.Fh = 0x9b05688c | 0;
          this.Fl = 0x2b3e6c1f | 0;
          this.Gh = 0x1f83d9ab | 0;
          this.Gl = 0xfb41bd6b | 0;
          this.Hh = 0x5be0cd19 | 0;
          this.Hl = 0x137e2179 | 0;
      }
      get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
      }
      process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
              SHA512_W_H[i] = view.getUint32(offset);
              SHA512_W_L[i] = view.getUint32((offset += 4));
          }
          for (let i = 16; i < 80; i++) {
              const W15h = SHA512_W_H[i - 15] | 0;
              const W15l = SHA512_W_L[i - 15] | 0;
              const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
              const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
              const W2h = SHA512_W_H[i - 2] | 0;
              const W2l = SHA512_W_L[i - 2] | 0;
              const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
              const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
              const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
              const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
              SHA512_W_H[i] = SUMh | 0;
              SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
              const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
              const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
              const CHIh = (Eh & Fh) ^ (~Eh & Gh);
              const CHIl = (El & Fl) ^ (~El & Gl);
              const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
              const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
              const T1l = T1ll | 0;
              const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
              const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
              const MAJh = (Ah & Bh) ^ (Ah & Ch) ^ (Bh & Ch);
              const MAJl = (Al & Bl) ^ (Al & Cl) ^ (Bl & Cl);
              Hh = Gh | 0;
              Hl = Gl | 0;
              Gh = Fh | 0;
              Gl = Fl | 0;
              Fh = Eh | 0;
              Fl = El | 0;
              ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
              Dh = Ch | 0;
              Dl = Cl | 0;
              Ch = Bh | 0;
              Cl = Bl | 0;
              Bh = Ah | 0;
              Bl = Al | 0;
              const All = add3L(T1l, sigma0l, MAJl);
              Ah = add3H(All, T1h, sigma0h, MAJh);
              Al = All | 0;
          }
          ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
          SHA512_W_H.fill(0);
          SHA512_W_L.fill(0);
      }
      destroy() {
          this.buffer.fill(0);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
  }
  class SHA512_256 extends SHA512 {
      constructor() {
          super();
          this.Ah = 0x22312194 | 0;
          this.Al = 0xfc2bf72c | 0;
          this.Bh = 0x9f555fa3 | 0;
          this.Bl = 0xc84c64c2 | 0;
          this.Ch = 0x2393b86b | 0;
          this.Cl = 0x6f53b151 | 0;
          this.Dh = 0x96387719 | 0;
          this.Dl = 0x5940eabd | 0;
          this.Eh = 0x96283ee2 | 0;
          this.El = 0xa88effe3 | 0;
          this.Fh = 0xbe5e1e25 | 0;
          this.Fl = 0x53863992 | 0;
          this.Gh = 0x2b0199fc | 0;
          this.Gl = 0x2c85b8aa | 0;
          this.Hh = 0x0eb72ddc | 0;
          this.Hl = 0x81c52ca2 | 0;
          this.outputLen = 32;
      }
  }
  class SHA384 extends SHA512 {
      constructor() {
          super();
          this.Ah = 0xcbbb9d5d | 0;
          this.Al = 0xc1059ed8 | 0;
          this.Bh = 0x629a292a | 0;
          this.Bl = 0x367cd507 | 0;
          this.Ch = 0x9159015a | 0;
          this.Cl = 0x3070dd17 | 0;
          this.Dh = 0x152fecd8 | 0;
          this.Dl = 0xf70e5939 | 0;
          this.Eh = 0x67332667 | 0;
          this.El = 0xffc00b31 | 0;
          this.Fh = 0x8eb44a87 | 0;
          this.Fl = 0x68581511 | 0;
          this.Gh = 0xdb0c2e0d | 0;
          this.Gl = 0x64f98fa7 | 0;
          this.Hh = 0x47b5481d | 0;
          this.Hl = 0xbefa4fa4 | 0;
          this.outputLen = 48;
      }
  }
  const sha512 = wrapConstructor(() => new SHA512());
  wrapConstructor(() => new SHA512_256());
  wrapConstructor(() => new SHA384());

  const JS_HASH = {
    256: sha256,
    512: sha512
  };
  const WA_MHAC = {
    256: hmacSha256,
    512: hmacSha512
  };
  function createSha(bitLength) {
    return (key, data, onlyJs) => hmacShaAsU8a(key, data, bitLength, onlyJs);
  }
  function hmacShaAsU8a(key, data, bitLength = 256, onlyJs) {
    const u8aKey = util.u8aToU8a(key);
    return !util.hasBigInt || !onlyJs && isReady() ? WA_MHAC[bitLength](u8aKey, data) : hmac(JS_HASH[bitLength], u8aKey, data);
  }
  const hmacSha256AsU8a = createSha(256);
  const hmacSha512AsU8a = createSha(512);

  utils.hmacSha256Sync = (key, ...messages) => hmacSha256AsU8a(key, util.u8aConcat(...messages));
  cryptoWaitReady().catch(() => {
  });

  const packageInfo = {
    name: '@polkadot/util-crypto',
    version: '8.2.3-0'
  };

  var microBase = {};

  (function (exports) {
  /*! micro-base - MIT License (c) 2021 Paul Miller (paulmillr.com) */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64url = exports.base64 = exports.base32crockford = exports.base32hex = exports.base32 = exports.base16 = exports.utils = exports.assertNumber = void 0;
  function assertNumber(n) {
      if (!Number.isSafeInteger(n))
          throw new Error(`Wrong integer: ${n}`);
  }
  exports.assertNumber = assertNumber;
  function chain(...args) {
      const wrap = (a, b) => (c) => a(b(c));
      const encode = Array.from(args)
          .reverse()
          .reduce((acc, i) => (acc ? wrap(acc, i.encode) : i.encode), undefined);
      const decode = args.reduce((acc, i) => (acc ? wrap(acc, i.decode) : i.decode), undefined);
      return { encode, decode };
  }
  function alphabet(alphabet) {
      return {
          encode: (digits) => {
              if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number'))
                  throw new Error('alphabet.encode input should be an array of numbers');
              return digits.map((i) => {
                  assertNumber(i);
                  if (i < 0 || i >= alphabet.length)
                      throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`);
                  return alphabet[i];
              });
          },
          decode: (input) => {
              if (!Array.isArray(input) || (input.length && typeof input[0] !== 'string'))
                  throw new Error('alphabet.decode input should be array of strings');
              return input.map((letter) => {
                  const index = alphabet.indexOf(letter);
                  if (index === -1)
                      throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`);
                  return index;
              });
          },
      };
  }
  function join(separator = '') {
      if (typeof separator !== 'string')
          throw new Error('join separator should be string');
      return {
          encode: (from) => {
              if (!Array.isArray(from) || (from.length && typeof from[0] !== 'string'))
                  throw new Error('join.encode input should be array of strings');
              return from.join(separator);
          },
          decode: (to) => {
              if (typeof to !== 'string')
                  throw new Error('join.decode input should be string');
              return to.split(separator);
          },
      };
  }
  function padding(bits, chr = '=') {
      assertNumber(bits);
      if (typeof chr !== 'string')
          throw new Error('padding chr should be string');
      return {
          encode(data) {
              if (!Array.isArray(data) || (data.length && typeof data[0] !== 'string'))
                  throw new Error('padding.encode input should be array of strings');
              while ((data.length * bits) % 8)
                  data.push(chr);
              return data;
          },
          decode(input) {
              if (!Array.isArray(input) || (input.length && typeof input[0] !== 'string'))
                  throw new Error('padding.encode input should be array of strings');
              let end = input.length;
              if ((end * bits) % 8)
                  throw new Error('Invalid padding: string should have whole number of bytes');
              for (; end > 0 && input[end - 1] === chr; end--) {
                  if (!(((end - 1) * bits) % 8))
                      throw new Error('Invalid padding: string has too much padding');
              }
              return input.slice(0, end);
          },
      };
  }
  function normalize(fn) {
      if (typeof fn !== 'function')
          throw new Error('normalize fn should be function');
      return { encode: (from) => from, decode: (to) => fn(to) };
  }
  function convertRadix(data, from, to) {
      if (from < 2)
          throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
      if (to < 2)
          throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
      if (!Array.isArray(data))
          throw new Error('convertRadix: data should be array');
      if (!data.length)
          return [];
      let pos = 0;
      const res = [];
      const digits = Array.from(data);
      while (true) {
          let carry = 0;
          let done = true;
          for (let i = pos; i < digits.length; i++) {
              const digit = digits[i];
              const digitBase = from * carry + digit;
              if (!Number.isSafeInteger(digitBase) ||
                  (from * carry) / from !== carry ||
                  digitBase - digit !== from * carry) {
                  throw new Error('convertRadix: carry overflow');
              }
              carry = digitBase % to;
              digits[i] = Math.floor(digitBase / to);
              if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase)
                  throw new Error('convertRadix: carry overflow');
              if (!done)
                  continue;
              else if (!digits[i])
                  pos = i;
              else
                  done = false;
          }
          res.push(carry);
          if (done)
              break;
      }
      for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
          res.push(0);
      return res.reverse();
  }
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  const radix2carry = (from, to) => from + (to - gcd(from, to));
  function convertRadix2(data, from, to, padding) {
      if (!Array.isArray(data))
          throw new Error('convertRadix2: data should be array');
      if (from <= 0 || from > 32)
          throw new Error(`convertRadix2: wrong from=${from}`);
      if (to <= 0 || to > 32)
          throw new Error(`convertRadix2: wrong to=${to}`);
      if (radix2carry(from, to) > 32) {
          throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
      }
      let carry = 0;
      let pos = 0;
      const mask = 2 ** to - 1;
      const res = [];
      for (const n of data) {
          if (n >= 2 ** from)
              throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
          carry = (carry << from) | n;
          if (pos + from > 32)
              throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
          pos += from;
          for (; pos >= to; pos -= to)
              res.push(((carry >> (pos - to)) & mask) >>> 0);
          carry &= 2 ** pos - 1;
      }
      carry = (carry << (to - pos)) & mask;
      if (!padding && pos >= from)
          throw new Error('Excess padding');
      if (!padding && carry)
          throw new Error(`Non-zero padding: ${carry}`);
      if (padding && pos > 0)
          res.push(carry >>> 0);
      return res;
  }
  function radix(num) {
      assertNumber(num);
      return {
          encode: (bytes) => {
              if (!(bytes instanceof Uint8Array))
                  throw new Error('radix.encode input should be Uint8Array');
              return convertRadix(Array.from(bytes), 2 ** 8, num);
          },
          decode: (digits) => {
              if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number'))
                  throw new Error('radix.decode input should be array of strings');
              return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
          },
      };
  }
  function radix2(bits, revPadding = false) {
      assertNumber(bits);
      if (bits <= 0 || bits > 32)
          throw new Error('radix2: bits should be in (0..32]');
      if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32)
          throw new Error('radix2: carry overflow');
      return {
          encode: (bytes) => {
              if (!(bytes instanceof Uint8Array))
                  throw new Error('radix2.encode input should be Uint8Array');
              return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
          },
          decode: (digits) => {
              if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number'))
                  throw new Error('radix2.decode input should be array of strings');
              return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
          },
      };
  }
  function unsafeWrapper(fn) {
      if (typeof fn !== 'function')
          throw new Error('unsafeWrapper fn should be function');
      return function (...args) {
          try {
              return fn.apply(null, args);
          }
          catch (e) { }
      };
  }
  function checksum(len, fn) {
      assertNumber(len);
      if (typeof fn !== 'function')
          throw new Error('checksum fn should be function');
      return {
          encode(data) {
              if (!(data instanceof Uint8Array))
                  throw new Error('checksum.encode: input should be Uint8Array');
              const checksum = fn(data).slice(0, len);
              const res = new Uint8Array(data.length + len);
              res.set(data);
              res.set(checksum, data.length);
              return res;
          },
          decode(data) {
              if (!(data instanceof Uint8Array))
                  throw new Error('checksum.decode: input should be Uint8Array');
              const payload = data.slice(0, -len);
              const newChecksum = fn(payload).slice(0, len);
              const oldChecksum = data.slice(-len);
              for (let i = 0; i < len; i++)
                  if (newChecksum[i] !== oldChecksum[i])
                      throw new Error('Invalid checksum');
              return payload;
          },
      };
  }
  exports.utils = { alphabet, chain, checksum, radix, radix2 };
  exports.base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''));
  exports.base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''));
  exports.base32hex = chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''));
  exports.base32crockford = chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize((s) => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')));
  exports.base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''));
  exports.base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''));
  const genBase58 = (abc) => chain(radix(58), alphabet(abc), join(''));
  exports.base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
  exports.base58flickr = genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');
  exports.base58xrp = genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');
  const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
  exports.base58xmr = {
      encode(data) {
          let res = '';
          for (let i = 0; i < data.length; i += 8) {
              const block = data.subarray(i, i + 8);
              res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1');
          }
          return res;
      },
      decode(str) {
          let res = [];
          for (let i = 0; i < str.length; i += 11) {
              const slice = str.slice(i, i + 11);
              const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
              const block = exports.base58.decode(slice);
              for (let j = 0; j < block.length - blockLen; j++) {
                  if (block[j] !== 0)
                      throw new Error('base58xmr: wrong padding');
              }
              res = res.concat(Array.from(block.slice(block.length - blockLen)));
          }
          return Uint8Array.from(res);
      },
  };
  const base58check = (sha256) => chain(checksum(4, (data) => sha256(sha256(data))), exports.base58);
  exports.base58check = base58check;
  const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''));
  const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  function bech32Polymod(pre) {
      const b = pre >> 25;
      let chk = (pre & 0x1ffffff) << 5;
      for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
          if (((b >> i) & 1) === 1)
              chk ^= POLYMOD_GENERATORS[i];
      }
      return chk;
  }
  function bechChecksum(prefix, words, encodingConst = 1) {
      const len = prefix.length;
      let chk = 1;
      for (let i = 0; i < len; i++) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126)
              throw new Error(`Invalid prefix (${prefix})`);
          chk = bech32Polymod(chk) ^ (c >> 5);
      }
      chk = bech32Polymod(chk);
      for (let i = 0; i < len; i++)
          chk = bech32Polymod(chk) ^ (prefix.charCodeAt(i) & 0x1f);
      for (let v of words)
          chk = bech32Polymod(chk) ^ v;
      for (let i = 0; i < 6; i++)
          chk = bech32Polymod(chk);
      chk ^= encodingConst;
      return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
  }
  function genBech32(encoding) {
      const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
      const _words = radix2(5);
      const fromWords = _words.decode;
      const toWords = _words.encode;
      const fromWordsUnsafe = unsafeWrapper(fromWords);
      function encode(prefix, words, limit = 90) {
          if (typeof prefix !== 'string')
              throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
          if (!Array.isArray(words) || (words.length && typeof words[0] !== 'number'))
              throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
          const actualLength = prefix.length + 7 + words.length;
          if (limit !== false && actualLength > limit)
              throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
          prefix = prefix.toLowerCase();
          return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
      }
      function decode(str, limit = 90) {
          if (typeof str !== 'string')
              throw new Error(`bech32.decode input should be string, not ${typeof str}`);
          if (str.length < 8 || (limit !== false && str.length > limit))
              throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
          const lowered = str.toLowerCase();
          if (str !== lowered && str !== str.toUpperCase())
              throw new Error(`String must be lowercase or uppercase`);
          str = lowered;
          const sepIndex = str.lastIndexOf('1');
          if (sepIndex === 0 || sepIndex === -1)
              throw new Error(`Letter "1" must be present between prefix and data only`);
          const [prefix, _words] = [str.slice(0, sepIndex), str.slice(sepIndex + 1)];
          if (_words.length < 6)
              throw new Error('Data must be at least 6 characters long');
          const words = BECH_ALPHABET.decode(_words).slice(0, -6);
          const sum = bechChecksum(prefix, words, ENCODING_CONST);
          if (!_words.endsWith(sum))
              throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
          return { prefix, words };
      }
      const decodeUnsafe = unsafeWrapper(decode);
      function decodeToBytes(str) {
          const { prefix, words } = decode(str, false);
          return { prefix, words, bytes: fromWords(words) };
      }
      return { encode, decode, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords };
  }
  exports.bech32 = genBech32('bech32');
  exports.bech32m = genBech32('bech32m');
  exports.utf8 = {
      encode: (data) => new TextDecoder().decode(data),
      decode: (str) => new TextEncoder().encode(str),
  };
  exports.hex = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize((s) => {
      if (typeof s !== 'string' || s.length % 2)
          throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
      return s.toLowerCase();
  }));
  const CODERS = {
      utf8: exports.utf8, hex: exports.hex, base16: exports.base16, base32: exports.base32, base64: exports.base64, base64url: exports.base64url, base58: exports.base58, base58xmr: exports.base58xmr
  };
  const coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(', ')}`;
  const bytesToString = (type, bytes) => {
      if (typeof type !== 'string' || !CODERS.hasOwnProperty(type))
          throw new TypeError(coderTypeError);
      if (!(bytes instanceof Uint8Array))
          throw new TypeError('bytesToString() expects Uint8Array');
      return CODERS[type].encode(bytes);
  };
  exports.bytesToString = bytesToString;
  exports.str = exports.bytesToString;
  const stringToBytes = (type, str) => {
      if (!CODERS.hasOwnProperty(type))
          throw new TypeError(coderTypeError);
      if (typeof str !== 'string')
          throw new TypeError('stringToBytes() expects string');
      return CODERS[type].decode(str);
  };
  exports.stringToBytes = stringToBytes;
  exports.bytes = exports.stringToBytes;
  }(microBase));
  getDefaultExportFromCjs(microBase);

  function createDecode({
    coder,
    ipfs
  }, validate) {
    return (value, ipfsCompat) => {
      validate(value, ipfsCompat);
      return coder.decode(ipfs && ipfsCompat ? value.substr(1) : value);
    };
  }
  function createEncode({
    coder,
    ipfs
  }) {
    return (value, ipfsCompat) => {
      const out = coder.encode(util.u8aToU8a(value));
      return ipfs && ipfsCompat ? `${ipfs}${out}` : out;
    };
  }
  function createIs(validate) {
    return (value, ipfsCompat) => {
      try {
        return validate(value, ipfsCompat);
      } catch (error) {
        return false;
      }
    };
  }
  function createValidate({
    chars,
    ipfs,
    type
  }) {
    return (value, ipfsCompat) => {
      util.assert(value && typeof value === 'string', () => `Expected non-null, non-empty ${type} string input`);
      if (ipfs && ipfsCompat) {
        util.assert(value[0] === ipfs, () => `Expected ipfs-compatible ${type} to start with '${ipfs}'`);
      }
      for (let i = ipfsCompat ? 1 : 0; i < value.length; i++) {
        util.assert(chars.includes(value[i]) || value[i] === '=' && (i === value.length - 1 || !chars.includes(value[i + 1])), () => `Invalid ${type} character "${value[i]}" (0x${value.charCodeAt(i).toString(16)}) at index ${i}`);
      }
      return true;
    };
  }

  const config$2 = {
    chars: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
    coder: microBase.base58,
    ipfs: 'z',
    type: 'base58'
  };
  const base58Validate = createValidate(config$2);
  const base58Decode = createDecode(config$2, base58Validate);
  const base58Encode = createEncode(config$2);
  const isBase58 = createIs(base58Validate);

  const SIGMA = new Uint8Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
      11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
      7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
      9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
      2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
      12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
      13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
      6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
      10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  ]);
  class BLAKE2 extends Hash {
      constructor(blockLen, outputLen, opts = {}, keyLen, saltLen, persLen) {
          super();
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.length = 0;
          this.pos = 0;
          this.finished = false;
          this.destroyed = false;
          assertNumber(blockLen);
          assertNumber(outputLen);
          assertNumber(keyLen);
          if (outputLen < 0 || outputLen > keyLen)
              throw new Error('Blake2: outputLen bigger than keyLen');
          if (opts.key !== undefined && (opts.key.length < 1 || opts.key.length > keyLen))
              throw new Error(`Key should be up 1..${keyLen} byte long or undefined`);
          if (opts.salt !== undefined && opts.salt.length !== saltLen)
              throw new Error(`Salt should be ${saltLen} byte long or undefined`);
          if (opts.personalization !== undefined && opts.personalization.length !== persLen)
              throw new Error(`Personalization should be ${persLen} byte long or undefined`);
          this.buffer32 = u32((this.buffer = new Uint8Array(blockLen)));
      }
      update(data) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          const { finished, blockLen, buffer, buffer32 } = this;
          if (finished)
              throw new Error('digest() was already called');
          data = toBytes(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
              if (this.pos === blockLen) {
                  this.compress(buffer32, 0, false);
                  this.pos = 0;
              }
              const take = Math.min(blockLen - this.pos, len - pos);
              const dataOffset = data.byteOffset + pos;
              if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
                  const data32 = new Uint32Array(data.buffer, dataOffset, Math.floor((len - pos) / 4));
                  for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
                      this.length += blockLen;
                      this.compress(data32, pos32, false);
                  }
                  continue;
              }
              buffer.set(data.subarray(pos, pos + take), this.pos);
              this.pos += take;
              this.length += take;
              pos += take;
          }
          return this;
      }
      digestInto(out) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          if (!(out instanceof Uint8Array) || out.length < this.outputLen)
              throw new Error('_Blake2: Invalid output buffer');
          const { finished, pos, buffer32 } = this;
          if (finished)
              throw new Error('digest() was already called');
          this.finished = true;
          this.buffer.subarray(pos).fill(0);
          this.compress(buffer32, 0, true);
          const out32 = u32(out);
          this.get().forEach((v, i) => (out32[i] = v));
      }
      digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
      }
      _cloneInto(to) {
          const { buffer, length, finished, destroyed, outputLen, pos } = this;
          to || (to = new this.constructor({ dkLen: outputLen }));
          to.set(...this.get());
          to.length = length;
          to.finished = finished;
          to.destroyed = destroyed;
          to.outputLen = outputLen;
          to.buffer.set(buffer);
          to.pos = pos;
          return to;
      }
  }

  const IV = new Uint32Array([
      0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a,
      0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c, 0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19
  ]);
  const BUF = new Uint32Array(32);
  function G1(a, b, c, d, msg, x) {
      const Xl = msg[x], Xh = msg[x + 1];
      let Al = BUF[2 * a], Ah = BUF[2 * a + 1];
      let Bl = BUF[2 * b], Bh = BUF[2 * b + 1];
      let Cl = BUF[2 * c], Ch = BUF[2 * c + 1];
      let Dl = BUF[2 * d], Dh = BUF[2 * d + 1];
      let ll = add3L(Al, Bl, Xl);
      Ah = add3H(ll, Ah, Bh, Xh);
      Al = ll | 0;
      ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
      ({ Dh, Dl } = { Dh: rotr32H(Dh, Dl), Dl: rotr32L(Dh) });
      ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
      ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
      ({ Bh, Bl } = { Bh: rotrSH(Bh, Bl, 24), Bl: rotrSL(Bh, Bl, 24) });
      (BUF[2 * a] = Al), (BUF[2 * a + 1] = Ah);
      (BUF[2 * b] = Bl), (BUF[2 * b + 1] = Bh);
      (BUF[2 * c] = Cl), (BUF[2 * c + 1] = Ch);
      (BUF[2 * d] = Dl), (BUF[2 * d + 1] = Dh);
  }
  function G2(a, b, c, d, msg, x) {
      const Xl = msg[x], Xh = msg[x + 1];
      let Al = BUF[2 * a], Ah = BUF[2 * a + 1];
      let Bl = BUF[2 * b], Bh = BUF[2 * b + 1];
      let Cl = BUF[2 * c], Ch = BUF[2 * c + 1];
      let Dl = BUF[2 * d], Dh = BUF[2 * d + 1];
      let ll = add3L(Al, Bl, Xl);
      Ah = add3H(ll, Ah, Bh, Xh);
      Al = ll | 0;
      ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
      ({ Dh, Dl } = { Dh: rotrSH(Dh, Dl, 16), Dl: rotrSL(Dh, Dl, 16) });
      ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
      ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
      ({ Bh, Bl } = { Bh: rotrBH(Bh, Bl, 63), Bl: rotrBL(Bh, Bl, 63) });
      (BUF[2 * a] = Al), (BUF[2 * a + 1] = Ah);
      (BUF[2 * b] = Bl), (BUF[2 * b + 1] = Bh);
      (BUF[2 * c] = Cl), (BUF[2 * c + 1] = Ch);
      (BUF[2 * d] = Dl), (BUF[2 * d + 1] = Dh);
  }
  class BLAKE2b extends BLAKE2 {
      constructor(opts = {}) {
          super(128, opts.dkLen === undefined ? 64 : opts.dkLen, opts, 64, 16, 16);
          this.v0l = IV[0] | 0;
          this.v0h = IV[1] | 0;
          this.v1l = IV[2] | 0;
          this.v1h = IV[3] | 0;
          this.v2l = IV[4] | 0;
          this.v2h = IV[5] | 0;
          this.v3l = IV[6] | 0;
          this.v3h = IV[7] | 0;
          this.v4l = IV[8] | 0;
          this.v4h = IV[9] | 0;
          this.v5l = IV[10] | 0;
          this.v5h = IV[11] | 0;
          this.v6l = IV[12] | 0;
          this.v6h = IV[13] | 0;
          this.v7l = IV[14] | 0;
          this.v7h = IV[15] | 0;
          const keyLength = opts.key ? opts.key.length : 0;
          this.v0l ^= this.outputLen | (keyLength << 8) | (0x01 << 16) | (0x01 << 24);
          if (opts.salt) {
              const salt = u32(toBytes(opts.salt));
              this.v4l ^= salt[0];
              this.v4h ^= salt[1];
              this.v5l ^= salt[2];
              this.v5h ^= salt[3];
          }
          if (opts.personalization) {
              const pers = u32(toBytes(opts.personalization));
              this.v6l ^= pers[0];
              this.v6h ^= pers[1];
              this.v7l ^= pers[2];
              this.v7h ^= pers[3];
          }
          if (opts.key) {
              const tmp = new Uint8Array(this.blockLen);
              tmp.set(toBytes(opts.key));
              this.update(tmp);
          }
      }
      get() {
          let { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
          return [v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h];
      }
      set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
          this.v0l = v0l | 0;
          this.v0h = v0h | 0;
          this.v1l = v1l | 0;
          this.v1h = v1h | 0;
          this.v2l = v2l | 0;
          this.v2h = v2h | 0;
          this.v3l = v3l | 0;
          this.v3h = v3h | 0;
          this.v4l = v4l | 0;
          this.v4h = v4h | 0;
          this.v5l = v5l | 0;
          this.v5h = v5h | 0;
          this.v6l = v6l | 0;
          this.v6h = v6h | 0;
          this.v7l = v7l | 0;
          this.v7h = v7h | 0;
      }
      compress(msg, offset, isLast) {
          this.get().forEach((v, i) => (BUF[i] = v));
          BUF.set(IV, 16);
          let { h, l } = fromBig(BigInt(this.length));
          BUF[24] = IV[8] ^ l;
          BUF[25] = IV[9] ^ h;
          if (isLast) {
              BUF[28] = ~BUF[28];
              BUF[29] = ~BUF[29];
          }
          let j = 0;
          const s = SIGMA;
          for (let i = 0; i < 12; i++) {
              G1(0, 4, 8, 12, msg, offset + 2 * s[j++]);
              G2(0, 4, 8, 12, msg, offset + 2 * s[j++]);
              G1(1, 5, 9, 13, msg, offset + 2 * s[j++]);
              G2(1, 5, 9, 13, msg, offset + 2 * s[j++]);
              G1(2, 6, 10, 14, msg, offset + 2 * s[j++]);
              G2(2, 6, 10, 14, msg, offset + 2 * s[j++]);
              G1(3, 7, 11, 15, msg, offset + 2 * s[j++]);
              G2(3, 7, 11, 15, msg, offset + 2 * s[j++]);
              G1(0, 5, 10, 15, msg, offset + 2 * s[j++]);
              G2(0, 5, 10, 15, msg, offset + 2 * s[j++]);
              G1(1, 6, 11, 12, msg, offset + 2 * s[j++]);
              G2(1, 6, 11, 12, msg, offset + 2 * s[j++]);
              G1(2, 7, 8, 13, msg, offset + 2 * s[j++]);
              G2(2, 7, 8, 13, msg, offset + 2 * s[j++]);
              G1(3, 4, 9, 14, msg, offset + 2 * s[j++]);
              G2(3, 4, 9, 14, msg, offset + 2 * s[j++]);
          }
          this.v0l ^= BUF[0] ^ BUF[16];
          this.v0h ^= BUF[1] ^ BUF[17];
          this.v1l ^= BUF[2] ^ BUF[18];
          this.v1h ^= BUF[3] ^ BUF[19];
          this.v2l ^= BUF[4] ^ BUF[20];
          this.v2h ^= BUF[5] ^ BUF[21];
          this.v3l ^= BUF[6] ^ BUF[22];
          this.v3h ^= BUF[7] ^ BUF[23];
          this.v4l ^= BUF[8] ^ BUF[24];
          this.v4h ^= BUF[9] ^ BUF[25];
          this.v5l ^= BUF[10] ^ BUF[26];
          this.v5h ^= BUF[11] ^ BUF[27];
          this.v6l ^= BUF[12] ^ BUF[28];
          this.v6h ^= BUF[13] ^ BUF[29];
          this.v7l ^= BUF[14] ^ BUF[30];
          this.v7h ^= BUF[15] ^ BUF[31];
          BUF.fill(0);
      }
      destroy() {
          this.destroyed = true;
          this.buffer32.fill(0);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
  }
  const blake2b = wrapConstructorWithOpts((opts) => new BLAKE2b(opts));

  function createAsHex(fn) {
    return (...args) => util.u8aToHex(fn(...args));
  }
  function createBitHasher(bitLength, fn) {
    return (data, onlyJs) => fn(data, bitLength, onlyJs);
  }
  function createDualHasher(wa, js) {
    return (value, bitLength = 256, onlyJs) => {
      const u8a = util.u8aToU8a(value);
      return !util.hasBigInt || !onlyJs && isReady() ? wa[bitLength](u8a) : js[bitLength](u8a);
    };
  }

  function blake2AsU8a(data, bitLength = 256, key, onlyJs) {
    const byteLength = Math.ceil(bitLength / 8);
    const u8a = util.u8aToU8a(data);
    return !util.hasBigInt || !onlyJs && isReady() ? blake2b$1(u8a, util.u8aToU8a(key), byteLength) : blake2b(u8a, {
      dkLen: byteLength,
      key: key || undefined
    });
  }
  const blake2AsHex = createAsHex(blake2AsU8a);

  const SS58_PREFIX = util.stringToU8a('SS58PRE');
  function sshash(key) {
    return blake2AsU8a(util.u8aConcat(SS58_PREFIX, key), 512);
  }

  function checkAddressChecksum(decoded) {
    const ss58Length = decoded[0] & 0b01000000 ? 2 : 1;
    const ss58Decoded = ss58Length === 1 ? decoded[0] : (decoded[0] & 0b00111111) << 2 | decoded[1] >> 6 | (decoded[1] & 0b00111111) << 8;
    const isPublicKey = [34 + ss58Length, 35 + ss58Length].includes(decoded.length);
    const length = decoded.length - (isPublicKey ? 2 : 1);
    const hash = sshash(decoded.subarray(0, length));
    const isValid = (decoded[0] & 0b10000000) === 0 && ![46, 47].includes(decoded[0]) && (isPublicKey ? decoded[decoded.length - 2] === hash[0] && decoded[decoded.length - 1] === hash[1] : decoded[decoded.length - 1] === hash[0]);
    return [isValid, length, ss58Length, ss58Decoded];
  }

  const knownGenesis = {
    acala: ['0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c'],
    bifrost: ['0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed'],
    centrifuge: ['0x67dddf2673b69e5f875f6f25277495834398eafd67f492e09f3f3345e003d1b5'],
    'dock-mainnet': ['0xf73467c6544aa68df2ee546b135f955c46b90fa627e9b5d7935f41061bb8a5a9'],
    edgeware: ['0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b'],
    equilibrium: ['0x6f1a800de3daff7f5e037ddf66ab22ce03ab91874debeddb1086f5f7dbd48925'],
    genshiro: ['0x9b8cefc0eb5c568b527998bdd76c184e2b76ae561be76e4667072230217ea243'],
    hydradx: ['0xd2a620c27ec5cbc5621ff9a522689895074f7cca0d08e7134a7804e1a3ba86fc',
    '0x10af6e84234477d84dc572bac0789813b254aa490767ed06fb9591191d1073f9',
    '0x3d75507dd46301767e601265791da1d9cb47b6ebc94e87347b635e5bf58bd047',
    '0x0ed32bfcab4a83517fac88f2aa7cbc2f88d3ab93be9a12b6188a036bf8a943c2'
    ],
    karura: ['0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b'],
    kulupu: ['0xf7a99d3cb92853d00d5275c971c132c074636256583fee53b3bbe60d7b8769ba'],
    kusama: ['0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    '0xe3777fa922cafbff200cadeaea1a76bd7898ad5b89f7848999058b50e715f636',
    '0x3fd7b9eb6a00376e5be61f01abb429ffb0b104be05eaff4d458da48fcd425baf'
    ],
    'nodle-chain': ['0xa3d114c2b8d0627c1aa9b134eafcf7d05ca561fdc19fb388bb9457f81809fb23'],
    picasso: ['0xe8e7f0f4c4f5a00720b4821dbfddefea7490bcf0b19009961cc46957984e2c1c'],
    plasm: ['0x3e86364d4b4894021cb2a0390bcf2feb5517d5292f2de2bb9404227e908b0b8b'],
    polkadot: ['0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'],
    polymesh: ['0x6fbd74e5e1d0a61d52ccfe9d4adaed16dd3a7caa37c6bc4d0c2fa12e8b2f4063'],
    sora: ['0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5'],
    stafi: ['0x290a4149f09ea0e402c74c1c7e96ae4239588577fe78932f94f5404c68243d80'],
    statemine: ['0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a'],
    subsocial: ['0x0bd72c1c305172e1275278aaeb3f161e02eccb7a819e63f62d47bd53a28189f8']
  };
  const knownIcon = {
    centrifuge: 'polkadot',
    kusama: 'polkadot',
    polkadot: 'polkadot',
    sora: 'polkadot',
    statemine: 'polkadot',
    statemint: 'polkadot',
    westmint: 'polkadot'
  };
  const knownLedger = {
    bifrost: 0x00000314,
    centrifuge: 0x000002eb,
    'dock-mainnet': 0x00000252,
    edgeware: 0x0000020b,
    equilibrium: 0x05f5e0fd,
    genshiro: 0x05f5e0fc,
    kusama: 0x000001b2,
    'nodle-chain': 0x000003eb,
    polkadot: 0x00000162,
    polymesh: 0x00000253,
    sora: 0x00000269,
    statemine: 0x000001b2
  };
  const knownTestnet = {
    '': true,
    'cess-testnet': true,
    'dock-testnet': true,
    jupiter: true,
    'mathchain-testnet': true,
    subspace_testnet: true,
    'zero-alphaville': true
  };

  const knownSubstrate = [{
    decimals: [10],
    displayName: 'Polkadot Relay Chain',
    network: 'polkadot',
    prefix: 0,
    standardAccount: '*25519',
    symbols: ['DOT'],
    website: 'https://polkadot.network'
  }, {
    decimals: null,
    displayName: 'Bare 32-bit Schnorr/Ristretto (S/R 25519) public key.',
    network: 'BareSr25519',
    prefix: 1,
    standardAccount: 'Sr25519',
    symbols: null,
    website: null
  }, {
    decimals: [12],
    displayName: 'Kusama Relay Chain',
    network: 'kusama',
    prefix: 2,
    standardAccount: '*25519',
    symbols: ['KSM'],
    website: 'https://kusama.network'
  }, {
    decimals: null,
    displayName: 'Bare 32-bit Ed25519 public key.',
    network: 'BareEd25519',
    prefix: 3,
    standardAccount: 'Ed25519',
    symbols: null,
    website: null
  }, {
    decimals: null,
    displayName: 'Katal Chain',
    network: 'katalchain',
    prefix: 4,
    standardAccount: '*25519',
    symbols: null,
    website: null
  }, {
    decimals: [15],
    displayName: 'Plasm Network',
    network: 'plasm',
    prefix: 5,
    standardAccount: '*25519',
    symbols: ['PLM'],
    website: 'https://plasmnet.io'
  }, {
    decimals: [12],
    displayName: 'Bifrost',
    network: 'bifrost',
    prefix: 6,
    standardAccount: '*25519',
    symbols: ['BNC'],
    website: 'https://bifrost.finance/'
  }, {
    decimals: [18],
    displayName: 'Edgeware',
    network: 'edgeware',
    prefix: 7,
    standardAccount: '*25519',
    symbols: ['EDG'],
    website: 'https://edgewa.re'
  }, {
    decimals: [12],
    displayName: 'Karura',
    network: 'karura',
    prefix: 8,
    standardAccount: '*25519',
    symbols: ['KAR'],
    website: 'https://karura.network/'
  }, {
    decimals: [18],
    displayName: 'Laminar Reynolds Canary',
    network: 'reynolds',
    prefix: 9,
    standardAccount: '*25519',
    symbols: ['REY'],
    website: 'http://laminar.network/'
  }, {
    decimals: [12],
    displayName: 'Acala',
    network: 'acala',
    prefix: 10,
    standardAccount: '*25519',
    symbols: ['ACA'],
    website: 'https://acala.network/'
  }, {
    decimals: [18],
    displayName: 'Laminar',
    network: 'laminar',
    prefix: 11,
    standardAccount: '*25519',
    symbols: ['LAMI'],
    website: 'http://laminar.network/'
  }, {
    decimals: [6],
    displayName: 'Polymesh',
    network: 'polymesh',
    prefix: 12,
    standardAccount: '*25519',
    symbols: ['POLYX'],
    website: 'https://polymath.network/'
  }, {
    decimals: [12],
    displayName: 'Integritee',
    network: 'integritee',
    prefix: 13,
    standardAccount: '*25519',
    symbols: ['TEER'],
    website: 'https://integritee.network'
  }, {
    decimals: [0],
    displayName: 'Totem',
    network: 'totem',
    prefix: 14,
    standardAccount: '*25519',
    symbols: ['TOTEM'],
    website: 'https://totemaccounting.com'
  }, {
    decimals: [12],
    displayName: 'Synesthesia',
    network: 'synesthesia',
    prefix: 15,
    standardAccount: '*25519',
    symbols: ['SYN'],
    website: 'https://synesthesia.network/'
  }, {
    decimals: [12],
    displayName: 'Kulupu',
    network: 'kulupu',
    prefix: 16,
    standardAccount: '*25519',
    symbols: ['KLP'],
    website: 'https://kulupu.network/'
  }, {
    decimals: null,
    displayName: 'Dark Mainnet',
    network: 'dark',
    prefix: 17,
    standardAccount: '*25519',
    symbols: null,
    website: null
  }, {
    decimals: [9, 9],
    displayName: 'Darwinia Network',
    network: 'darwinia',
    prefix: 18,
    standardAccount: '*25519',
    symbols: ['RING', 'KTON'],
    website: 'https://darwinia.network/'
  }, {
    decimals: [12],
    displayName: 'GeekCash',
    network: 'geek',
    prefix: 19,
    standardAccount: '*25519',
    symbols: ['GEEK'],
    website: 'https://geekcash.org'
  }, {
    decimals: [12],
    displayName: 'Stafi',
    network: 'stafi',
    prefix: 20,
    standardAccount: '*25519',
    symbols: ['FIS'],
    website: 'https://stafi.io'
  }, {
    decimals: [6],
    displayName: 'Dock Testnet',
    network: 'dock-testnet',
    prefix: 21,
    standardAccount: '*25519',
    symbols: ['DCK'],
    website: 'https://dock.io'
  }, {
    decimals: [6],
    displayName: 'Dock Mainnet',
    network: 'dock-mainnet',
    prefix: 22,
    standardAccount: '*25519',
    symbols: ['DCK'],
    website: 'https://dock.io'
  }, {
    decimals: null,
    displayName: 'ShiftNrg',
    network: 'shift',
    prefix: 23,
    standardAccount: '*25519',
    symbols: null,
    website: null
  }, {
    decimals: [18],
    displayName: 'ZERO',
    network: 'zero',
    prefix: 24,
    standardAccount: '*25519',
    symbols: ['PLAY'],
    website: 'https://zero.io'
  }, {
    decimals: [18],
    displayName: 'ZERO Alphaville',
    network: 'zero-alphaville',
    prefix: 25,
    standardAccount: '*25519',
    symbols: ['PLAY'],
    website: 'https://zero.io'
  }, {
    decimals: [10],
    displayName: 'Jupiter',
    network: 'jupiter',
    prefix: 26,
    standardAccount: '*25519',
    symbols: ['jDOT'],
    website: 'https://jupiter.patract.io'
  }, {
    decimals: null,
    displayName: 'Subsocial',
    network: 'subsocial',
    prefix: 28,
    standardAccount: '*25519',
    symbols: null,
    website: null
  }, {
    decimals: [12, 12],
    displayName: 'CORD Network',
    network: 'cord',
    prefix: 29,
    standardAccount: '*25519',
    symbols: ['DHI', 'WAY'],
    website: 'https://cord.network/'
  }, {
    decimals: [12],
    displayName: 'Phala Network',
    network: 'phala',
    prefix: 30,
    standardAccount: '*25519',
    symbols: ['PHA'],
    website: 'https://phala.network'
  }, {
    decimals: [12],
    displayName: 'Litentry Network',
    network: 'litentry',
    prefix: 31,
    standardAccount: '*25519',
    symbols: ['LIT'],
    website: 'https://litentry.com/'
  }, {
    decimals: [9],
    displayName: 'Robonomics',
    network: 'robonomics',
    prefix: 32,
    standardAccount: '*25519',
    symbols: ['XRT'],
    website: 'https://robonomics.network'
  }, {
    decimals: null,
    displayName: 'DataHighway',
    network: 'datahighway',
    prefix: 33,
    standardAccount: '*25519',
    symbols: null,
    website: null
  }, {
    decimals: [12],
    displayName: 'Ares Protocol',
    network: 'ares',
    prefix: 34,
    standardAccount: '*25519',
    symbols: ['ARES'],
    website: 'https://www.aresprotocol.com/'
  }, {
    decimals: [15],
    displayName: 'Valiu Liquidity Network',
    network: 'vln',
    prefix: 35,
    standardAccount: '*25519',
    symbols: ['USDv'],
    website: 'https://valiu.com/'
  }, {
    decimals: [18],
    displayName: 'Centrifuge Chain',
    network: 'centrifuge',
    prefix: 36,
    standardAccount: '*25519',
    symbols: ['CFG'],
    website: 'https://centrifuge.io/'
  }, {
    decimals: [18],
    displayName: 'Nodle Chain',
    network: 'nodle',
    prefix: 37,
    standardAccount: '*25519',
    symbols: ['NODL'],
    website: 'https://nodle.io/'
  }, {
    decimals: [18],
    displayName: 'KILT Chain',
    network: 'kilt',
    prefix: 38,
    standardAccount: '*25519',
    symbols: ['KILT'],
    website: 'https://kilt.io/'
  }, {
    decimals: [18],
    displayName: 'MathChain mainnet',
    network: 'mathchain',
    prefix: 39,
    standardAccount: '*25519',
    symbols: ['MATH'],
    website: 'https://mathwallet.org'
  }, {
    decimals: [18],
    displayName: 'MathChain testnet',
    network: 'mathchain-testnet',
    prefix: 40,
    standardAccount: '*25519',
    symbols: ['MATH'],
    website: 'https://mathwallet.org'
  }, {
    decimals: null,
    displayName: 'Polimec Chain',
    network: 'poli',
    prefix: 41,
    standardAccount: '*25519',
    symbols: null,
    website: 'https://polimec.io/'
  }, {
    decimals: null,
    displayName: 'Substrate',
    network: 'substrate',
    prefix: 42,
    standardAccount: '*25519',
    symbols: null,
    website: 'https://substrate.io/'
  }, {
    decimals: null,
    displayName: 'Bare 32-bit ECDSA SECP-256k1 public key.',
    network: 'BareSecp256k1',
    prefix: 43,
    standardAccount: 'secp256k1',
    symbols: null,
    website: null
  }, {
    decimals: [8],
    displayName: 'ChainX',
    network: 'chainx',
    prefix: 44,
    standardAccount: '*25519',
    symbols: ['PCX'],
    website: 'https://chainx.org/'
  }, {
    decimals: [12, 12],
    displayName: 'UniArts Network',
    network: 'uniarts',
    prefix: 45,
    standardAccount: '*25519',
    symbols: ['UART', 'UINK'],
    website: 'https://uniarts.me'
  }, {
    decimals: null,
    displayName: 'This prefix is reserved.',
    network: 'reserved46',
    prefix: 46,
    standardAccount: null,
    symbols: null,
    website: null
  }, {
    decimals: null,
    displayName: 'This prefix is reserved.',
    network: 'reserved47',
    prefix: 47,
    standardAccount: null,
    symbols: null,
    website: null
  }, {
    decimals: [12],
    displayName: 'Neatcoin Mainnet',
    network: 'neatcoin',
    prefix: 48,
    standardAccount: '*25519',
    symbols: ['NEAT'],
    website: 'https://neatcoin.org'
  }, {
    decimals: [12],
    displayName: 'Picasso',
    network: 'picasso',
    prefix: 49,
    standardAccount: '*25519',
    symbols: ['PICA'],
    website: 'https://picasso.composable.finance'
  }, {
    decimals: [12],
    displayName: 'Composable',
    network: 'composable',
    prefix: 50,
    standardAccount: '*25519',
    symbols: ['LAYR'],
    website: 'https://composable.finance'
  }, {
    decimals: [9],
    displayName: 'xx network',
    network: 'xxnetwork',
    prefix: 55,
    standardAccount: '*25519',
    symbols: ['XX'],
    website: 'https://xx.network'
  }, {
    decimals: [12],
    displayName: 'HydraDX',
    network: 'hydradx',
    prefix: 63,
    standardAccount: '*25519',
    symbols: ['HDX'],
    website: 'https://hydradx.io'
  }, {
    decimals: [18],
    displayName: 'AvN Mainnet',
    network: 'aventus',
    prefix: 65,
    standardAccount: '*25519',
    symbols: ['AVT'],
    website: 'https://aventus.io'
  }, {
    decimals: [12],
    displayName: 'Crust Network',
    network: 'crust',
    prefix: 66,
    standardAccount: '*25519',
    symbols: ['CRU'],
    website: 'https://crust.network'
  }, {
    decimals: [9, 9, 9],
    displayName: 'Genshiro Network',
    network: 'genshiro',
    prefix: 67,
    standardAccount: '*25519',
    symbols: ['GENS', 'EQD', 'LPT0'],
    website: 'https://genshiro.equilibrium.io'
  }, {
    decimals: [9],
    displayName: 'Equilibrium Network',
    network: 'equilibrium',
    prefix: 68,
    standardAccount: '*25519',
    symbols: ['EQ'],
    website: 'https://equilibrium.io'
  }, {
    decimals: [18],
    displayName: 'SORA Network',
    network: 'sora',
    prefix: 69,
    standardAccount: '*25519',
    symbols: ['XOR'],
    website: 'https://sora.org'
  }, {
    decimals: [10],
    displayName: 'Zeitgeist',
    network: 'zeitgeist',
    prefix: 73,
    standardAccount: '*25519',
    symbols: ['ZTG'],
    website: 'https://zeitgeist.pm'
  }, {
    decimals: [18],
    displayName: 'Manta network',
    network: 'manta',
    prefix: 77,
    standardAccount: '*25519',
    symbols: ['MANTA'],
    website: 'https://manta.network'
  }, {
    decimals: [12],
    displayName: 'Calamari: Manta Canary Network',
    network: 'calamari',
    prefix: 78,
    standardAccount: '*25519',
    symbols: ['KMA'],
    website: 'https://manta.network'
  }, {
    decimals: [12],
    displayName: 'Polkadex Mainnet',
    network: 'polkadex',
    prefix: 88,
    standardAccount: '*25519',
    symbols: ['PDEX'],
    website: 'https://polkadex.trade'
  }, {
    decimals: [18],
    displayName: 'PolkaSmith Canary Network',
    network: 'polkasmith',
    prefix: 98,
    standardAccount: '*25519',
    symbols: ['PKS'],
    website: 'https://polkafoundry.com'
  }, {
    decimals: [18],
    displayName: 'PolkaFoundry Network',
    network: 'polkafoundry',
    prefix: 99,
    standardAccount: '*25519',
    symbols: ['PKF'],
    website: 'https://polkafoundry.com'
  }, {
    decimals: [18],
    displayName: 'OriginTrail Parachain',
    network: 'origintrail-parachain',
    prefix: 101,
    standardAccount: 'secp256k1',
    symbols: ['TRAC'],
    website: 'https://origintrail.io'
  }, {
    decimals: [10],
    displayName: 'Pontem Network',
    network: 'pontem-network',
    prefix: 105,
    standardAccount: '*25519',
    symbols: ['PONT'],
    website: 'https://pontem.network'
  }, {
    decimals: [12],
    displayName: 'Heiko',
    network: 'heiko',
    prefix: 110,
    standardAccount: '*25519',
    symbols: ['HKO'],
    website: 'https://parallel.fi/'
  }, {
    decimals: null,
    displayName: 'Integritee Incognito',
    network: 'integritee-incognito',
    prefix: 113,
    standardAccount: '*25519',
    symbols: null,
    website: 'https://integritee.network'
  }, {
    decimals: [18],
    displayName: 'Clover Finance',
    network: 'clover',
    prefix: 128,
    standardAccount: '*25519',
    symbols: ['CLV'],
    website: 'https://clover.finance'
  }, {
    decimals: [18],
    displayName: 'Altair',
    network: 'altair',
    prefix: 136,
    standardAccount: '*25519',
    symbols: ['AIR'],
    website: 'https://centrifuge.io/'
  }, {
    decimals: [12],
    displayName: 'Parallel',
    network: 'parallel',
    prefix: 172,
    standardAccount: '*25519',
    symbols: ['PARA'],
    website: 'https://parallel.fi/'
  }, {
    decimals: [18],
    displayName: 'Social Network',
    network: 'social-network',
    prefix: 252,
    standardAccount: '*25519',
    symbols: ['NET'],
    website: 'https://social.network'
  }, {
    decimals: [15],
    displayName: 'QUARTZ by UNIQUE',
    network: 'quartz_mainnet',
    prefix: 255,
    standardAccount: '*25519',
    symbols: ['QTZ'],
    website: 'https://unique.network'
  }, {
    decimals: [18],
    displayName: 'Pioneer Network by Bit.Country',
    network: 'pioneer_network',
    prefix: 268,
    standardAccount: '*25519',
    symbols: ['NEER'],
    website: 'https://bit.country'
  }, {
    decimals: [18],
    displayName: 'Efinity',
    network: 'efinity',
    prefix: 1110,
    standardAccount: 'Sr25519',
    symbols: ['EFI'],
    website: 'https://efinity.io/'
  }, {
    decimals: [18],
    displayName: 'Moonbeam',
    network: 'moonbeam',
    prefix: 1284,
    standardAccount: 'secp256k1',
    symbols: ['GLMR'],
    website: 'https://moonbeam.network'
  }, {
    decimals: [18],
    displayName: 'Moonriver',
    network: 'moonriver',
    prefix: 1285,
    standardAccount: 'secp256k1',
    symbols: ['MOVR'],
    website: 'https://moonbeam.network'
  }, {
    decimals: [12],
    displayName: 'Kapex',
    network: 'kapex',
    prefix: 2007,
    standardAccount: '*25519',
    symbols: ['KAPEX'],
    website: 'https://totemaccounting.com'
  }, {
    decimals: [10],
    displayName: 'Interlay',
    network: 'interlay',
    prefix: 2032,
    standardAccount: '*25519',
    symbols: ['INTR'],
    website: 'https://interlay.io/'
  }, {
    decimals: [12],
    displayName: 'Kintsugi',
    network: 'kintsugi',
    prefix: 2092,
    standardAccount: '*25519',
    symbols: ['KINT'],
    website: 'https://interlay.io/'
  }, {
    decimals: [18],
    displayName: 'Subspace testnet',
    network: 'subspace_testnet',
    prefix: 2254,
    standardAccount: '*25519',
    symbols: ['tSSC'],
    website: 'https://subspace.network'
  }, {
    decimals: [18],
    displayName: 'Subspace',
    network: 'subspace',
    prefix: 6094,
    standardAccount: '*25519',
    symbols: ['SSC'],
    website: 'https://subspace.network'
  }, {
    decimals: [12],
    displayName: 'Basilisk',
    network: 'basilisk',
    prefix: 10041,
    standardAccount: '*25519',
    symbols: ['BSX'],
    website: 'https://bsx.fi'
  }, {
    decimals: [12],
    displayName: 'CESS Testnet',
    network: 'cess-testnet',
    prefix: 11330,
    standardAccount: '*25519',
    symbols: ['TCESS'],
    website: 'https://cess.cloud'
  }, {
    decimals: [12],
    displayName: 'CESS',
    network: 'cess',
    prefix: 11331,
    standardAccount: '*25519',
    symbols: ['CESS'],
    website: 'https://cess.cloud'
  }, {
    decimals: [18],
    displayName: 'Automata ContextFree',
    network: 'contextfree',
    prefix: 11820,
    standardAccount: '*25519',
    symbols: ['CTX'],
    website: 'https://ata.network'
  }];

  const UNSORTED = [0, 2, 42];
  const TESTNETS = ['testnet'];
  function toExpanded(o) {
    const network = o.network || '';
    const nameParts = network.replace(/_/g, '-').split('-');
    const n = o;
    n.slip44 = knownLedger[network];
    n.hasLedgerSupport = !!n.slip44;
    n.genesisHash = knownGenesis[network] || [];
    n.icon = knownIcon[network] || 'substrate';
    n.isTestnet = !!knownTestnet[network] || TESTNETS.includes(nameParts[nameParts.length - 1]);
    n.isIgnored = n.isTestnet || !(o.standardAccount && o.decimals && o.symbols) && o.prefix !== 42;
    return n;
  }
  function filterSelectable({
    genesisHash,
    prefix
  }) {
    return !!genesisHash.length || prefix === 42;
  }
  function filterAvailable(n) {
    return !n.isIgnored && !!n.network;
  }
  function sortNetworks(a, b) {
    const isUnSortedA = UNSORTED.includes(a.prefix);
    const isUnSortedB = UNSORTED.includes(b.prefix);
    return isUnSortedA === isUnSortedB ? 0 : isUnSortedA ? -1 : isUnSortedB ? 1 : a.displayName.localeCompare(b.displayName);
  }
  const allNetworks = knownSubstrate.map(toExpanded);
  const availableNetworks = allNetworks.filter(filterAvailable).sort(sortNetworks);
  const selectableNetworks = availableNetworks.filter(filterSelectable);

  function networkToPrefix({
    prefix
  }) {
    return prefix;
  }
  const defaults = {
    allowedDecodedLengths: [1, 2, 4, 8, 32, 33],
    allowedEncodedLengths: [3, 4, 6, 10, 35, 36, 37, 38],
    allowedPrefix: availableNetworks.map(networkToPrefix),
    prefix: 42
  };

  function decodeAddress(encoded, ignoreChecksum, ss58Format = -1) {
    util.assert(encoded, 'Invalid empty address passed');
    if (util.isU8a(encoded) || util.isHex(encoded)) {
      return util.u8aToU8a(encoded);
    }
    try {
      const decoded = base58Decode(encoded);
      util.assert(defaults.allowedEncodedLengths.includes(decoded.length), 'Invalid decoded address length');
      const [isValid, endPos, ss58Length, ss58Decoded] = checkAddressChecksum(decoded);
      util.assert(ignoreChecksum || isValid, 'Invalid decoded address checksum');
      util.assert([-1, ss58Decoded].includes(ss58Format), () => `Expected ss58Format ${ss58Format}, received ${ss58Decoded}`);
      return decoded.slice(ss58Length, endPos);
    } catch (error) {
      throw new Error(`Decoding ${encoded}: ${error.message}`);
    }
  }

  function addressToEvm(address, ignoreChecksum) {
    const decoded = decodeAddress(address, ignoreChecksum);
    return decoded.subarray(0, 20);
  }

  function checkAddress(address, prefix) {
    let decoded;
    try {
      decoded = base58Decode(address);
    } catch (error) {
      return [false, error.message];
    }
    const [isValid,,, ss58Decoded] = checkAddressChecksum(decoded);
    if (ss58Decoded !== prefix) {
      return [false, `Prefix mismatch, expected ${prefix}, found ${ss58Decoded}`];
    } else if (!defaults.allowedEncodedLengths.includes(decoded.length)) {
      return [false, 'Invalid decoded address length'];
    }
    return [isValid, isValid ? null : 'Invalid decoded address checksum'];
  }

  const BN_BE_OPTS = {
    isLe: false
  };
  const BN_LE_OPTS = {
    isLe: true
  };
  const BN_LE_16_OPTS = {
    bitLength: 16,
    isLe: true
  };
  const BN_BE_32_OPTS = {
    bitLength: 32,
    isLe: false
  };
  const BN_LE_32_OPTS = {
    bitLength: 32,
    isLe: true
  };
  const BN_BE_256_OPTS = {
    bitLength: 256,
    isLe: false
  };
  const BN_LE_256_OPTS = {
    bitLength: 256,
    isLe: true
  };
  const BN_LE_512_OPTS = {
    bitLength: 512,
    isLe: true
  };

  function addressToU8a(who) {
    return decodeAddress(who);
  }

  const PREFIX$1 = util.stringToU8a('modlpy/utilisuba');
  function createKeyMulti(who, threshold) {
    return blake2AsU8a(util.u8aConcat(PREFIX$1, util.compactToU8a(who.length), ...util.u8aSorted(who.map(addressToU8a)), util.bnToU8a(threshold, BN_LE_16_OPTS)));
  }

  const PREFIX = util.stringToU8a('modlpy/utilisuba');
  function createKeyDerived(who, index) {
    return blake2AsU8a(util.u8aConcat(PREFIX, decodeAddress(who), util.bnToU8a(index, BN_LE_16_OPTS)));
  }

  function _classPrivateFieldBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }
    return receiver;
  }

  var id = 0;
  function _classPrivateFieldKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  const RE_NUMBER = /^\d+$/;
  const JUNCTION_ID_LEN = 32;
  var _chainCode = _classPrivateFieldKey("chainCode");
  var _isHard = _classPrivateFieldKey("isHard");
  class DeriveJunction {
    constructor() {
      Object.defineProperty(this, _chainCode, {
        writable: true,
        value: new Uint8Array(32)
      });
      Object.defineProperty(this, _isHard, {
        writable: true,
        value: false
      });
    }
    static from(value) {
      const result = new DeriveJunction();
      const [code, isHard] = value.startsWith('/') ? [value.substr(1), true] : [value, false];
      result.soft(RE_NUMBER.test(code) ? new util.BN(code, 10) : code);
      return isHard ? result.harden() : result;
    }
    get chainCode() {
      return _classPrivateFieldBase(this, _chainCode)[_chainCode];
    }
    get isHard() {
      return _classPrivateFieldBase(this, _isHard)[_isHard];
    }
    get isSoft() {
      return !_classPrivateFieldBase(this, _isHard)[_isHard];
    }
    hard(value) {
      return this.soft(value).harden();
    }
    harden() {
      _classPrivateFieldBase(this, _isHard)[_isHard] = true;
      return this;
    }
    soft(value) {
      if (util.isNumber(value) || util.isBn(value) || util.isBigInt(value)) {
        return this.soft(util.bnToU8a(value, BN_LE_256_OPTS));
      } else if (util.isHex(value)) {
        return this.soft(util.hexToU8a(value));
      } else if (util.isString(value)) {
        return this.soft(util.compactAddLength(util.stringToU8a(value)));
      } else if (value.length > JUNCTION_ID_LEN) {
        return this.soft(blake2AsU8a(value));
      }
      _classPrivateFieldBase(this, _chainCode)[_chainCode].fill(0);
      _classPrivateFieldBase(this, _chainCode)[_chainCode].set(value, 0);
      return this;
    }
    soften() {
      _classPrivateFieldBase(this, _isHard)[_isHard] = false;
      return this;
    }
  }

  const RE_JUNCTION = /\/(\/?)([^/]+)/g;
  function keyExtractPath(derivePath) {
    const parts = derivePath.match(RE_JUNCTION);
    const path = [];
    let constructed = '';
    if (parts) {
      constructed = parts.join('');
      for (const p of parts) {
        path.push(DeriveJunction.from(p.substr(1)));
      }
    }
    util.assert(constructed === derivePath, () => `Re-constructed path "${constructed}" does not match input`);
    return {
      parts,
      path
    };
  }

  const RE_CAPTURE = /^(\w+( \w+)*)((\/\/?[^/]+)*)(\/\/\/(.*))?$/;
  function keyExtractSuri(suri) {
    const matches = suri.match(RE_CAPTURE);
    util.assert(!util.isNull(matches), 'Unable to match provided value to a secret URI');
    const [, phrase,, derivePath,,, password] = matches;
    const {
      path
    } = keyExtractPath(derivePath);
    return {
      derivePath,
      password,
      path,
      phrase
    };
  }

  const HDKD$1 = util.compactAddLength(util.stringToU8a('Secp256k1HDKD'));
  function secp256k1DeriveHard(seed, chainCode) {
    util.assert(util.isU8a(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
    return blake2AsU8a(util.u8aConcat(HDKD$1, seed, chainCode), 256);
  }

  function secp256k1PairFromSeed(seed, onlyJs) {
    util.assert(seed.length === 32, 'Expected valid 32-byte private key as a seed');
    if (!util.hasBigInt || !onlyJs && isReady()) {
      const full = secp256k1FromSeed(seed);
      return {
        publicKey: full.slice(32),
        secretKey: full.slice(0, 32)
      };
    }
    return {
      publicKey: getPublicKey(seed, true),
      secretKey: seed
    };
  }

  function createSeedDeriveFn(fromSeed, derive) {
    return (keypair, {
      chainCode,
      isHard
    }) => {
      util.assert(isHard, 'A soft key was found in the path and is not supported');
      return fromSeed(derive(keypair.secretKey.subarray(0, 32), chainCode));
    };
  }

  const keyHdkdEcdsa = createSeedDeriveFn(secp256k1PairFromSeed, secp256k1DeriveHard);

  var ed2curve$1 = {exports: {}};

  var naclFast = {exports: {}};

  const require$$0 = /*@__PURE__*/getAugmentedNamespace(crypto$2);

  (function (module) {
  (function(nacl) {
  var gf = function(init) {
    var i, r = new Float64Array(16);
    if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
    return r;
  };
  var randombytes = function() { throw new Error('no PRNG'); };
  var _0 = new Uint8Array(16);
  var _9 = new Uint8Array(32); _9[0] = 9;
  var gf0 = gf(),
      gf1 = gf([1]),
      _121665 = gf([0xdb41, 1]),
      D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
      D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
      X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
      Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
      I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);
  function ts64(x, i, h, l) {
    x[i]   = (h >> 24) & 0xff;
    x[i+1] = (h >> 16) & 0xff;
    x[i+2] = (h >>  8) & 0xff;
    x[i+3] = h & 0xff;
    x[i+4] = (l >> 24)  & 0xff;
    x[i+5] = (l >> 16)  & 0xff;
    x[i+6] = (l >>  8)  & 0xff;
    x[i+7] = l & 0xff;
  }
  function vn(x, xi, y, yi, n) {
    var i,d = 0;
    for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
    return (1 & ((d - 1) >>> 8)) - 1;
  }
  function crypto_verify_16(x, xi, y, yi) {
    return vn(x,xi,y,yi,16);
  }
  function crypto_verify_32(x, xi, y, yi) {
    return vn(x,xi,y,yi,32);
  }
  function core_salsa20(o, p, k, c) {
    var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
        j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
        j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
        j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
        j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
        j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
        j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
        j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
        j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
        j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
        j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
        j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
        j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
        j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
        j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
        j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;
    var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
        x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
        x15 = j15, u;
    for (var i = 0; i < 20; i += 2) {
      u = x0 + x12 | 0;
      x4 ^= u<<7 | u>>>(32-7);
      u = x4 + x0 | 0;
      x8 ^= u<<9 | u>>>(32-9);
      u = x8 + x4 | 0;
      x12 ^= u<<13 | u>>>(32-13);
      u = x12 + x8 | 0;
      x0 ^= u<<18 | u>>>(32-18);
      u = x5 + x1 | 0;
      x9 ^= u<<7 | u>>>(32-7);
      u = x9 + x5 | 0;
      x13 ^= u<<9 | u>>>(32-9);
      u = x13 + x9 | 0;
      x1 ^= u<<13 | u>>>(32-13);
      u = x1 + x13 | 0;
      x5 ^= u<<18 | u>>>(32-18);
      u = x10 + x6 | 0;
      x14 ^= u<<7 | u>>>(32-7);
      u = x14 + x10 | 0;
      x2 ^= u<<9 | u>>>(32-9);
      u = x2 + x14 | 0;
      x6 ^= u<<13 | u>>>(32-13);
      u = x6 + x2 | 0;
      x10 ^= u<<18 | u>>>(32-18);
      u = x15 + x11 | 0;
      x3 ^= u<<7 | u>>>(32-7);
      u = x3 + x15 | 0;
      x7 ^= u<<9 | u>>>(32-9);
      u = x7 + x3 | 0;
      x11 ^= u<<13 | u>>>(32-13);
      u = x11 + x7 | 0;
      x15 ^= u<<18 | u>>>(32-18);
      u = x0 + x3 | 0;
      x1 ^= u<<7 | u>>>(32-7);
      u = x1 + x0 | 0;
      x2 ^= u<<9 | u>>>(32-9);
      u = x2 + x1 | 0;
      x3 ^= u<<13 | u>>>(32-13);
      u = x3 + x2 | 0;
      x0 ^= u<<18 | u>>>(32-18);
      u = x5 + x4 | 0;
      x6 ^= u<<7 | u>>>(32-7);
      u = x6 + x5 | 0;
      x7 ^= u<<9 | u>>>(32-9);
      u = x7 + x6 | 0;
      x4 ^= u<<13 | u>>>(32-13);
      u = x4 + x7 | 0;
      x5 ^= u<<18 | u>>>(32-18);
      u = x10 + x9 | 0;
      x11 ^= u<<7 | u>>>(32-7);
      u = x11 + x10 | 0;
      x8 ^= u<<9 | u>>>(32-9);
      u = x8 + x11 | 0;
      x9 ^= u<<13 | u>>>(32-13);
      u = x9 + x8 | 0;
      x10 ^= u<<18 | u>>>(32-18);
      u = x15 + x14 | 0;
      x12 ^= u<<7 | u>>>(32-7);
      u = x12 + x15 | 0;
      x13 ^= u<<9 | u>>>(32-9);
      u = x13 + x12 | 0;
      x14 ^= u<<13 | u>>>(32-13);
      u = x14 + x13 | 0;
      x15 ^= u<<18 | u>>>(32-18);
    }
     x0 =  x0 +  j0 | 0;
     x1 =  x1 +  j1 | 0;
     x2 =  x2 +  j2 | 0;
     x3 =  x3 +  j3 | 0;
     x4 =  x4 +  j4 | 0;
     x5 =  x5 +  j5 | 0;
     x6 =  x6 +  j6 | 0;
     x7 =  x7 +  j7 | 0;
     x8 =  x8 +  j8 | 0;
     x9 =  x9 +  j9 | 0;
    x10 = x10 + j10 | 0;
    x11 = x11 + j11 | 0;
    x12 = x12 + j12 | 0;
    x13 = x13 + j13 | 0;
    x14 = x14 + j14 | 0;
    x15 = x15 + j15 | 0;
    o[ 0] = x0 >>>  0 & 0xff;
    o[ 1] = x0 >>>  8 & 0xff;
    o[ 2] = x0 >>> 16 & 0xff;
    o[ 3] = x0 >>> 24 & 0xff;
    o[ 4] = x1 >>>  0 & 0xff;
    o[ 5] = x1 >>>  8 & 0xff;
    o[ 6] = x1 >>> 16 & 0xff;
    o[ 7] = x1 >>> 24 & 0xff;
    o[ 8] = x2 >>>  0 & 0xff;
    o[ 9] = x2 >>>  8 & 0xff;
    o[10] = x2 >>> 16 & 0xff;
    o[11] = x2 >>> 24 & 0xff;
    o[12] = x3 >>>  0 & 0xff;
    o[13] = x3 >>>  8 & 0xff;
    o[14] = x3 >>> 16 & 0xff;
    o[15] = x3 >>> 24 & 0xff;
    o[16] = x4 >>>  0 & 0xff;
    o[17] = x4 >>>  8 & 0xff;
    o[18] = x4 >>> 16 & 0xff;
    o[19] = x4 >>> 24 & 0xff;
    o[20] = x5 >>>  0 & 0xff;
    o[21] = x5 >>>  8 & 0xff;
    o[22] = x5 >>> 16 & 0xff;
    o[23] = x5 >>> 24 & 0xff;
    o[24] = x6 >>>  0 & 0xff;
    o[25] = x6 >>>  8 & 0xff;
    o[26] = x6 >>> 16 & 0xff;
    o[27] = x6 >>> 24 & 0xff;
    o[28] = x7 >>>  0 & 0xff;
    o[29] = x7 >>>  8 & 0xff;
    o[30] = x7 >>> 16 & 0xff;
    o[31] = x7 >>> 24 & 0xff;
    o[32] = x8 >>>  0 & 0xff;
    o[33] = x8 >>>  8 & 0xff;
    o[34] = x8 >>> 16 & 0xff;
    o[35] = x8 >>> 24 & 0xff;
    o[36] = x9 >>>  0 & 0xff;
    o[37] = x9 >>>  8 & 0xff;
    o[38] = x9 >>> 16 & 0xff;
    o[39] = x9 >>> 24 & 0xff;
    o[40] = x10 >>>  0 & 0xff;
    o[41] = x10 >>>  8 & 0xff;
    o[42] = x10 >>> 16 & 0xff;
    o[43] = x10 >>> 24 & 0xff;
    o[44] = x11 >>>  0 & 0xff;
    o[45] = x11 >>>  8 & 0xff;
    o[46] = x11 >>> 16 & 0xff;
    o[47] = x11 >>> 24 & 0xff;
    o[48] = x12 >>>  0 & 0xff;
    o[49] = x12 >>>  8 & 0xff;
    o[50] = x12 >>> 16 & 0xff;
    o[51] = x12 >>> 24 & 0xff;
    o[52] = x13 >>>  0 & 0xff;
    o[53] = x13 >>>  8 & 0xff;
    o[54] = x13 >>> 16 & 0xff;
    o[55] = x13 >>> 24 & 0xff;
    o[56] = x14 >>>  0 & 0xff;
    o[57] = x14 >>>  8 & 0xff;
    o[58] = x14 >>> 16 & 0xff;
    o[59] = x14 >>> 24 & 0xff;
    o[60] = x15 >>>  0 & 0xff;
    o[61] = x15 >>>  8 & 0xff;
    o[62] = x15 >>> 16 & 0xff;
    o[63] = x15 >>> 24 & 0xff;
  }
  function core_hsalsa20(o,p,k,c) {
    var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
        j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
        j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
        j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
        j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
        j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
        j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
        j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
        j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
        j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
        j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
        j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
        j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
        j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
        j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
        j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;
    var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
        x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
        x15 = j15, u;
    for (var i = 0; i < 20; i += 2) {
      u = x0 + x12 | 0;
      x4 ^= u<<7 | u>>>(32-7);
      u = x4 + x0 | 0;
      x8 ^= u<<9 | u>>>(32-9);
      u = x8 + x4 | 0;
      x12 ^= u<<13 | u>>>(32-13);
      u = x12 + x8 | 0;
      x0 ^= u<<18 | u>>>(32-18);
      u = x5 + x1 | 0;
      x9 ^= u<<7 | u>>>(32-7);
      u = x9 + x5 | 0;
      x13 ^= u<<9 | u>>>(32-9);
      u = x13 + x9 | 0;
      x1 ^= u<<13 | u>>>(32-13);
      u = x1 + x13 | 0;
      x5 ^= u<<18 | u>>>(32-18);
      u = x10 + x6 | 0;
      x14 ^= u<<7 | u>>>(32-7);
      u = x14 + x10 | 0;
      x2 ^= u<<9 | u>>>(32-9);
      u = x2 + x14 | 0;
      x6 ^= u<<13 | u>>>(32-13);
      u = x6 + x2 | 0;
      x10 ^= u<<18 | u>>>(32-18);
      u = x15 + x11 | 0;
      x3 ^= u<<7 | u>>>(32-7);
      u = x3 + x15 | 0;
      x7 ^= u<<9 | u>>>(32-9);
      u = x7 + x3 | 0;
      x11 ^= u<<13 | u>>>(32-13);
      u = x11 + x7 | 0;
      x15 ^= u<<18 | u>>>(32-18);
      u = x0 + x3 | 0;
      x1 ^= u<<7 | u>>>(32-7);
      u = x1 + x0 | 0;
      x2 ^= u<<9 | u>>>(32-9);
      u = x2 + x1 | 0;
      x3 ^= u<<13 | u>>>(32-13);
      u = x3 + x2 | 0;
      x0 ^= u<<18 | u>>>(32-18);
      u = x5 + x4 | 0;
      x6 ^= u<<7 | u>>>(32-7);
      u = x6 + x5 | 0;
      x7 ^= u<<9 | u>>>(32-9);
      u = x7 + x6 | 0;
      x4 ^= u<<13 | u>>>(32-13);
      u = x4 + x7 | 0;
      x5 ^= u<<18 | u>>>(32-18);
      u = x10 + x9 | 0;
      x11 ^= u<<7 | u>>>(32-7);
      u = x11 + x10 | 0;
      x8 ^= u<<9 | u>>>(32-9);
      u = x8 + x11 | 0;
      x9 ^= u<<13 | u>>>(32-13);
      u = x9 + x8 | 0;
      x10 ^= u<<18 | u>>>(32-18);
      u = x15 + x14 | 0;
      x12 ^= u<<7 | u>>>(32-7);
      u = x12 + x15 | 0;
      x13 ^= u<<9 | u>>>(32-9);
      u = x13 + x12 | 0;
      x14 ^= u<<13 | u>>>(32-13);
      u = x14 + x13 | 0;
      x15 ^= u<<18 | u>>>(32-18);
    }
    o[ 0] = x0 >>>  0 & 0xff;
    o[ 1] = x0 >>>  8 & 0xff;
    o[ 2] = x0 >>> 16 & 0xff;
    o[ 3] = x0 >>> 24 & 0xff;
    o[ 4] = x5 >>>  0 & 0xff;
    o[ 5] = x5 >>>  8 & 0xff;
    o[ 6] = x5 >>> 16 & 0xff;
    o[ 7] = x5 >>> 24 & 0xff;
    o[ 8] = x10 >>>  0 & 0xff;
    o[ 9] = x10 >>>  8 & 0xff;
    o[10] = x10 >>> 16 & 0xff;
    o[11] = x10 >>> 24 & 0xff;
    o[12] = x15 >>>  0 & 0xff;
    o[13] = x15 >>>  8 & 0xff;
    o[14] = x15 >>> 16 & 0xff;
    o[15] = x15 >>> 24 & 0xff;
    o[16] = x6 >>>  0 & 0xff;
    o[17] = x6 >>>  8 & 0xff;
    o[18] = x6 >>> 16 & 0xff;
    o[19] = x6 >>> 24 & 0xff;
    o[20] = x7 >>>  0 & 0xff;
    o[21] = x7 >>>  8 & 0xff;
    o[22] = x7 >>> 16 & 0xff;
    o[23] = x7 >>> 24 & 0xff;
    o[24] = x8 >>>  0 & 0xff;
    o[25] = x8 >>>  8 & 0xff;
    o[26] = x8 >>> 16 & 0xff;
    o[27] = x8 >>> 24 & 0xff;
    o[28] = x9 >>>  0 & 0xff;
    o[29] = x9 >>>  8 & 0xff;
    o[30] = x9 >>> 16 & 0xff;
    o[31] = x9 >>> 24 & 0xff;
  }
  function crypto_core_salsa20(out,inp,k,c) {
    core_salsa20(out,inp,k,c);
  }
  function crypto_core_hsalsa20(out,inp,k,c) {
    core_hsalsa20(out,inp,k,c);
  }
  var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
  function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
    var z = new Uint8Array(16), x = new Uint8Array(64);
    var u, i;
    for (i = 0; i < 16; i++) z[i] = 0;
    for (i = 0; i < 8; i++) z[i] = n[i];
    while (b >= 64) {
      crypto_core_salsa20(x,z,k,sigma);
      for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
      u = 1;
      for (i = 8; i < 16; i++) {
        u = u + (z[i] & 0xff) | 0;
        z[i] = u & 0xff;
        u >>>= 8;
      }
      b -= 64;
      cpos += 64;
      mpos += 64;
    }
    if (b > 0) {
      crypto_core_salsa20(x,z,k,sigma);
      for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
    }
    return 0;
  }
  function crypto_stream_salsa20(c,cpos,b,n,k) {
    var z = new Uint8Array(16), x = new Uint8Array(64);
    var u, i;
    for (i = 0; i < 16; i++) z[i] = 0;
    for (i = 0; i < 8; i++) z[i] = n[i];
    while (b >= 64) {
      crypto_core_salsa20(x,z,k,sigma);
      for (i = 0; i < 64; i++) c[cpos+i] = x[i];
      u = 1;
      for (i = 8; i < 16; i++) {
        u = u + (z[i] & 0xff) | 0;
        z[i] = u & 0xff;
        u >>>= 8;
      }
      b -= 64;
      cpos += 64;
    }
    if (b > 0) {
      crypto_core_salsa20(x,z,k,sigma);
      for (i = 0; i < b; i++) c[cpos+i] = x[i];
    }
    return 0;
  }
  function crypto_stream(c,cpos,d,n,k) {
    var s = new Uint8Array(32);
    crypto_core_hsalsa20(s,n,k,sigma);
    var sn = new Uint8Array(8);
    for (var i = 0; i < 8; i++) sn[i] = n[i+16];
    return crypto_stream_salsa20(c,cpos,d,sn,s);
  }
  function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
    var s = new Uint8Array(32);
    crypto_core_hsalsa20(s,n,k,sigma);
    var sn = new Uint8Array(8);
    for (var i = 0; i < 8; i++) sn[i] = n[i+16];
    return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
  }
  var poly1305 = function(key) {
    this.buffer = new Uint8Array(16);
    this.r = new Uint16Array(10);
    this.h = new Uint16Array(10);
    this.pad = new Uint16Array(8);
    this.leftover = 0;
    this.fin = 0;
    var t0, t1, t2, t3, t4, t5, t6, t7;
    t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
    t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
    t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
    t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
    t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
    this.r[5] = ((t4 >>>  1)) & 0x1ffe;
    t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
    t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
    t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
    this.r[9] = ((t7 >>>  5)) & 0x007f;
    this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
    this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
    this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
    this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
    this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
    this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
    this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
    this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
  };
  poly1305.prototype.blocks = function(m, mpos, bytes) {
    var hibit = this.fin ? 0 : (1 << 11);
    var t0, t1, t2, t3, t4, t5, t6, t7, c;
    var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
    var h0 = this.h[0],
        h1 = this.h[1],
        h2 = this.h[2],
        h3 = this.h[3],
        h4 = this.h[4],
        h5 = this.h[5],
        h6 = this.h[6],
        h7 = this.h[7],
        h8 = this.h[8],
        h9 = this.h[9];
    var r0 = this.r[0],
        r1 = this.r[1],
        r2 = this.r[2],
        r3 = this.r[3],
        r4 = this.r[4],
        r5 = this.r[5],
        r6 = this.r[6],
        r7 = this.r[7],
        r8 = this.r[8],
        r9 = this.r[9];
    while (bytes >= 16) {
      t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
      t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
      t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
      t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
      t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
      h5 += ((t4 >>>  1)) & 0x1fff;
      t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
      t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
      t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
      h9 += ((t7 >>> 5)) | hibit;
      c = 0;
      d0 = c;
      d0 += h0 * r0;
      d0 += h1 * (5 * r9);
      d0 += h2 * (5 * r8);
      d0 += h3 * (5 * r7);
      d0 += h4 * (5 * r6);
      c = (d0 >>> 13); d0 &= 0x1fff;
      d0 += h5 * (5 * r5);
      d0 += h6 * (5 * r4);
      d0 += h7 * (5 * r3);
      d0 += h8 * (5 * r2);
      d0 += h9 * (5 * r1);
      c += (d0 >>> 13); d0 &= 0x1fff;
      d1 = c;
      d1 += h0 * r1;
      d1 += h1 * r0;
      d1 += h2 * (5 * r9);
      d1 += h3 * (5 * r8);
      d1 += h4 * (5 * r7);
      c = (d1 >>> 13); d1 &= 0x1fff;
      d1 += h5 * (5 * r6);
      d1 += h6 * (5 * r5);
      d1 += h7 * (5 * r4);
      d1 += h8 * (5 * r3);
      d1 += h9 * (5 * r2);
      c += (d1 >>> 13); d1 &= 0x1fff;
      d2 = c;
      d2 += h0 * r2;
      d2 += h1 * r1;
      d2 += h2 * r0;
      d2 += h3 * (5 * r9);
      d2 += h4 * (5 * r8);
      c = (d2 >>> 13); d2 &= 0x1fff;
      d2 += h5 * (5 * r7);
      d2 += h6 * (5 * r6);
      d2 += h7 * (5 * r5);
      d2 += h8 * (5 * r4);
      d2 += h9 * (5 * r3);
      c += (d2 >>> 13); d2 &= 0x1fff;
      d3 = c;
      d3 += h0 * r3;
      d3 += h1 * r2;
      d3 += h2 * r1;
      d3 += h3 * r0;
      d3 += h4 * (5 * r9);
      c = (d3 >>> 13); d3 &= 0x1fff;
      d3 += h5 * (5 * r8);
      d3 += h6 * (5 * r7);
      d3 += h7 * (5 * r6);
      d3 += h8 * (5 * r5);
      d3 += h9 * (5 * r4);
      c += (d3 >>> 13); d3 &= 0x1fff;
      d4 = c;
      d4 += h0 * r4;
      d4 += h1 * r3;
      d4 += h2 * r2;
      d4 += h3 * r1;
      d4 += h4 * r0;
      c = (d4 >>> 13); d4 &= 0x1fff;
      d4 += h5 * (5 * r9);
      d4 += h6 * (5 * r8);
      d4 += h7 * (5 * r7);
      d4 += h8 * (5 * r6);
      d4 += h9 * (5 * r5);
      c += (d4 >>> 13); d4 &= 0x1fff;
      d5 = c;
      d5 += h0 * r5;
      d5 += h1 * r4;
      d5 += h2 * r3;
      d5 += h3 * r2;
      d5 += h4 * r1;
      c = (d5 >>> 13); d5 &= 0x1fff;
      d5 += h5 * r0;
      d5 += h6 * (5 * r9);
      d5 += h7 * (5 * r8);
      d5 += h8 * (5 * r7);
      d5 += h9 * (5 * r6);
      c += (d5 >>> 13); d5 &= 0x1fff;
      d6 = c;
      d6 += h0 * r6;
      d6 += h1 * r5;
      d6 += h2 * r4;
      d6 += h3 * r3;
      d6 += h4 * r2;
      c = (d6 >>> 13); d6 &= 0x1fff;
      d6 += h5 * r1;
      d6 += h6 * r0;
      d6 += h7 * (5 * r9);
      d6 += h8 * (5 * r8);
      d6 += h9 * (5 * r7);
      c += (d6 >>> 13); d6 &= 0x1fff;
      d7 = c;
      d7 += h0 * r7;
      d7 += h1 * r6;
      d7 += h2 * r5;
      d7 += h3 * r4;
      d7 += h4 * r3;
      c = (d7 >>> 13); d7 &= 0x1fff;
      d7 += h5 * r2;
      d7 += h6 * r1;
      d7 += h7 * r0;
      d7 += h8 * (5 * r9);
      d7 += h9 * (5 * r8);
      c += (d7 >>> 13); d7 &= 0x1fff;
      d8 = c;
      d8 += h0 * r8;
      d8 += h1 * r7;
      d8 += h2 * r6;
      d8 += h3 * r5;
      d8 += h4 * r4;
      c = (d8 >>> 13); d8 &= 0x1fff;
      d8 += h5 * r3;
      d8 += h6 * r2;
      d8 += h7 * r1;
      d8 += h8 * r0;
      d8 += h9 * (5 * r9);
      c += (d8 >>> 13); d8 &= 0x1fff;
      d9 = c;
      d9 += h0 * r9;
      d9 += h1 * r8;
      d9 += h2 * r7;
      d9 += h3 * r6;
      d9 += h4 * r5;
      c = (d9 >>> 13); d9 &= 0x1fff;
      d9 += h5 * r4;
      d9 += h6 * r3;
      d9 += h7 * r2;
      d9 += h8 * r1;
      d9 += h9 * r0;
      c += (d9 >>> 13); d9 &= 0x1fff;
      c = (((c << 2) + c)) | 0;
      c = (c + d0) | 0;
      d0 = c & 0x1fff;
      c = (c >>> 13);
      d1 += c;
      h0 = d0;
      h1 = d1;
      h2 = d2;
      h3 = d3;
      h4 = d4;
      h5 = d5;
      h6 = d6;
      h7 = d7;
      h8 = d8;
      h9 = d9;
      mpos += 16;
      bytes -= 16;
    }
    this.h[0] = h0;
    this.h[1] = h1;
    this.h[2] = h2;
    this.h[3] = h3;
    this.h[4] = h4;
    this.h[5] = h5;
    this.h[6] = h6;
    this.h[7] = h7;
    this.h[8] = h8;
    this.h[9] = h9;
  };
  poly1305.prototype.finish = function(mac, macpos) {
    var g = new Uint16Array(10);
    var c, mask, f, i;
    if (this.leftover) {
      i = this.leftover;
      this.buffer[i++] = 1;
      for (; i < 16; i++) this.buffer[i] = 0;
      this.fin = 1;
      this.blocks(this.buffer, 0, 16);
    }
    c = this.h[1] >>> 13;
    this.h[1] &= 0x1fff;
    for (i = 2; i < 10; i++) {
      this.h[i] += c;
      c = this.h[i] >>> 13;
      this.h[i] &= 0x1fff;
    }
    this.h[0] += (c * 5);
    c = this.h[0] >>> 13;
    this.h[0] &= 0x1fff;
    this.h[1] += c;
    c = this.h[1] >>> 13;
    this.h[1] &= 0x1fff;
    this.h[2] += c;
    g[0] = this.h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 0x1fff;
    for (i = 1; i < 10; i++) {
      g[i] = this.h[i] + c;
      c = g[i] >>> 13;
      g[i] &= 0x1fff;
    }
    g[9] -= (1 << 13);
    mask = (c ^ 1) - 1;
    for (i = 0; i < 10; i++) g[i] &= mask;
    mask = ~mask;
    for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];
    this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
    this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
    this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
    this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
    this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
    this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
    this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
    this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;
    f = this.h[0] + this.pad[0];
    this.h[0] = f & 0xffff;
    for (i = 1; i < 8; i++) {
      f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
      this.h[i] = f & 0xffff;
    }
    mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
    mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
    mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
    mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
    mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
    mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
    mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
    mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
    mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
    mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
    mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
    mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
    mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
    mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
    mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
    mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
  };
  poly1305.prototype.update = function(m, mpos, bytes) {
    var i, want;
    if (this.leftover) {
      want = (16 - this.leftover);
      if (want > bytes)
        want = bytes;
      for (i = 0; i < want; i++)
        this.buffer[this.leftover + i] = m[mpos+i];
      bytes -= want;
      mpos += want;
      this.leftover += want;
      if (this.leftover < 16)
        return;
      this.blocks(this.buffer, 0, 16);
      this.leftover = 0;
    }
    if (bytes >= 16) {
      want = bytes - (bytes % 16);
      this.blocks(m, mpos, want);
      mpos += want;
      bytes -= want;
    }
    if (bytes) {
      for (i = 0; i < bytes; i++)
        this.buffer[this.leftover + i] = m[mpos+i];
      this.leftover += bytes;
    }
  };
  function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
    var s = new poly1305(k);
    s.update(m, mpos, n);
    s.finish(out, outpos);
    return 0;
  }
  function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
    var x = new Uint8Array(16);
    crypto_onetimeauth(x,0,m,mpos,n,k);
    return crypto_verify_16(h,hpos,x,0);
  }
  function crypto_secretbox(c,m,d,n,k) {
    var i;
    if (d < 32) return -1;
    crypto_stream_xor(c,0,m,0,d,n,k);
    crypto_onetimeauth(c, 16, c, 32, d - 32, c);
    for (i = 0; i < 16; i++) c[i] = 0;
    return 0;
  }
  function crypto_secretbox_open(m,c,d,n,k) {
    var i;
    var x = new Uint8Array(32);
    if (d < 32) return -1;
    crypto_stream(x,0,32,n,k);
    if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
    crypto_stream_xor(m,0,c,0,d,n,k);
    for (i = 0; i < 32; i++) m[i] = 0;
    return 0;
  }
  function set25519(r, a) {
    var i;
    for (i = 0; i < 16; i++) r[i] = a[i]|0;
  }
  function car25519(o) {
    var i, v, c = 1;
    for (i = 0; i < 16; i++) {
      v = o[i] + c + 65535;
      c = Math.floor(v / 65536);
      o[i] = v - c * 65536;
    }
    o[0] += c-1 + 37 * (c-1);
  }
  function sel25519(p, q, b) {
    var t, c = ~(b-1);
    for (var i = 0; i < 16; i++) {
      t = c & (p[i] ^ q[i]);
      p[i] ^= t;
      q[i] ^= t;
    }
  }
  function pack25519(o, n) {
    var i, j, b;
    var m = gf(), t = gf();
    for (i = 0; i < 16; i++) t[i] = n[i];
    car25519(t);
    car25519(t);
    car25519(t);
    for (j = 0; j < 2; j++) {
      m[0] = t[0] - 0xffed;
      for (i = 1; i < 15; i++) {
        m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
        m[i-1] &= 0xffff;
      }
      m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
      b = (m[15]>>16) & 1;
      m[14] &= 0xffff;
      sel25519(t, m, 1-b);
    }
    for (i = 0; i < 16; i++) {
      o[2*i] = t[i] & 0xff;
      o[2*i+1] = t[i]>>8;
    }
  }
  function neq25519(a, b) {
    var c = new Uint8Array(32), d = new Uint8Array(32);
    pack25519(c, a);
    pack25519(d, b);
    return crypto_verify_32(c, 0, d, 0);
  }
  function par25519(a) {
    var d = new Uint8Array(32);
    pack25519(d, a);
    return d[0] & 1;
  }
  function unpack25519(o, n) {
    var i;
    for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
    o[15] &= 0x7fff;
  }
  function A(o, a, b) {
    for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
  }
  function Z(o, a, b) {
    for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
  }
  function M(o, a, b) {
    var v, c,
       t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
       t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
      t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
      t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
      b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11],
      b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
    v = a[0];
    t0 += v * b0;
    t1 += v * b1;
    t2 += v * b2;
    t3 += v * b3;
    t4 += v * b4;
    t5 += v * b5;
    t6 += v * b6;
    t7 += v * b7;
    t8 += v * b8;
    t9 += v * b9;
    t10 += v * b10;
    t11 += v * b11;
    t12 += v * b12;
    t13 += v * b13;
    t14 += v * b14;
    t15 += v * b15;
    v = a[1];
    t1 += v * b0;
    t2 += v * b1;
    t3 += v * b2;
    t4 += v * b3;
    t5 += v * b4;
    t6 += v * b5;
    t7 += v * b6;
    t8 += v * b7;
    t9 += v * b8;
    t10 += v * b9;
    t11 += v * b10;
    t12 += v * b11;
    t13 += v * b12;
    t14 += v * b13;
    t15 += v * b14;
    t16 += v * b15;
    v = a[2];
    t2 += v * b0;
    t3 += v * b1;
    t4 += v * b2;
    t5 += v * b3;
    t6 += v * b4;
    t7 += v * b5;
    t8 += v * b6;
    t9 += v * b7;
    t10 += v * b8;
    t11 += v * b9;
    t12 += v * b10;
    t13 += v * b11;
    t14 += v * b12;
    t15 += v * b13;
    t16 += v * b14;
    t17 += v * b15;
    v = a[3];
    t3 += v * b0;
    t4 += v * b1;
    t5 += v * b2;
    t6 += v * b3;
    t7 += v * b4;
    t8 += v * b5;
    t9 += v * b6;
    t10 += v * b7;
    t11 += v * b8;
    t12 += v * b9;
    t13 += v * b10;
    t14 += v * b11;
    t15 += v * b12;
    t16 += v * b13;
    t17 += v * b14;
    t18 += v * b15;
    v = a[4];
    t4 += v * b0;
    t5 += v * b1;
    t6 += v * b2;
    t7 += v * b3;
    t8 += v * b4;
    t9 += v * b5;
    t10 += v * b6;
    t11 += v * b7;
    t12 += v * b8;
    t13 += v * b9;
    t14 += v * b10;
    t15 += v * b11;
    t16 += v * b12;
    t17 += v * b13;
    t18 += v * b14;
    t19 += v * b15;
    v = a[5];
    t5 += v * b0;
    t6 += v * b1;
    t7 += v * b2;
    t8 += v * b3;
    t9 += v * b4;
    t10 += v * b5;
    t11 += v * b6;
    t12 += v * b7;
    t13 += v * b8;
    t14 += v * b9;
    t15 += v * b10;
    t16 += v * b11;
    t17 += v * b12;
    t18 += v * b13;
    t19 += v * b14;
    t20 += v * b15;
    v = a[6];
    t6 += v * b0;
    t7 += v * b1;
    t8 += v * b2;
    t9 += v * b3;
    t10 += v * b4;
    t11 += v * b5;
    t12 += v * b6;
    t13 += v * b7;
    t14 += v * b8;
    t15 += v * b9;
    t16 += v * b10;
    t17 += v * b11;
    t18 += v * b12;
    t19 += v * b13;
    t20 += v * b14;
    t21 += v * b15;
    v = a[7];
    t7 += v * b0;
    t8 += v * b1;
    t9 += v * b2;
    t10 += v * b3;
    t11 += v * b4;
    t12 += v * b5;
    t13 += v * b6;
    t14 += v * b7;
    t15 += v * b8;
    t16 += v * b9;
    t17 += v * b10;
    t18 += v * b11;
    t19 += v * b12;
    t20 += v * b13;
    t21 += v * b14;
    t22 += v * b15;
    v = a[8];
    t8 += v * b0;
    t9 += v * b1;
    t10 += v * b2;
    t11 += v * b3;
    t12 += v * b4;
    t13 += v * b5;
    t14 += v * b6;
    t15 += v * b7;
    t16 += v * b8;
    t17 += v * b9;
    t18 += v * b10;
    t19 += v * b11;
    t20 += v * b12;
    t21 += v * b13;
    t22 += v * b14;
    t23 += v * b15;
    v = a[9];
    t9 += v * b0;
    t10 += v * b1;
    t11 += v * b2;
    t12 += v * b3;
    t13 += v * b4;
    t14 += v * b5;
    t15 += v * b6;
    t16 += v * b7;
    t17 += v * b8;
    t18 += v * b9;
    t19 += v * b10;
    t20 += v * b11;
    t21 += v * b12;
    t22 += v * b13;
    t23 += v * b14;
    t24 += v * b15;
    v = a[10];
    t10 += v * b0;
    t11 += v * b1;
    t12 += v * b2;
    t13 += v * b3;
    t14 += v * b4;
    t15 += v * b5;
    t16 += v * b6;
    t17 += v * b7;
    t18 += v * b8;
    t19 += v * b9;
    t20 += v * b10;
    t21 += v * b11;
    t22 += v * b12;
    t23 += v * b13;
    t24 += v * b14;
    t25 += v * b15;
    v = a[11];
    t11 += v * b0;
    t12 += v * b1;
    t13 += v * b2;
    t14 += v * b3;
    t15 += v * b4;
    t16 += v * b5;
    t17 += v * b6;
    t18 += v * b7;
    t19 += v * b8;
    t20 += v * b9;
    t21 += v * b10;
    t22 += v * b11;
    t23 += v * b12;
    t24 += v * b13;
    t25 += v * b14;
    t26 += v * b15;
    v = a[12];
    t12 += v * b0;
    t13 += v * b1;
    t14 += v * b2;
    t15 += v * b3;
    t16 += v * b4;
    t17 += v * b5;
    t18 += v * b6;
    t19 += v * b7;
    t20 += v * b8;
    t21 += v * b9;
    t22 += v * b10;
    t23 += v * b11;
    t24 += v * b12;
    t25 += v * b13;
    t26 += v * b14;
    t27 += v * b15;
    v = a[13];
    t13 += v * b0;
    t14 += v * b1;
    t15 += v * b2;
    t16 += v * b3;
    t17 += v * b4;
    t18 += v * b5;
    t19 += v * b6;
    t20 += v * b7;
    t21 += v * b8;
    t22 += v * b9;
    t23 += v * b10;
    t24 += v * b11;
    t25 += v * b12;
    t26 += v * b13;
    t27 += v * b14;
    t28 += v * b15;
    v = a[14];
    t14 += v * b0;
    t15 += v * b1;
    t16 += v * b2;
    t17 += v * b3;
    t18 += v * b4;
    t19 += v * b5;
    t20 += v * b6;
    t21 += v * b7;
    t22 += v * b8;
    t23 += v * b9;
    t24 += v * b10;
    t25 += v * b11;
    t26 += v * b12;
    t27 += v * b13;
    t28 += v * b14;
    t29 += v * b15;
    v = a[15];
    t15 += v * b0;
    t16 += v * b1;
    t17 += v * b2;
    t18 += v * b3;
    t19 += v * b4;
    t20 += v * b5;
    t21 += v * b6;
    t22 += v * b7;
    t23 += v * b8;
    t24 += v * b9;
    t25 += v * b10;
    t26 += v * b11;
    t27 += v * b12;
    t28 += v * b13;
    t29 += v * b14;
    t30 += v * b15;
    t0  += 38 * t16;
    t1  += 38 * t17;
    t2  += 38 * t18;
    t3  += 38 * t19;
    t4  += 38 * t20;
    t5  += 38 * t21;
    t6  += 38 * t22;
    t7  += 38 * t23;
    t8  += 38 * t24;
    t9  += 38 * t25;
    t10 += 38 * t26;
    t11 += 38 * t27;
    t12 += 38 * t28;
    t13 += 38 * t29;
    t14 += 38 * t30;
    c = 1;
    v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
    v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
    v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
    v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
    v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
    v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
    v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
    v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
    v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
    v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
    v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
    v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
    v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
    v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
    v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
    v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
    t0 += c-1 + 37 * (c-1);
    c = 1;
    v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
    v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
    v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
    v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
    v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
    v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
    v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
    v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
    v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
    v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
    v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
    v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
    v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
    v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
    v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
    v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
    t0 += c-1 + 37 * (c-1);
    o[ 0] = t0;
    o[ 1] = t1;
    o[ 2] = t2;
    o[ 3] = t3;
    o[ 4] = t4;
    o[ 5] = t5;
    o[ 6] = t6;
    o[ 7] = t7;
    o[ 8] = t8;
    o[ 9] = t9;
    o[10] = t10;
    o[11] = t11;
    o[12] = t12;
    o[13] = t13;
    o[14] = t14;
    o[15] = t15;
  }
  function S(o, a) {
    M(o, a, a);
  }
  function inv25519(o, i) {
    var c = gf();
    var a;
    for (a = 0; a < 16; a++) c[a] = i[a];
    for (a = 253; a >= 0; a--) {
      S(c, c);
      if(a !== 2 && a !== 4) M(c, c, i);
    }
    for (a = 0; a < 16; a++) o[a] = c[a];
  }
  function pow2523(o, i) {
    var c = gf();
    var a;
    for (a = 0; a < 16; a++) c[a] = i[a];
    for (a = 250; a >= 0; a--) {
        S(c, c);
        if(a !== 1) M(c, c, i);
    }
    for (a = 0; a < 16; a++) o[a] = c[a];
  }
  function crypto_scalarmult(q, n, p) {
    var z = new Uint8Array(32);
    var x = new Float64Array(80), r, i;
    var a = gf(), b = gf(), c = gf(),
        d = gf(), e = gf(), f = gf();
    for (i = 0; i < 31; i++) z[i] = n[i];
    z[31]=(n[31]&127)|64;
    z[0]&=248;
    unpack25519(x,p);
    for (i = 0; i < 16; i++) {
      b[i]=x[i];
      d[i]=a[i]=c[i]=0;
    }
    a[0]=d[0]=1;
    for (i=254; i>=0; --i) {
      r=(z[i>>>3]>>>(i&7))&1;
      sel25519(a,b,r);
      sel25519(c,d,r);
      A(e,a,c);
      Z(a,a,c);
      A(c,b,d);
      Z(b,b,d);
      S(d,e);
      S(f,a);
      M(a,c,a);
      M(c,b,e);
      A(e,a,c);
      Z(a,a,c);
      S(b,a);
      Z(c,d,f);
      M(a,c,_121665);
      A(a,a,d);
      M(c,c,a);
      M(a,d,f);
      M(d,b,x);
      S(b,e);
      sel25519(a,b,r);
      sel25519(c,d,r);
    }
    for (i = 0; i < 16; i++) {
      x[i+16]=a[i];
      x[i+32]=c[i];
      x[i+48]=b[i];
      x[i+64]=d[i];
    }
    var x32 = x.subarray(32);
    var x16 = x.subarray(16);
    inv25519(x32,x32);
    M(x16,x16,x32);
    pack25519(q,x16);
    return 0;
  }
  function crypto_scalarmult_base(q, n) {
    return crypto_scalarmult(q, n, _9);
  }
  function crypto_box_keypair(y, x) {
    randombytes(x, 32);
    return crypto_scalarmult_base(y, x);
  }
  function crypto_box_beforenm(k, y, x) {
    var s = new Uint8Array(32);
    crypto_scalarmult(s, x, y);
    return crypto_core_hsalsa20(k, _0, s, sigma);
  }
  var crypto_box_afternm = crypto_secretbox;
  var crypto_box_open_afternm = crypto_secretbox_open;
  function crypto_box(c, m, d, n, y, x) {
    var k = new Uint8Array(32);
    crypto_box_beforenm(k, y, x);
    return crypto_box_afternm(c, m, d, n, k);
  }
  function crypto_box_open(m, c, d, n, y, x) {
    var k = new Uint8Array(32);
    crypto_box_beforenm(k, y, x);
    return crypto_box_open_afternm(m, c, d, n, k);
  }
  var K = [
    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
  ];
  function crypto_hashblocks_hl(hh, hl, m, n) {
    var wh = new Int32Array(16), wl = new Int32Array(16),
        bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
        bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
        th, tl, i, j, h, l, a, b, c, d;
    var ah0 = hh[0],
        ah1 = hh[1],
        ah2 = hh[2],
        ah3 = hh[3],
        ah4 = hh[4],
        ah5 = hh[5],
        ah6 = hh[6],
        ah7 = hh[7],
        al0 = hl[0],
        al1 = hl[1],
        al2 = hl[2],
        al3 = hl[3],
        al4 = hl[4],
        al5 = hl[5],
        al6 = hl[6],
        al7 = hl[7];
    var pos = 0;
    while (n >= 128) {
      for (i = 0; i < 16; i++) {
        j = 8 * i + pos;
        wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
        wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
      }
      for (i = 0; i < 80; i++) {
        bh0 = ah0;
        bh1 = ah1;
        bh2 = ah2;
        bh3 = ah3;
        bh4 = ah4;
        bh5 = ah5;
        bh6 = ah6;
        bh7 = ah7;
        bl0 = al0;
        bl1 = al1;
        bl2 = al2;
        bl3 = al3;
        bl4 = al4;
        bl5 = al5;
        bl6 = al6;
        bl7 = al7;
        h = ah7;
        l = al7;
        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;
        h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
        l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        h = (ah4 & ah5) ^ (~ah4 & ah6);
        l = (al4 & al5) ^ (~al4 & al6);
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        h = K[i*2];
        l = K[i*2+1];
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        h = wh[i%16];
        l = wl[i%16];
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;
        th = c & 0xffff | d << 16;
        tl = a & 0xffff | b << 16;
        h = th;
        l = tl;
        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;
        h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
        l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
        l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;
        bh7 = (c & 0xffff) | (d << 16);
        bl7 = (a & 0xffff) | (b << 16);
        h = bh3;
        l = bl3;
        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;
        h = th;
        l = tl;
        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;
        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;
        bh3 = (c & 0xffff) | (d << 16);
        bl3 = (a & 0xffff) | (b << 16);
        ah1 = bh0;
        ah2 = bh1;
        ah3 = bh2;
        ah4 = bh3;
        ah5 = bh4;
        ah6 = bh5;
        ah7 = bh6;
        ah0 = bh7;
        al1 = bl0;
        al2 = bl1;
        al3 = bl2;
        al4 = bl3;
        al5 = bl4;
        al6 = bl5;
        al7 = bl6;
        al0 = bl7;
        if (i%16 === 15) {
          for (j = 0; j < 16; j++) {
            h = wh[j];
            l = wl[j];
            a = l & 0xffff; b = l >>> 16;
            c = h & 0xffff; d = h >>> 16;
            h = wh[(j+9)%16];
            l = wl[(j+9)%16];
            a += l & 0xffff; b += l >>> 16;
            c += h & 0xffff; d += h >>> 16;
            th = wh[(j+1)%16];
            tl = wl[(j+1)%16];
            h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
            l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));
            a += l & 0xffff; b += l >>> 16;
            c += h & 0xffff; d += h >>> 16;
            th = wh[(j+14)%16];
            tl = wl[(j+14)%16];
            h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
            l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));
            a += l & 0xffff; b += l >>> 16;
            c += h & 0xffff; d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            wh[j] = (c & 0xffff) | (d << 16);
            wl[j] = (a & 0xffff) | (b << 16);
          }
        }
      }
      h = ah0;
      l = al0;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[0];
      l = hl[0];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[0] = ah0 = (c & 0xffff) | (d << 16);
      hl[0] = al0 = (a & 0xffff) | (b << 16);
      h = ah1;
      l = al1;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[1];
      l = hl[1];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[1] = ah1 = (c & 0xffff) | (d << 16);
      hl[1] = al1 = (a & 0xffff) | (b << 16);
      h = ah2;
      l = al2;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[2];
      l = hl[2];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[2] = ah2 = (c & 0xffff) | (d << 16);
      hl[2] = al2 = (a & 0xffff) | (b << 16);
      h = ah3;
      l = al3;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[3];
      l = hl[3];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[3] = ah3 = (c & 0xffff) | (d << 16);
      hl[3] = al3 = (a & 0xffff) | (b << 16);
      h = ah4;
      l = al4;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[4];
      l = hl[4];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[4] = ah4 = (c & 0xffff) | (d << 16);
      hl[4] = al4 = (a & 0xffff) | (b << 16);
      h = ah5;
      l = al5;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[5];
      l = hl[5];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[5] = ah5 = (c & 0xffff) | (d << 16);
      hl[5] = al5 = (a & 0xffff) | (b << 16);
      h = ah6;
      l = al6;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[6];
      l = hl[6];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[6] = ah6 = (c & 0xffff) | (d << 16);
      hl[6] = al6 = (a & 0xffff) | (b << 16);
      h = ah7;
      l = al7;
      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;
      h = hh[7];
      l = hl[7];
      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;
      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;
      hh[7] = ah7 = (c & 0xffff) | (d << 16);
      hl[7] = al7 = (a & 0xffff) | (b << 16);
      pos += 128;
      n -= 128;
    }
    return n;
  }
  function crypto_hash(out, m, n) {
    var hh = new Int32Array(8),
        hl = new Int32Array(8),
        x = new Uint8Array(256),
        i, b = n;
    hh[0] = 0x6a09e667;
    hh[1] = 0xbb67ae85;
    hh[2] = 0x3c6ef372;
    hh[3] = 0xa54ff53a;
    hh[4] = 0x510e527f;
    hh[5] = 0x9b05688c;
    hh[6] = 0x1f83d9ab;
    hh[7] = 0x5be0cd19;
    hl[0] = 0xf3bcc908;
    hl[1] = 0x84caa73b;
    hl[2] = 0xfe94f82b;
    hl[3] = 0x5f1d36f1;
    hl[4] = 0xade682d1;
    hl[5] = 0x2b3e6c1f;
    hl[6] = 0xfb41bd6b;
    hl[7] = 0x137e2179;
    crypto_hashblocks_hl(hh, hl, m, n);
    n %= 128;
    for (i = 0; i < n; i++) x[i] = m[b-n+i];
    x[n] = 128;
    n = 256-128*(n<112?1:0);
    x[n-9] = 0;
    ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
    crypto_hashblocks_hl(hh, hl, x, n);
    for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);
    return 0;
  }
  function add(p, q) {
    var a = gf(), b = gf(), c = gf(),
        d = gf(), e = gf(), f = gf(),
        g = gf(), h = gf(), t = gf();
    Z(a, p[1], p[0]);
    Z(t, q[1], q[0]);
    M(a, a, t);
    A(b, p[0], p[1]);
    A(t, q[0], q[1]);
    M(b, b, t);
    M(c, p[3], q[3]);
    M(c, c, D2);
    M(d, p[2], q[2]);
    A(d, d, d);
    Z(e, b, a);
    Z(f, d, c);
    A(g, d, c);
    A(h, b, a);
    M(p[0], e, f);
    M(p[1], h, g);
    M(p[2], g, f);
    M(p[3], e, h);
  }
  function cswap(p, q, b) {
    var i;
    for (i = 0; i < 4; i++) {
      sel25519(p[i], q[i], b);
    }
  }
  function pack(r, p) {
    var tx = gf(), ty = gf(), zi = gf();
    inv25519(zi, p[2]);
    M(tx, p[0], zi);
    M(ty, p[1], zi);
    pack25519(r, ty);
    r[31] ^= par25519(tx) << 7;
  }
  function scalarmult(p, q, s) {
    var b, i;
    set25519(p[0], gf0);
    set25519(p[1], gf1);
    set25519(p[2], gf1);
    set25519(p[3], gf0);
    for (i = 255; i >= 0; --i) {
      b = (s[(i/8)|0] >> (i&7)) & 1;
      cswap(p, q, b);
      add(q, p);
      add(p, p);
      cswap(p, q, b);
    }
  }
  function scalarbase(p, s) {
    var q = [gf(), gf(), gf(), gf()];
    set25519(q[0], X);
    set25519(q[1], Y);
    set25519(q[2], gf1);
    M(q[3], X, Y);
    scalarmult(p, q, s);
  }
  function crypto_sign_keypair(pk, sk, seeded) {
    var d = new Uint8Array(64);
    var p = [gf(), gf(), gf(), gf()];
    var i;
    if (!seeded) randombytes(sk, 32);
    crypto_hash(d, sk, 32);
    d[0] &= 248;
    d[31] &= 127;
    d[31] |= 64;
    scalarbase(p, d);
    pack(pk, p);
    for (i = 0; i < 32; i++) sk[i+32] = pk[i];
    return 0;
  }
  var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);
  function modL(r, x) {
    var carry, i, j, k;
    for (i = 63; i >= 32; --i) {
      carry = 0;
      for (j = i - 32, k = i - 12; j < k; ++j) {
        x[j] += carry - 16 * x[i] * L[j - (i - 32)];
        carry = Math.floor((x[j] + 128) / 256);
        x[j] -= carry * 256;
      }
      x[j] += carry;
      x[i] = 0;
    }
    carry = 0;
    for (j = 0; j < 32; j++) {
      x[j] += carry - (x[31] >> 4) * L[j];
      carry = x[j] >> 8;
      x[j] &= 255;
    }
    for (j = 0; j < 32; j++) x[j] -= carry * L[j];
    for (i = 0; i < 32; i++) {
      x[i+1] += x[i] >> 8;
      r[i] = x[i] & 255;
    }
  }
  function reduce(r) {
    var x = new Float64Array(64), i;
    for (i = 0; i < 64; i++) x[i] = r[i];
    for (i = 0; i < 64; i++) r[i] = 0;
    modL(r, x);
  }
  function crypto_sign(sm, m, n, sk) {
    var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
    var i, j, x = new Float64Array(64);
    var p = [gf(), gf(), gf(), gf()];
    crypto_hash(d, sk, 32);
    d[0] &= 248;
    d[31] &= 127;
    d[31] |= 64;
    var smlen = n + 64;
    for (i = 0; i < n; i++) sm[64 + i] = m[i];
    for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
    crypto_hash(r, sm.subarray(32), n+32);
    reduce(r);
    scalarbase(p, r);
    pack(sm, p);
    for (i = 32; i < 64; i++) sm[i] = sk[i];
    crypto_hash(h, sm, n + 64);
    reduce(h);
    for (i = 0; i < 64; i++) x[i] = 0;
    for (i = 0; i < 32; i++) x[i] = r[i];
    for (i = 0; i < 32; i++) {
      for (j = 0; j < 32; j++) {
        x[i+j] += h[i] * d[j];
      }
    }
    modL(sm.subarray(32), x);
    return smlen;
  }
  function unpackneg(r, p) {
    var t = gf(), chk = gf(), num = gf(),
        den = gf(), den2 = gf(), den4 = gf(),
        den6 = gf();
    set25519(r[2], gf1);
    unpack25519(r[1], p);
    S(num, r[1]);
    M(den, num, D);
    Z(num, num, r[2]);
    A(den, r[2], den);
    S(den2, den);
    S(den4, den2);
    M(den6, den4, den2);
    M(t, den6, num);
    M(t, t, den);
    pow2523(t, t);
    M(t, t, num);
    M(t, t, den);
    M(t, t, den);
    M(r[0], t, den);
    S(chk, r[0]);
    M(chk, chk, den);
    if (neq25519(chk, num)) M(r[0], r[0], I);
    S(chk, r[0]);
    M(chk, chk, den);
    if (neq25519(chk, num)) return -1;
    if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);
    M(r[3], r[0], r[1]);
    return 0;
  }
  function crypto_sign_open(m, sm, n, pk) {
    var i;
    var t = new Uint8Array(32), h = new Uint8Array(64);
    var p = [gf(), gf(), gf(), gf()],
        q = [gf(), gf(), gf(), gf()];
    if (n < 64) return -1;
    if (unpackneg(q, pk)) return -1;
    for (i = 0; i < n; i++) m[i] = sm[i];
    for (i = 0; i < 32; i++) m[i+32] = pk[i];
    crypto_hash(h, m, n);
    reduce(h);
    scalarmult(p, q, h);
    scalarbase(q, sm.subarray(32));
    add(p, q);
    pack(t, p);
    n -= 64;
    if (crypto_verify_32(sm, 0, t, 0)) {
      for (i = 0; i < n; i++) m[i] = 0;
      return -1;
    }
    for (i = 0; i < n; i++) m[i] = sm[i + 64];
    return n;
  }
  var crypto_secretbox_KEYBYTES = 32,
      crypto_secretbox_NONCEBYTES = 24,
      crypto_secretbox_ZEROBYTES = 32,
      crypto_secretbox_BOXZEROBYTES = 16,
      crypto_scalarmult_BYTES = 32,
      crypto_scalarmult_SCALARBYTES = 32,
      crypto_box_PUBLICKEYBYTES = 32,
      crypto_box_SECRETKEYBYTES = 32,
      crypto_box_BEFORENMBYTES = 32,
      crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
      crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
      crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
      crypto_sign_BYTES = 64,
      crypto_sign_PUBLICKEYBYTES = 32,
      crypto_sign_SECRETKEYBYTES = 64,
      crypto_sign_SEEDBYTES = 32,
      crypto_hash_BYTES = 64;
  nacl.lowlevel = {
    crypto_core_hsalsa20: crypto_core_hsalsa20,
    crypto_stream_xor: crypto_stream_xor,
    crypto_stream: crypto_stream,
    crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
    crypto_stream_salsa20: crypto_stream_salsa20,
    crypto_onetimeauth: crypto_onetimeauth,
    crypto_onetimeauth_verify: crypto_onetimeauth_verify,
    crypto_verify_16: crypto_verify_16,
    crypto_verify_32: crypto_verify_32,
    crypto_secretbox: crypto_secretbox,
    crypto_secretbox_open: crypto_secretbox_open,
    crypto_scalarmult: crypto_scalarmult,
    crypto_scalarmult_base: crypto_scalarmult_base,
    crypto_box_beforenm: crypto_box_beforenm,
    crypto_box_afternm: crypto_box_afternm,
    crypto_box: crypto_box,
    crypto_box_open: crypto_box_open,
    crypto_box_keypair: crypto_box_keypair,
    crypto_hash: crypto_hash,
    crypto_sign: crypto_sign,
    crypto_sign_keypair: crypto_sign_keypair,
    crypto_sign_open: crypto_sign_open,
    crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
    crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
    crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
    crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
    crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
    crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
    crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
    crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
    crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
    crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
    crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
    crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
    crypto_sign_BYTES: crypto_sign_BYTES,
    crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
    crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
    crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
    crypto_hash_BYTES: crypto_hash_BYTES,
    gf: gf,
    D: D,
    L: L,
    pack25519: pack25519,
    unpack25519: unpack25519,
    M: M,
    A: A,
    S: S,
    Z: Z,
    pow2523: pow2523,
    add: add,
    set25519: set25519,
    modL: modL,
    scalarmult: scalarmult,
    scalarbase: scalarbase,
  };
  function checkLengths(k, n) {
    if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
    if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
  }
  function checkBoxLengths(pk, sk) {
    if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
    if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
  }
  function checkArrayTypes() {
    for (var i = 0; i < arguments.length; i++) {
      if (!(arguments[i] instanceof Uint8Array))
        throw new TypeError('unexpected type, use Uint8Array');
    }
  }
  function cleanup(arr) {
    for (var i = 0; i < arr.length; i++) arr[i] = 0;
  }
  nacl.randomBytes = function(n) {
    var b = new Uint8Array(n);
    randombytes(b, n);
    return b;
  };
  nacl.secretbox = function(msg, nonce, key) {
    checkArrayTypes(msg, nonce, key);
    checkLengths(key, nonce);
    var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
    var c = new Uint8Array(m.length);
    for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
    crypto_secretbox(c, m, m.length, nonce, key);
    return c.subarray(crypto_secretbox_BOXZEROBYTES);
  };
  nacl.secretbox.open = function(box, nonce, key) {
    checkArrayTypes(box, nonce, key);
    checkLengths(key, nonce);
    var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
    var m = new Uint8Array(c.length);
    for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
    if (c.length < 32) return null;
    if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
    return m.subarray(crypto_secretbox_ZEROBYTES);
  };
  nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
  nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
  nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
  nacl.scalarMult = function(n, p) {
    checkArrayTypes(n, p);
    if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
    if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
    var q = new Uint8Array(crypto_scalarmult_BYTES);
    crypto_scalarmult(q, n, p);
    return q;
  };
  nacl.scalarMult.base = function(n) {
    checkArrayTypes(n);
    if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
    var q = new Uint8Array(crypto_scalarmult_BYTES);
    crypto_scalarmult_base(q, n);
    return q;
  };
  nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
  nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
  nacl.box = function(msg, nonce, publicKey, secretKey) {
    var k = nacl.box.before(publicKey, secretKey);
    return nacl.secretbox(msg, nonce, k);
  };
  nacl.box.before = function(publicKey, secretKey) {
    checkArrayTypes(publicKey, secretKey);
    checkBoxLengths(publicKey, secretKey);
    var k = new Uint8Array(crypto_box_BEFORENMBYTES);
    crypto_box_beforenm(k, publicKey, secretKey);
    return k;
  };
  nacl.box.after = nacl.secretbox;
  nacl.box.open = function(msg, nonce, publicKey, secretKey) {
    var k = nacl.box.before(publicKey, secretKey);
    return nacl.secretbox.open(msg, nonce, k);
  };
  nacl.box.open.after = nacl.secretbox.open;
  nacl.box.keyPair = function() {
    var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
    var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
    crypto_box_keypair(pk, sk);
    return {publicKey: pk, secretKey: sk};
  };
  nacl.box.keyPair.fromSecretKey = function(secretKey) {
    checkArrayTypes(secretKey);
    if (secretKey.length !== crypto_box_SECRETKEYBYTES)
      throw new Error('bad secret key size');
    var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
    crypto_scalarmult_base(pk, secretKey);
    return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
  };
  nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
  nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
  nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
  nacl.box.nonceLength = crypto_box_NONCEBYTES;
  nacl.box.overheadLength = nacl.secretbox.overheadLength;
  nacl.sign = function(msg, secretKey) {
    checkArrayTypes(msg, secretKey);
    if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
      throw new Error('bad secret key size');
    var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
    crypto_sign(signedMsg, msg, msg.length, secretKey);
    return signedMsg;
  };
  nacl.sign.open = function(signedMsg, publicKey) {
    checkArrayTypes(signedMsg, publicKey);
    if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
      throw new Error('bad public key size');
    var tmp = new Uint8Array(signedMsg.length);
    var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
    if (mlen < 0) return null;
    var m = new Uint8Array(mlen);
    for (var i = 0; i < m.length; i++) m[i] = tmp[i];
    return m;
  };
  nacl.sign.detached = function(msg, secretKey) {
    var signedMsg = nacl.sign(msg, secretKey);
    var sig = new Uint8Array(crypto_sign_BYTES);
    for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
    return sig;
  };
  nacl.sign.detached.verify = function(msg, sig, publicKey) {
    checkArrayTypes(msg, sig, publicKey);
    if (sig.length !== crypto_sign_BYTES)
      throw new Error('bad signature size');
    if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
      throw new Error('bad public key size');
    var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
    var m = new Uint8Array(crypto_sign_BYTES + msg.length);
    var i;
    for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
    for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
    return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
  };
  nacl.sign.keyPair = function() {
    var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
    var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
    crypto_sign_keypair(pk, sk);
    return {publicKey: pk, secretKey: sk};
  };
  nacl.sign.keyPair.fromSecretKey = function(secretKey) {
    checkArrayTypes(secretKey);
    if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
      throw new Error('bad secret key size');
    var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
    for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
    return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
  };
  nacl.sign.keyPair.fromSeed = function(seed) {
    checkArrayTypes(seed);
    if (seed.length !== crypto_sign_SEEDBYTES)
      throw new Error('bad seed size');
    var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
    var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
    for (var i = 0; i < 32; i++) sk[i] = seed[i];
    crypto_sign_keypair(pk, sk, true);
    return {publicKey: pk, secretKey: sk};
  };
  nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
  nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
  nacl.sign.seedLength = crypto_sign_SEEDBYTES;
  nacl.sign.signatureLength = crypto_sign_BYTES;
  nacl.hash = function(msg) {
    checkArrayTypes(msg);
    var h = new Uint8Array(crypto_hash_BYTES);
    crypto_hash(h, msg, msg.length);
    return h;
  };
  nacl.hash.hashLength = crypto_hash_BYTES;
  nacl.verify = function(x, y) {
    checkArrayTypes(x, y);
    if (x.length === 0 || y.length === 0) return false;
    if (x.length !== y.length) return false;
    return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
  };
  nacl.setPRNG = function(fn) {
    randombytes = fn;
  };
  (function() {
    var crypto = typeof self !== 'undefined' ? (self.crypto || self.msCrypto) : null;
    if (crypto && crypto.getRandomValues) {
      var QUOTA = 65536;
      nacl.setPRNG(function(x, n) {
        var i, v = new Uint8Array(n);
        for (i = 0; i < n; i += QUOTA) {
          crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
        }
        for (i = 0; i < n; i++) x[i] = v[i];
        cleanup(v);
      });
    } else if (typeof commonjsRequire !== 'undefined') {
      crypto = require$$0;
      if (crypto && crypto.randomBytes) {
        nacl.setPRNG(function(x, n) {
          var i, v = crypto.randomBytes(n);
          for (i = 0; i < n; i++) x[i] = v[i];
          cleanup(v);
        });
      }
    }
  })();
  })(module.exports ? module.exports : (self.nacl = self.nacl || {}));
  }(naclFast));
  const nacl = naclFast.exports;

  (function (module) {
  (function(root, f) {
    if (module.exports) module.exports = f(naclFast.exports);
    else root.ed2curve = f(root.nacl);
  }(commonjsGlobal, function(nacl) {
    if (!nacl) throw new Error('tweetnacl not loaded');
    var gf = function(init) {
      var i, r = new Float64Array(16);
      if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
      return r;
    };
    var gf0 = gf(),
        gf1 = gf([1]),
        D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
        I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);
    function car25519(o) {
      var c;
      var i;
      for (i = 0; i < 16; i++) {
        o[i] += 65536;
        c = Math.floor(o[i] / 65536);
        o[(i+1)*(i<15?1:0)] += c - 1 + 37 * (c-1) * (i===15?1:0);
        o[i] -= (c * 65536);
      }
    }
    function sel25519(p, q, b) {
      var t, c = ~(b-1);
      for (var i = 0; i < 16; i++) {
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
      }
    }
    function unpack25519(o, n) {
      var i;
      for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
      o[15] &= 0x7fff;
    }
    function A(o, a, b) {
      var i;
      for (i = 0; i < 16; i++) o[i] = (a[i] + b[i])|0;
    }
    function Z(o, a, b) {
      var i;
      for (i = 0; i < 16; i++) o[i] = (a[i] - b[i])|0;
    }
    function M(o, a, b) {
      var i, j, t = new Float64Array(31);
      for (i = 0; i < 31; i++) t[i] = 0;
      for (i = 0; i < 16; i++) {
        for (j = 0; j < 16; j++) {
          t[i+j] += a[i] * b[j];
        }
      }
      for (i = 0; i < 15; i++) {
        t[i] += 38 * t[i+16];
      }
      for (i = 0; i < 16; i++) o[i] = t[i];
      car25519(o);
      car25519(o);
    }
    function S(o, a) {
      M(o, a, a);
    }
    function inv25519(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 253; a >= 0; a--) {
        S(c, c);
        if(a !== 2 && a !== 4) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }
    function pack25519(o, n) {
      var i, j, b;
      var m = gf(), t = gf();
      for (i = 0; i < 16; i++) t[i] = n[i];
      car25519(t);
      car25519(t);
      car25519(t);
      for (j = 0; j < 2; j++) {
        m[0] = t[0] - 0xffed;
        for (i = 1; i < 15; i++) {
          m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
          m[i-1] &= 0xffff;
        }
        m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
        b = (m[15]>>16) & 1;
        m[14] &= 0xffff;
        sel25519(t, m, 1-b);
      }
      for (i = 0; i < 16; i++) {
        o[2*i] = t[i] & 0xff;
        o[2*i+1] = t[i] >> 8;
      }
    }
    function par25519(a) {
      var d = new Uint8Array(32);
      pack25519(d, a);
      return d[0] & 1;
    }
    function vn(x, xi, y, yi, n) {
      var i, d = 0;
      for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
      return (1 & ((d - 1) >>> 8)) - 1;
    }
    function crypto_verify_32(x, xi, y, yi) {
      return vn(x, xi, y, yi, 32);
    }
    function neq25519(a, b) {
      var c = new Uint8Array(32), d = new Uint8Array(32);
      pack25519(c, a);
      pack25519(d, b);
      return crypto_verify_32(c, 0, d, 0);
    }
    function pow2523(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 250; a >= 0; a--) {
        S(c, c);
        if (a !== 1) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }
    function set25519(r, a) {
      var i;
      for (i = 0; i < 16; i++) r[i] = a[i] | 0;
    }
    function unpackneg(r, p) {
      var t = gf(), chk = gf(), num = gf(),
        den = gf(), den2 = gf(), den4 = gf(),
        den6 = gf();
      set25519(r[2], gf1);
      unpack25519(r[1], p);
      S(num, r[1]);
      M(den, num, D);
      Z(num, num, r[2]);
      A(den, r[2], den);
      S(den2, den);
      S(den4, den2);
      M(den6, den4, den2);
      M(t, den6, num);
      M(t, t, den);
      pow2523(t, t);
      M(t, t, num);
      M(t, t, den);
      M(t, t, den);
      M(r[0], t, den);
      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) M(r[0], r[0], I);
      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) return -1;
      if (par25519(r[0]) === (p[31] >> 7)) Z(r[0], gf0, r[0]);
      M(r[3], r[0], r[1]);
      return 0;
    }
    function convertPublicKey(pk) {
      var z = new Uint8Array(32),
        q = [gf(), gf(), gf(), gf()],
        a = gf(), b = gf();
      if (unpackneg(q, pk)) return null;
      var y = q[1];
      A(a, gf1, y);
      Z(b, gf1, y);
      inv25519(b, b);
      M(a, a, b);
      pack25519(z, a);
      return z;
    }
    function convertSecretKey(sk) {
      var d = new Uint8Array(64), o = new Uint8Array(32), i;
      nacl.lowlevel.crypto_hash(d, sk, 32);
      d[0] &= 248;
      d[31] &= 127;
      d[31] |= 64;
      for (i = 0; i < 32; i++) o[i] = d[i];
      for (i = 0; i < 64; i++) d[i] = 0;
      return o;
    }
    function convertKeyPair(edKeyPair) {
      var publicKey = convertPublicKey(edKeyPair.publicKey);
      if (!publicKey) return null;
      return {
        publicKey: publicKey,
        secretKey: convertSecretKey(edKeyPair.secretKey)
      };
    }
    return {
      convertPublicKey: convertPublicKey,
      convertSecretKey: convertSecretKey,
      convertKeyPair: convertKeyPair,
    };
  }));
  }(ed2curve$1));
  const ed2curve = ed2curve$1.exports;

  function convertSecretKeyToCurve25519(secretKey) {
    return ed2curve.convertSecretKey(secretKey);
  }
  function convertPublicKeyToCurve25519(publicKey) {
    return util.assertReturn(ed2curve.convertPublicKey(publicKey), 'Unable to convert publicKey to ed25519');
  }

  const HDKD = util.compactAddLength(util.stringToU8a('Ed25519HDKD'));
  function ed25519DeriveHard(seed, chainCode) {
    util.assert(util.isU8a(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
    return blake2AsU8a(util.u8aConcat(HDKD, seed, chainCode));
  }

  function randomAsU8a(length = 32) {
    return getRandomValues(new Uint8Array(length));
  }
  const randomAsHex = createAsHex(randomAsU8a);

  const BN_53 = new util.BN(0b11111111111111111111111111111111111111111111111111111);
  function randomAsNumber() {
    return util.hexToBn(randomAsHex(8)).and(BN_53).toNumber();
  }

  function ed25519PairFromSeed(seed, onlyJs) {
    if (!onlyJs && isReady()) {
      const full = ed25519KeypairFromSeed(seed);
      return {
        publicKey: full.slice(32),
        secretKey: full.slice(0, 64)
      };
    }
    return nacl.sign.keyPair.fromSeed(seed);
  }

  function ed25519PairFromRandom() {
    return ed25519PairFromSeed(randomAsU8a());
  }

  function ed25519PairFromSecret(secret) {
    return nacl.sign.keyPair.fromSecretKey(secret);
  }

  function ed25519PairFromString(value) {
    return ed25519PairFromSeed(blake2AsU8a(util.stringToU8a(value)));
  }

  function ed25519Sign(message, {
    publicKey,
    secretKey
  }, onlyJs) {
    util.assert(secretKey, 'Expected a valid secretKey');
    const messageU8a = util.u8aToU8a(message);
    return !onlyJs && isReady() ? ed25519Sign$1(publicKey, secretKey.subarray(0, 32), messageU8a) : nacl.sign.detached(messageU8a, secretKey);
  }

  function ed25519Verify(message, signature, publicKey, onlyJs) {
    const messageU8a = util.u8aToU8a(message);
    const publicKeyU8a = util.u8aToU8a(publicKey);
    const signatureU8a = util.u8aToU8a(signature);
    util.assert(publicKeyU8a.length === 32, () => `Invalid publicKey, received ${publicKeyU8a.length}, expected 32`);
    util.assert(signatureU8a.length === 64, () => `Invalid signature, received ${signatureU8a.length} bytes, expected 64`);
    return !onlyJs && isReady() ? ed25519Verify$1(signatureU8a, messageU8a, publicKeyU8a) : nacl.sign.detached.verify(messageU8a, signatureU8a, publicKeyU8a);
  }

  function naclSeal(message, senderBoxSecret, receiverBoxPublic, nonce = randomAsU8a(24)) {
    return {
      nonce,
      sealed: nacl.box(message, nonce, receiverBoxPublic, senderBoxSecret)
    };
  }

  function ed25519Encrypt(message, receiverPublicKey, senderKeyPair) {
    const messageKeyPair = senderKeyPair || ed25519PairFromRandom();
    const x25519PublicKey = convertPublicKeyToCurve25519(receiverPublicKey);
    const x25519SecretKey = convertSecretKeyToCurve25519(messageKeyPair.secretKey);
    const {
      nonce,
      sealed
    } = naclSeal(util.u8aToU8a(message), x25519SecretKey, x25519PublicKey);
    return util.u8aConcat(nonce, messageKeyPair.publicKey, sealed);
  }

  function naclDecrypt(encrypted, nonce, secret) {
    return nacl.secretbox.open(encrypted, nonce, secret) || null;
  }

  function naclEncrypt(message, secret, nonce = randomAsU8a(24)) {
    return {
      encrypted: nacl.secretbox(message, nonce, secret),
      nonce
    };
  }

  function naclBoxPairFromSecret(secret) {
    return nacl.box.keyPair.fromSecretKey(secret.slice(0, 32));
  }

  function naclOpen(sealed, nonce, senderBoxPublic, receiverBoxSecret) {
    return nacl.box.open(sealed, nonce, senderBoxPublic, receiverBoxSecret) || null;
  }

  function ed25519Decrypt(encryptedMessage, {
    secretKey
  }) {
    const decapsulatedEncryptedMessage = ed25519DecapsulateEncryptedMessage(encryptedMessage);
    const x25519PublicKey = convertPublicKeyToCurve25519(decapsulatedEncryptedMessage.ephemeralPublicKey);
    const x25519SecretKey = convertSecretKeyToCurve25519(util.u8aToU8a(secretKey));
    return naclOpen(decapsulatedEncryptedMessage.sealed, decapsulatedEncryptedMessage.nonce, x25519PublicKey, x25519SecretKey);
  }
  function ed25519DecapsulateEncryptedMessage(encryptedMessage) {
    util.assert(encryptedMessage.length > nacl.box.publicKeyLength + nacl.box.nonceLength + nacl.box.overheadLength, 'Too short encrypted message');
    return {
      ephemeralPublicKey: util.u8aToU8a(encryptedMessage.slice(nacl.box.nonceLength, nacl.box.nonceLength + nacl.box.publicKeyLength)),
      nonce: util.u8aToU8a(encryptedMessage.slice(0, nacl.box.nonceLength)),
      sealed: util.u8aToU8a(encryptedMessage.slice(nacl.box.nonceLength + nacl.box.publicKeyLength))
    };
  }

  const keyHdkdEd25519 = createSeedDeriveFn(ed25519PairFromSeed, ed25519DeriveHard);

  const SEC_LEN = 64;
  const PUB_LEN = 32;
  const TOT_LEN = SEC_LEN + PUB_LEN;
  function sr25519PairFromU8a(full) {
    const fullU8a = util.u8aToU8a(full);
    util.assert(fullU8a.length === TOT_LEN, () => `Expected keypair with ${TOT_LEN} bytes, found ${fullU8a.length}`);
    return {
      publicKey: fullU8a.slice(SEC_LEN, TOT_LEN),
      secretKey: fullU8a.slice(0, SEC_LEN)
    };
  }

  function sr25519KeypairToU8a({
    publicKey,
    secretKey
  }) {
    return util.u8aConcat(secretKey, publicKey).slice();
  }

  function createDeriveFn(derive) {
    return (keypair, chainCode) => {
      util.assert(util.isU8a(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
      return sr25519PairFromU8a(derive(sr25519KeypairToU8a(keypair), chainCode));
    };
  }

  const sr25519DeriveHard = createDeriveFn(sr25519DeriveKeypairHard);

  const sr25519DeriveSoft = createDeriveFn(sr25519DeriveKeypairSoft);

  function keyHdkdSr25519(keypair, {
    chainCode,
    isSoft
  }) {
    return isSoft ? sr25519DeriveSoft(keypair, chainCode) : sr25519DeriveHard(keypair, chainCode);
  }

  const generators = {
    ecdsa: keyHdkdEcdsa,
    ed25519: keyHdkdEd25519,
    ethereum: keyHdkdEcdsa,
    sr25519: keyHdkdSr25519
  };
  function keyFromPath(pair, path, type) {
    const keyHdkd = generators[type];
    let result = pair;
    for (const junction of path) {
      result = keyHdkd(result, junction);
    }
    return result;
  }

  function sr25519Agreement(secretKey, publicKey) {
    const secretKeyU8a = util.u8aToU8a(secretKey);
    const publicKeyU8a = util.u8aToU8a(publicKey);
    util.assert(publicKeyU8a.length === 32, () => `Invalid publicKey, received ${publicKeyU8a.length} bytes, expected 32`);
    util.assert(secretKeyU8a.length === 64, () => `Invalid secretKey, received ${secretKeyU8a.length} bytes, expected 64`);
    return sr25519Agree(publicKeyU8a, secretKeyU8a);
  }

  function sr25519DerivePublic(publicKey, chainCode) {
    const publicKeyU8a = util.u8aToU8a(publicKey);
    util.assert(util.isU8a(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
    util.assert(publicKeyU8a.length === 32, () => `Invalid publicKey, received ${publicKeyU8a.length} bytes, expected 32`);
    return sr25519DerivePublicSoft(publicKeyU8a, chainCode);
  }

  function sr25519PairFromSeed(seed) {
    const seedU8a = util.u8aToU8a(seed);
    util.assert(seedU8a.length === 32, () => `Expected a seed matching 32 bytes, found ${seedU8a.length}`);
    return sr25519PairFromU8a(sr25519KeypairFromSeed(seedU8a));
  }

  function sr25519Sign(message, {
    publicKey,
    secretKey
  }) {
    util.assert((publicKey === null || publicKey === void 0 ? void 0 : publicKey.length) === 32, 'Expected a valid publicKey, 32-bytes');
    util.assert((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 64, 'Expected a valid secretKey, 64-bytes');
    return sr25519Sign$1(publicKey, secretKey, util.u8aToU8a(message));
  }

  function sr25519Verify(message, signature, publicKey) {
    const publicKeyU8a = util.u8aToU8a(publicKey);
    const signatureU8a = util.u8aToU8a(signature);
    util.assert(publicKeyU8a.length === 32, () => `Invalid publicKey, received ${publicKeyU8a.length} bytes, expected 32`);
    util.assert(signatureU8a.length === 64, () => `Invalid signature, received ${signatureU8a.length} bytes, expected 64`);
    return sr25519Verify$1(signatureU8a, util.u8aToU8a(message), publicKeyU8a);
  }

  const EMPTY_U8A$1 = new Uint8Array();
  function sr25519VrfSign(message, {
    secretKey
  }, context = EMPTY_U8A$1, extra = EMPTY_U8A$1) {
    util.assert((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 64, 'Invalid secretKey, expected 64-bytes');
    return vrfSign(secretKey, util.u8aToU8a(context), util.u8aToU8a(message), util.u8aToU8a(extra));
  }

  const EMPTY_U8A = new Uint8Array();
  function sr25519VrfVerify(message, signOutput, publicKey, context = EMPTY_U8A, extra = EMPTY_U8A) {
    const publicKeyU8a = util.u8aToU8a(publicKey);
    const proofU8a = util.u8aToU8a(signOutput);
    util.assert(publicKeyU8a.length === 32, 'Invalid publicKey, expected 32-bytes');
    util.assert(proofU8a.length === 96, 'Invalid vrfSign output, expected 96 bytes');
    return vrfVerify(publicKeyU8a, util.u8aToU8a(context), util.u8aToU8a(message), util.u8aToU8a(extra), proofU8a);
  }

  function pbkdf2Init(hash, _password, _salt, _opts) {
      assertHash(hash);
      const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
      const { c, dkLen, asyncTick } = opts;
      assertNumber(c);
      assertNumber(dkLen);
      assertNumber(asyncTick);
      if (c < 1)
          throw new Error('PBKDF2: iterations (c) should be >= 1');
      const password = toBytes(_password);
      const salt = toBytes(_salt);
      const DK = new Uint8Array(dkLen);
      const PRF = hmac.init(hash, password);
      const PRFSalt = PRF._cloneInto().update(salt);
      return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
  }
  function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
      PRF.destroy();
      PRFSalt.destroy();
      if (prfW)
          prfW.destroy();
      u.fill(0);
      return DK;
  }
  function pbkdf2(hash, password, salt, _opts) {
      const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, _opts);
      let prfW;
      const arr = new Uint8Array(4);
      const view = createView(arr);
      const u = new Uint8Array(PRF.outputLen);
      for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
          const Ti = DK.subarray(pos, pos + PRF.outputLen);
          view.setInt32(0, ti, false);
          (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
          Ti.set(u.subarray(0, Ti.length));
          for (let ui = 1; ui < c; ui++) {
              PRF._cloneInto(prfW).update(u).digestInto(u);
              for (let i = 0; i < Ti.length; i++)
                  Ti[i] ^= u[i];
          }
      }
      return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
  }

  function pbkdf2Encode(passphrase, salt = randomAsU8a(), rounds = 2048, onlyJs) {
    const u8aPass = util.u8aToU8a(passphrase);
    const u8aSalt = util.u8aToU8a(salt);
    return {
      password: !util.hasBigInt || !onlyJs && isReady() ? pbkdf2$1(u8aPass, u8aSalt, rounds) : pbkdf2(sha512, u8aPass, u8aSalt, {
        c: rounds,
        dkLen: 64
      }),
      rounds,
      salt
    };
  }

  const shaAsU8a = createDualHasher({
    256: sha256$1,
    512: sha512$1
  }, {
    256: sha256,
    512: sha512
  });
  const sha256AsU8a = createBitHasher(256, shaAsU8a);
  const sha512AsU8a = createBitHasher(512, shaAsU8a);

  const DEFAULT_WORDLIST = 'abandon|ability|able|about|above|absent|absorb|abstract|absurd|abuse|access|accident|account|accuse|achieve|acid|acoustic|acquire|across|act|action|actor|actress|actual|adapt|add|addict|address|adjust|admit|adult|advance|advice|aerobic|affair|afford|afraid|again|age|agent|agree|ahead|aim|air|airport|aisle|alarm|album|alcohol|alert|alien|all|alley|allow|almost|alone|alpha|already|also|alter|always|amateur|amazing|among|amount|amused|analyst|anchor|ancient|anger|angle|angry|animal|ankle|announce|annual|another|answer|antenna|antique|anxiety|any|apart|apology|appear|apple|approve|april|arch|arctic|area|arena|argue|arm|armed|armor|army|around|arrange|arrest|arrive|arrow|art|artefact|artist|artwork|ask|aspect|assault|asset|assist|assume|asthma|athlete|atom|attack|attend|attitude|attract|auction|audit|august|aunt|author|auto|autumn|average|avocado|avoid|awake|aware|away|awesome|awful|awkward|axis|baby|bachelor|bacon|badge|bag|balance|balcony|ball|bamboo|banana|banner|bar|barely|bargain|barrel|base|basic|basket|battle|beach|bean|beauty|because|become|beef|before|begin|behave|behind|believe|below|belt|bench|benefit|best|betray|better|between|beyond|bicycle|bid|bike|bind|biology|bird|birth|bitter|black|blade|blame|blanket|blast|bleak|bless|blind|blood|blossom|blouse|blue|blur|blush|board|boat|body|boil|bomb|bone|bonus|book|boost|border|boring|borrow|boss|bottom|bounce|box|boy|bracket|brain|brand|brass|brave|bread|breeze|brick|bridge|brief|bright|bring|brisk|broccoli|broken|bronze|broom|brother|brown|brush|bubble|buddy|budget|buffalo|build|bulb|bulk|bullet|bundle|bunker|burden|burger|burst|bus|business|busy|butter|buyer|buzz|cabbage|cabin|cable|cactus|cage|cake|call|calm|camera|camp|can|canal|cancel|candy|cannon|canoe|canvas|canyon|capable|capital|captain|car|carbon|card|cargo|carpet|carry|cart|case|cash|casino|castle|casual|cat|catalog|catch|category|cattle|caught|cause|caution|cave|ceiling|celery|cement|census|century|cereal|certain|chair|chalk|champion|change|chaos|chapter|charge|chase|chat|cheap|check|cheese|chef|cherry|chest|chicken|chief|child|chimney|choice|choose|chronic|chuckle|chunk|churn|cigar|cinnamon|circle|citizen|city|civil|claim|clap|clarify|claw|clay|clean|clerk|clever|click|client|cliff|climb|clinic|clip|clock|clog|close|cloth|cloud|clown|club|clump|cluster|clutch|coach|coast|coconut|code|coffee|coil|coin|collect|color|column|combine|come|comfort|comic|common|company|concert|conduct|confirm|congress|connect|consider|control|convince|cook|cool|copper|copy|coral|core|corn|correct|cost|cotton|couch|country|couple|course|cousin|cover|coyote|crack|cradle|craft|cram|crane|crash|crater|crawl|crazy|cream|credit|creek|crew|cricket|crime|crisp|critic|crop|cross|crouch|crowd|crucial|cruel|cruise|crumble|crunch|crush|cry|crystal|cube|culture|cup|cupboard|curious|current|curtain|curve|cushion|custom|cute|cycle|dad|damage|damp|dance|danger|daring|dash|daughter|dawn|day|deal|debate|debris|decade|december|decide|decline|decorate|decrease|deer|defense|define|defy|degree|delay|deliver|demand|demise|denial|dentist|deny|depart|depend|deposit|depth|deputy|derive|describe|desert|design|desk|despair|destroy|detail|detect|develop|device|devote|diagram|dial|diamond|diary|dice|diesel|diet|differ|digital|dignity|dilemma|dinner|dinosaur|direct|dirt|disagree|discover|disease|dish|dismiss|disorder|display|distance|divert|divide|divorce|dizzy|doctor|document|dog|doll|dolphin|domain|donate|donkey|donor|door|dose|double|dove|draft|dragon|drama|drastic|draw|dream|dress|drift|drill|drink|drip|drive|drop|drum|dry|duck|dumb|dune|during|dust|dutch|duty|dwarf|dynamic|eager|eagle|early|earn|earth|easily|east|easy|echo|ecology|economy|edge|edit|educate|effort|egg|eight|either|elbow|elder|electric|elegant|element|elephant|elevator|elite|else|embark|embody|embrace|emerge|emotion|employ|empower|empty|enable|enact|end|endless|endorse|enemy|energy|enforce|engage|engine|enhance|enjoy|enlist|enough|enrich|enroll|ensure|enter|entire|entry|envelope|episode|equal|equip|era|erase|erode|erosion|error|erupt|escape|essay|essence|estate|eternal|ethics|evidence|evil|evoke|evolve|exact|example|excess|exchange|excite|exclude|excuse|execute|exercise|exhaust|exhibit|exile|exist|exit|exotic|expand|expect|expire|explain|expose|express|extend|extra|eye|eyebrow|fabric|face|faculty|fade|faint|faith|fall|false|fame|family|famous|fan|fancy|fantasy|farm|fashion|fat|fatal|father|fatigue|fault|favorite|feature|february|federal|fee|feed|feel|female|fence|festival|fetch|fever|few|fiber|fiction|field|figure|file|film|filter|final|find|fine|finger|finish|fire|firm|first|fiscal|fish|fit|fitness|fix|flag|flame|flash|flat|flavor|flee|flight|flip|float|flock|floor|flower|fluid|flush|fly|foam|focus|fog|foil|fold|follow|food|foot|force|forest|forget|fork|fortune|forum|forward|fossil|foster|found|fox|fragile|frame|frequent|fresh|friend|fringe|frog|front|frost|frown|frozen|fruit|fuel|fun|funny|furnace|fury|future|gadget|gain|galaxy|gallery|game|gap|garage|garbage|garden|garlic|garment|gas|gasp|gate|gather|gauge|gaze|general|genius|genre|gentle|genuine|gesture|ghost|giant|gift|giggle|ginger|giraffe|girl|give|glad|glance|glare|glass|glide|glimpse|globe|gloom|glory|glove|glow|glue|goat|goddess|gold|good|goose|gorilla|gospel|gossip|govern|gown|grab|grace|grain|grant|grape|grass|gravity|great|green|grid|grief|grit|grocery|group|grow|grunt|guard|guess|guide|guilt|guitar|gun|gym|habit|hair|half|hammer|hamster|hand|happy|harbor|hard|harsh|harvest|hat|have|hawk|hazard|head|health|heart|heavy|hedgehog|height|hello|helmet|help|hen|hero|hidden|high|hill|hint|hip|hire|history|hobby|hockey|hold|hole|holiday|hollow|home|honey|hood|hope|horn|horror|horse|hospital|host|hotel|hour|hover|hub|huge|human|humble|humor|hundred|hungry|hunt|hurdle|hurry|hurt|husband|hybrid|ice|icon|idea|identify|idle|ignore|ill|illegal|illness|image|imitate|immense|immune|impact|impose|improve|impulse|inch|include|income|increase|index|indicate|indoor|industry|infant|inflict|inform|inhale|inherit|initial|inject|injury|inmate|inner|innocent|input|inquiry|insane|insect|inside|inspire|install|intact|interest|into|invest|invite|involve|iron|island|isolate|issue|item|ivory|jacket|jaguar|jar|jazz|jealous|jeans|jelly|jewel|job|join|joke|journey|joy|judge|juice|jump|jungle|junior|junk|just|kangaroo|keen|keep|ketchup|key|kick|kid|kidney|kind|kingdom|kiss|kit|kitchen|kite|kitten|kiwi|knee|knife|knock|know|lab|label|labor|ladder|lady|lake|lamp|language|laptop|large|later|latin|laugh|laundry|lava|law|lawn|lawsuit|layer|lazy|leader|leaf|learn|leave|lecture|left|leg|legal|legend|leisure|lemon|lend|length|lens|leopard|lesson|letter|level|liar|liberty|library|license|life|lift|light|like|limb|limit|link|lion|liquid|list|little|live|lizard|load|loan|lobster|local|lock|logic|lonely|long|loop|lottery|loud|lounge|love|loyal|lucky|luggage|lumber|lunar|lunch|luxury|lyrics|machine|mad|magic|magnet|maid|mail|main|major|make|mammal|man|manage|mandate|mango|mansion|manual|maple|marble|march|margin|marine|market|marriage|mask|mass|master|match|material|math|matrix|matter|maximum|maze|meadow|mean|measure|meat|mechanic|medal|media|melody|melt|member|memory|mention|menu|mercy|merge|merit|merry|mesh|message|metal|method|middle|midnight|milk|million|mimic|mind|minimum|minor|minute|miracle|mirror|misery|miss|mistake|mix|mixed|mixture|mobile|model|modify|mom|moment|monitor|monkey|monster|month|moon|moral|more|morning|mosquito|mother|motion|motor|mountain|mouse|move|movie|much|muffin|mule|multiply|muscle|museum|mushroom|music|must|mutual|myself|mystery|myth|naive|name|napkin|narrow|nasty|nation|nature|near|neck|need|negative|neglect|neither|nephew|nerve|nest|net|network|neutral|never|news|next|nice|night|noble|noise|nominee|noodle|normal|north|nose|notable|note|nothing|notice|novel|now|nuclear|number|nurse|nut|oak|obey|object|oblige|obscure|observe|obtain|obvious|occur|ocean|october|odor|off|offer|office|often|oil|okay|old|olive|olympic|omit|once|one|onion|online|only|open|opera|opinion|oppose|option|orange|orbit|orchard|order|ordinary|organ|orient|original|orphan|ostrich|other|outdoor|outer|output|outside|oval|oven|over|own|owner|oxygen|oyster|ozone|pact|paddle|page|pair|palace|palm|panda|panel|panic|panther|paper|parade|parent|park|parrot|party|pass|patch|path|patient|patrol|pattern|pause|pave|payment|peace|peanut|pear|peasant|pelican|pen|penalty|pencil|people|pepper|perfect|permit|person|pet|phone|photo|phrase|physical|piano|picnic|picture|piece|pig|pigeon|pill|pilot|pink|pioneer|pipe|pistol|pitch|pizza|place|planet|plastic|plate|play|please|pledge|pluck|plug|plunge|poem|poet|point|polar|pole|police|pond|pony|pool|popular|portion|position|possible|post|potato|pottery|poverty|powder|power|practice|praise|predict|prefer|prepare|present|pretty|prevent|price|pride|primary|print|priority|prison|private|prize|problem|process|produce|profit|program|project|promote|proof|property|prosper|protect|proud|provide|public|pudding|pull|pulp|pulse|pumpkin|punch|pupil|puppy|purchase|purity|purpose|purse|push|put|puzzle|pyramid|quality|quantum|quarter|question|quick|quit|quiz|quote|rabbit|raccoon|race|rack|radar|radio|rail|rain|raise|rally|ramp|ranch|random|range|rapid|rare|rate|rather|raven|raw|razor|ready|real|reason|rebel|rebuild|recall|receive|recipe|record|recycle|reduce|reflect|reform|refuse|region|regret|regular|reject|relax|release|relief|rely|remain|remember|remind|remove|render|renew|rent|reopen|repair|repeat|replace|report|require|rescue|resemble|resist|resource|response|result|retire|retreat|return|reunion|reveal|review|reward|rhythm|rib|ribbon|rice|rich|ride|ridge|rifle|right|rigid|ring|riot|ripple|risk|ritual|rival|river|road|roast|robot|robust|rocket|romance|roof|rookie|room|rose|rotate|rough|round|route|royal|rubber|rude|rug|rule|run|runway|rural|sad|saddle|sadness|safe|sail|salad|salmon|salon|salt|salute|same|sample|sand|satisfy|satoshi|sauce|sausage|save|say|scale|scan|scare|scatter|scene|scheme|school|science|scissors|scorpion|scout|scrap|screen|script|scrub|sea|search|season|seat|second|secret|section|security|seed|seek|segment|select|sell|seminar|senior|sense|sentence|series|service|session|settle|setup|seven|shadow|shaft|shallow|share|shed|shell|sheriff|shield|shift|shine|ship|shiver|shock|shoe|shoot|shop|short|shoulder|shove|shrimp|shrug|shuffle|shy|sibling|sick|side|siege|sight|sign|silent|silk|silly|silver|similar|simple|since|sing|siren|sister|situate|six|size|skate|sketch|ski|skill|skin|skirt|skull|slab|slam|sleep|slender|slice|slide|slight|slim|slogan|slot|slow|slush|small|smart|smile|smoke|smooth|snack|snake|snap|sniff|snow|soap|soccer|social|sock|soda|soft|solar|soldier|solid|solution|solve|someone|song|soon|sorry|sort|soul|sound|soup|source|south|space|spare|spatial|spawn|speak|special|speed|spell|spend|sphere|spice|spider|spike|spin|spirit|split|spoil|sponsor|spoon|sport|spot|spray|spread|spring|spy|square|squeeze|squirrel|stable|stadium|staff|stage|stairs|stamp|stand|start|state|stay|steak|steel|stem|step|stereo|stick|still|sting|stock|stomach|stone|stool|story|stove|strategy|street|strike|strong|struggle|student|stuff|stumble|style|subject|submit|subway|success|such|sudden|suffer|sugar|suggest|suit|summer|sun|sunny|sunset|super|supply|supreme|sure|surface|surge|surprise|surround|survey|suspect|sustain|swallow|swamp|swap|swarm|swear|sweet|swift|swim|swing|switch|sword|symbol|symptom|syrup|system|table|tackle|tag|tail|talent|talk|tank|tape|target|task|taste|tattoo|taxi|teach|team|tell|ten|tenant|tennis|tent|term|test|text|thank|that|theme|then|theory|there|they|thing|this|thought|three|thrive|throw|thumb|thunder|ticket|tide|tiger|tilt|timber|time|tiny|tip|tired|tissue|title|toast|tobacco|today|toddler|toe|together|toilet|token|tomato|tomorrow|tone|tongue|tonight|tool|tooth|top|topic|topple|torch|tornado|tortoise|toss|total|tourist|toward|tower|town|toy|track|trade|traffic|tragic|train|transfer|trap|trash|travel|tray|treat|tree|trend|trial|tribe|trick|trigger|trim|trip|trophy|trouble|truck|true|truly|trumpet|trust|truth|try|tube|tuition|tumble|tuna|tunnel|turkey|turn|turtle|twelve|twenty|twice|twin|twist|two|type|typical|ugly|umbrella|unable|unaware|uncle|uncover|under|undo|unfair|unfold|unhappy|uniform|unique|unit|universe|unknown|unlock|until|unusual|unveil|update|upgrade|uphold|upon|upper|upset|urban|urge|usage|use|used|useful|useless|usual|utility|vacant|vacuum|vague|valid|valley|valve|van|vanish|vapor|various|vast|vault|vehicle|velvet|vendor|venture|venue|verb|verify|version|very|vessel|veteran|viable|vibrant|vicious|victory|video|view|village|vintage|violin|virtual|virus|visa|visit|visual|vital|vivid|vocal|voice|void|volcano|volume|vote|voyage|wage|wagon|wait|walk|wall|walnut|want|warfare|warm|warrior|wash|wasp|waste|water|wave|way|wealth|weapon|wear|weasel|weather|web|wedding|weekend|weird|welcome|west|wet|whale|what|wheat|wheel|when|where|whip|whisper|wide|width|wife|wild|will|win|window|wine|wing|wink|winner|winter|wire|wisdom|wise|wish|witness|wolf|woman|wonder|wood|wool|word|work|world|worry|worth|wrap|wreck|wrestle|wrist|write|wrong|yard|year|yellow|you|young|youth|zebra|zero|zone|zoo'.split('|');

  const INVALID_MNEMONIC = 'Invalid mnemonic';
  const INVALID_ENTROPY = 'Invalid entropy';
  const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
  function normalize(str) {
    return (str || '').normalize('NFKD');
  }
  function binaryToByte(bin) {
    return parseInt(bin, 2);
  }
  function bytesToBinary(bytes) {
    return bytes.map(x => x.toString(2).padStart(8, '0')).join('');
  }
  function deriveChecksumBits(entropyBuffer) {
    return bytesToBinary(Array.from(sha256AsU8a(entropyBuffer))).slice(0, entropyBuffer.length * 8 / 32);
  }
  function mnemonicToSeedSync(mnemonic, password) {
    return pbkdf2Encode(util.stringToU8a(normalize(mnemonic)), util.stringToU8a(`mnemonic${normalize(password)}`)).password;
  }
  function mnemonicToEntropy$1(mnemonic) {
    var _entropyBits$match;
    const words = normalize(mnemonic).split(' ');
    util.assert(words.length % 3 === 0, INVALID_MNEMONIC);
    const bits = words.map(word => {
      const index = DEFAULT_WORDLIST.indexOf(word);
      util.assert(index !== -1, INVALID_MNEMONIC);
      return index.toString(2).padStart(11, '0');
    }).join('');
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    const entropyBytes = (_entropyBits$match = entropyBits.match(/(.{1,8})/g)) === null || _entropyBits$match === void 0 ? void 0 : _entropyBits$match.map(binaryToByte);
    util.assert(entropyBytes && entropyBytes.length % 4 === 0 && entropyBytes.length >= 16 && entropyBytes.length <= 32, INVALID_ENTROPY);
    const entropy = util.u8aToU8a(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    util.assert(newChecksum === checksumBits, INVALID_CHECKSUM);
    return entropy;
  }
  function entropyToMnemonic(entropy) {
    util.assert(entropy.length % 4 === 0 && entropy.length >= 16 && entropy.length <= 32, INVALID_ENTROPY);
    const entropyBits = bytesToBinary(Array.from(entropy));
    const checksumBits = deriveChecksumBits(entropy);
    return (entropyBits + checksumBits).match(/(.{1,11})/g).map(binary => DEFAULT_WORDLIST[binaryToByte(binary)]).join(' ');
  }
  function generateMnemonic(strength) {
    strength = strength || 128;
    util.assert(strength % 32 === 0, INVALID_ENTROPY);
    return entropyToMnemonic(randomAsU8a(strength / 8));
  }
  function validateMnemonic(mnemonic) {
    try {
      mnemonicToEntropy$1(mnemonic);
    } catch (e) {
      return false;
    }
    return true;
  }

  const STRENGTH_MAP = {
    12: 16 * 8,
    15: 20 * 8,
    18: 24 * 8,
    21: 28 * 8,
    24: 32 * 8
  };
  function mnemonicGenerate(numWords = 12, onlyJs) {
    return !util.hasBigInt || !onlyJs && isReady() ? bip39Generate(numWords) : generateMnemonic(STRENGTH_MAP[numWords]);
  }

  function mnemonicToEntropy(mnemonic, onlyJs) {
    return !util.hasBigInt || !onlyJs && isReady() ? bip39ToEntropy(mnemonic) : mnemonicToEntropy$1(mnemonic);
  }

  function mnemonicValidate(mnemonic, onlyJs) {
    return !util.hasBigInt || !onlyJs && isReady() ? bip39Validate(mnemonic) : validateMnemonic(mnemonic);
  }

  function mnemonicToLegacySeed(mnemonic, password = '', onlyJs, byteLength = 32) {
    util.assert(mnemonicValidate(mnemonic), 'Invalid bip39 mnemonic specified');
    util.assert([32, 64].includes(byteLength), () => `Invalid seed length ${byteLength}, expected 32 or 64`);
    return byteLength === 32 ? !util.hasBigInt || !onlyJs && isReady() ? bip39ToSeed(mnemonic, password) : mnemonicToSeedSync(mnemonic, password).subarray(0, 32) : mnemonicToSeedSync(mnemonic, password);
  }

  function mnemonicToMiniSecret(mnemonic, password = '', onlyJs) {
    util.assert(mnemonicValidate(mnemonic), 'Invalid bip39 mnemonic specified');
    if (!onlyJs && isReady()) {
      return bip39ToMiniSecret(mnemonic, password);
    }
    const entropy = mnemonicToEntropy(mnemonic);
    const salt = util.stringToU8a(`mnemonic${password}`);
    return pbkdf2Encode(entropy, salt).password.slice(0, 32);
  }

  const encryptionKeySize = 32;
  const macKeySize = 32;
  const derivationKeyRounds = 2048;
  const keyDerivationSaltSize = 32;
  const nonceSize = 24;
  function sr25519Encrypt(message, receiverPublicKey, senderKeyPair) {
    const messageKeyPair = senderKeyPair || generateEphemeralKeypair();
    const {
      encryptionKey,
      keyDerivationSalt,
      macKey
    } = generateEncryptionKey(messageKeyPair, receiverPublicKey);
    const {
      encrypted,
      nonce
    } = naclEncrypt(util.u8aToU8a(message), encryptionKey, randomAsU8a(nonceSize));
    const macValue = macData(nonce, encrypted, messageKeyPair.publicKey, macKey);
    return util.u8aConcat(nonce, keyDerivationSalt, messageKeyPair.publicKey, macValue, encrypted);
  }
  function generateEphemeralKeypair() {
    return sr25519PairFromSeed(mnemonicToMiniSecret(mnemonicGenerate()));
  }
  function generateEncryptionKey(senderKeyPair, receiverPublicKey) {
    const {
      encryptionKey,
      keyDerivationSalt,
      macKey
    } = buildSR25519EncryptionKey(receiverPublicKey, senderKeyPair.secretKey, senderKeyPair.publicKey);
    return {
      encryptionKey,
      keyDerivationSalt,
      macKey
    };
  }
  function buildSR25519EncryptionKey(publicKey, secretKey, encryptedMessagePairPublicKey, salt = randomAsU8a(keyDerivationSaltSize)) {
    const agreementKey = sr25519Agreement(secretKey, publicKey);
    const masterSecret = util.u8aConcat(encryptedMessagePairPublicKey, agreementKey);
    return deriveKey(masterSecret, salt);
  }
  function deriveKey(masterSecret, salt) {
    const {
      password
    } = pbkdf2Encode(masterSecret, salt, derivationKeyRounds);
    util.assert(password.byteLength >= macKeySize + encryptionKeySize, 'Wrong derived key length');
    return {
      encryptionKey: password.slice(macKeySize, macKeySize + encryptionKeySize),
      keyDerivationSalt: salt,
      macKey: password.slice(0, macKeySize)
    };
  }
  function macData(nonce, encryptedMessage, encryptedMessagePairPublicKey, macKey) {
    return hmacSha256AsU8a(macKey, util.u8aConcat(nonce, encryptedMessagePairPublicKey, encryptedMessage));
  }

  const publicKeySize = 32;
  const macValueSize = 32;
  function sr25519Decrypt(encryptedMessage, {
    secretKey
  }) {
    const {
      ephemeralPublicKey,
      keyDerivationSalt,
      macValue,
      nonce,
      sealed
    } = sr25519DecapsulateEncryptedMessage(util.u8aToU8a(encryptedMessage));
    const {
      encryptionKey,
      macKey
    } = buildSR25519EncryptionKey(ephemeralPublicKey, util.u8aToU8a(secretKey), ephemeralPublicKey, keyDerivationSalt);
    const decryptedMacValue = macData(nonce, sealed, ephemeralPublicKey, macKey);
    util.assert(util.u8aCmp(decryptedMacValue, macValue) === 0, "Mac values don't match");
    return naclDecrypt(sealed, nonce, encryptionKey);
  }
  function sr25519DecapsulateEncryptedMessage(encryptedMessage) {
    util.assert(encryptedMessage.byteLength > nonceSize + keyDerivationSaltSize + publicKeySize + macValueSize, 'Wrong encrypted message length');
    return {
      ephemeralPublicKey: encryptedMessage.slice(nonceSize + keyDerivationSaltSize, nonceSize + keyDerivationSaltSize + publicKeySize),
      keyDerivationSalt: encryptedMessage.slice(nonceSize, nonceSize + keyDerivationSaltSize),
      macValue: encryptedMessage.slice(nonceSize + keyDerivationSaltSize + publicKeySize, nonceSize + keyDerivationSaltSize + publicKeySize + macValueSize),
      nonce: encryptedMessage.slice(0, nonceSize),
      sealed: encryptedMessage.slice(nonceSize + keyDerivationSaltSize + publicKeySize + macValueSize)
    };
  }

  function encodeAddress(key, ss58Format = defaults.prefix) {
    const u8a = decodeAddress(key);
    util.assert(ss58Format >= 0 && ss58Format <= 16383 && ![46, 47].includes(ss58Format), 'Out of range ss58Format specified');
    util.assert(defaults.allowedDecodedLengths.includes(u8a.length), () => `Expected a valid key to convert, with length ${defaults.allowedDecodedLengths.join(', ')}`);
    const input = util.u8aConcat(ss58Format < 64 ? [ss58Format] : [(ss58Format & 0b0000000011111100) >> 2 | 0b01000000, ss58Format >> 8 | (ss58Format & 0b0000000000000011) << 6], u8a);
    return base58Encode(util.u8aConcat(input, sshash(input).subarray(0, [32, 33].includes(u8a.length) ? 2 : 1)));
  }

  function filterHard({
    isHard
  }) {
    return isHard;
  }
  function deriveAddress(who, suri, ss58Format) {
    const {
      path
    } = keyExtractPath(suri);
    util.assert(path.length && !path.every(filterHard), 'Expected suri to contain a combination of non-hard paths');
    let publicKey = decodeAddress(who);
    for (const {
      chainCode
    } of path) {
      publicKey = sr25519DerivePublic(publicKey, chainCode);
    }
    return encodeAddress(publicKey, ss58Format);
  }

  function encodeDerivedAddress(who, index, ss58Format) {
    return encodeAddress(createKeyDerived(decodeAddress(who), index), ss58Format);
  }

  function encodeMultiAddress(who, threshold, ss58Format) {
    return encodeAddress(createKeyMulti(who, threshold), ss58Format);
  }

  const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
  const _0n = BigInt(0);
  const _1n = BigInt(1);
  const _2n = BigInt(2);
  const _7n$1 = BigInt(7);
  const _256n$1 = BigInt(256);
  const _0x71n = BigInt(0x71);
  for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [y, (2 * x + 3 * y) % 5];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64);
      let t = _0n;
      for (let j = 0; j < 7; j++) {
          R = ((R << _1n) ^ ((R >> _7n$1) * _0x71n)) % _256n$1;
          if (R & _2n)
              t ^= _1n << ((_1n << BigInt(j)) - _1n);
      }
      _SHA3_IOTA.push(t);
  }
  const [SHA3_IOTA_H, SHA3_IOTA_L] = split(_SHA3_IOTA, true);
  const rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
  const rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
  function keccakP(s, rounds = 24) {
      const B = new Uint32Array(5 * 2);
      for (let round = 24 - rounds; round < 24; round++) {
          for (let x = 0; x < 10; x++)
              B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
          for (let x = 0; x < 10; x += 2) {
              const idx1 = (x + 8) % 10;
              const idx0 = (x + 2) % 10;
              const B0 = B[idx0];
              const B1 = B[idx0 + 1];
              const Th = rotlH(B0, B1, 1) ^ B[idx1];
              const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
              for (let y = 0; y < 50; y += 10) {
                  s[x + y] ^= Th;
                  s[x + y + 1] ^= Tl;
              }
          }
          let curH = s[2];
          let curL = s[3];
          for (let t = 0; t < 24; t++) {
              const shift = SHA3_ROTL[t];
              const Th = rotlH(curH, curL, shift);
              const Tl = rotlL(curH, curL, shift);
              const PI = SHA3_PI[t];
              curH = s[PI];
              curL = s[PI + 1];
              s[PI] = Th;
              s[PI + 1] = Tl;
          }
          for (let y = 0; y < 50; y += 10) {
              for (let x = 0; x < 10; x++)
                  B[x] = s[y + x];
              for (let x = 0; x < 10; x++)
                  s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
          }
          s[0] ^= SHA3_IOTA_H[round];
          s[1] ^= SHA3_IOTA_L[round];
      }
      B.fill(0);
  }
  class Keccak extends Hash {
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
          super();
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.rounds = rounds;
          this.pos = 0;
          this.posOut = 0;
          this.finished = false;
          this.destroyed = false;
          assertNumber(outputLen);
          if (0 >= this.blockLen || this.blockLen >= 200)
              throw new Error('Sha3 supports only keccak-f1600 function');
          this.state = new Uint8Array(200);
          this.state32 = u32(this.state);
      }
      keccak() {
          keccakP(this.state32, this.rounds);
          this.posOut = 0;
          this.pos = 0;
      }
      update(data) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          if (this.finished)
              throw new Error('digest() was already called');
          const { blockLen, state } = this;
          data = toBytes(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
              const take = Math.min(blockLen - this.pos, len - pos);
              for (let i = 0; i < take; i++)
                  state[this.pos++] ^= data[pos++];
              if (this.pos === blockLen)
                  this.keccak();
          }
          return this;
      }
      finish() {
          if (this.finished)
              return;
          this.finished = true;
          const { state, suffix, pos, blockLen } = this;
          state[pos] ^= suffix;
          if ((suffix & 0x80) !== 0 && pos === blockLen - 1)
              this.keccak();
          state[blockLen - 1] ^= 0x80;
          this.keccak();
      }
      writeInto(out) {
          if (this.destroyed)
              throw new Error('instance is destroyed');
          if (!(out instanceof Uint8Array))
              throw new Error('Keccak: invalid output buffer');
          this.finish();
          for (let pos = 0, len = out.length; pos < len;) {
              if (this.posOut >= this.blockLen)
                  this.keccak();
              const take = Math.min(this.blockLen - this.posOut, len - pos);
              out.set(this.state.subarray(this.posOut, this.posOut + take), pos);
              this.posOut += take;
              pos += take;
          }
          return out;
      }
      xofInto(out) {
          if (!this.enableXOF)
              throw new Error('XOF is not possible for this instance');
          return this.writeInto(out);
      }
      xof(bytes) {
          assertNumber(bytes);
          return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
          if (out.length < this.outputLen)
              throw new Error('Keccak: invalid output buffer');
          if (this.finished)
              throw new Error('digest() was already called');
          this.finish();
          this.writeInto(out);
          this.destroy();
          return out;
      }
      digest() {
          return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
          this.destroyed = true;
          this.state.fill(0);
      }
      _cloneInto(to) {
          const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
          to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
          to.state32.set(this.state32);
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          to.destroyed = this.destroyed;
          return to;
      }
  }
  const gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
  gen(0x06, 144, 224 / 8);
  gen(0x06, 136, 256 / 8);
  gen(0x06, 104, 384 / 8);
  gen(0x06, 72, 512 / 8);
  gen(0x01, 144, 224 / 8);
  const keccak_256 = gen(0x01, 136, 256 / 8);
  gen(0x01, 104, 384 / 8);
  const keccak_512 = gen(0x01, 72, 512 / 8);
  const genShake = (suffix, blockLen, outputLen) => wrapConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen !== undefined ? opts.dkLen : outputLen, true));
  genShake(0x1f, 168, 128 / 8);
  genShake(0x1f, 136, 256 / 8);

  const keccakAsU8a = createDualHasher({
    256: keccak256,
    512: keccak512
  }, {
    256: keccak_256,
    512: keccak_512
  });
  const keccak256AsU8a = createBitHasher(256, keccakAsU8a);
  const keccak512AsU8a = createBitHasher(512, keccakAsU8a);
  const keccakAsHex = createAsHex(keccakAsU8a);

  function hasher(hashType, data, onlyJs) {
    return hashType === 'keccak' ? keccakAsU8a(data, undefined, onlyJs) : blake2AsU8a(data, undefined, undefined, onlyJs);
  }

  function evmToAddress(evmAddress, ss58Format, hashType = 'blake2') {
    const message = util.u8aConcat('evm:', evmAddress);
    util.assert(message.length === 24, () => `Converting ${evmAddress}: Invalid evm address length`);
    return encodeAddress(hasher(hashType, message), ss58Format);
  }

  function addressEq(a, b) {
    return util.u8aEq(decodeAddress(a), decodeAddress(b));
  }

  function validateAddress(encoded, ignoreChecksum, ss58Format) {
    return !!decodeAddress(encoded, ignoreChecksum, ss58Format);
  }

  function isAddress(address, ignoreChecksum, ss58Format) {
    try {
      return validateAddress(address, ignoreChecksum, ss58Format);
    } catch (error) {
      return false;
    }
  }

  const l = util.logger('setSS58Format');
  function setSS58Format(prefix) {
    l.warn('Global setting of the ss58Format is deprecated and not recommended. Set format on the keyring (if used) or as pat of the address encode function');
    defaults.prefix = prefix;
  }

  function sortAddresses(addresses, ss58Format) {
    const u8aToAddress = u8a => encodeAddress(u8a, ss58Format);
    return util.u8aSorted(addresses.map(addressToU8a)).map(u8aToAddress);
  }

  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  const config$1 = {
    chars,
    coder: microBase.utils.chain(
    microBase.utils.radix2(5), microBase.utils.alphabet(chars), {
      decode: input => input.split(''),
      encode: input => input.join('')
    }),
    ipfs: 'b',
    type: 'base32'
  };
  const base32Validate = createValidate(config$1);
  const isBase32 = createIs(base32Validate);
  const base32Decode = createDecode(config$1, base32Validate);
  const base32Encode = createEncode(config$1);

  const config = {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    coder: microBase.base64,
    type: 'base64'
  };
  const base64Validate = createValidate(config);
  const isBase64 = createIs(base64Validate);
  const base64Decode = createDecode(config, base64Validate);
  const base64Encode = createEncode(config);

  function base64Pad(value) {
    return value.padEnd(value.length + value.length % 4, '=');
  }

  function base64Trim(value) {
    while (value.length && value[value.length - 1] === '=') {
      value = value.slice(0, -1);
    }
    return value;
  }

  function encrypt(message, recipientPublicKey, recipientKeyType, senderKeyPair) {
    util.assert(!['ecdsa', 'ethereum'].includes(recipientKeyType), 'Secp256k1 not supported yet');
    const publicKey = util.u8aToU8a(recipientPublicKey);
    return recipientKeyType === 'ed25519' ? ed25519Encrypt(message, publicKey, senderKeyPair) : sr25519Encrypt(message, publicKey, senderKeyPair);
  }

  function secp256k1Compress(publicKey, onlyJs) {
    if (publicKey.length === 33) {
      return publicKey;
    }
    util.assert(publicKey.length === 65, 'Invalid publicKey provided');
    return !util.hasBigInt || !onlyJs && isReady() ? secp256k1Compress$1(publicKey) : Point.fromHex(publicKey).toRawBytes(true);
  }

  function secp256k1Expand(publicKey, onlyJs) {
    if (publicKey.length === 65) {
      return publicKey.subarray(1);
    }
    util.assert(publicKey.length === 33, 'Invalid publicKey provided');
    if (!util.hasBigInt || !onlyJs && isReady()) {
      return secp256k1Expand$1(publicKey).subarray(1);
    }
    const {
      x,
      y
    } = Point.fromHex(publicKey);
    return util.u8aConcat(util.bnToU8a(x, BN_BE_256_OPTS), util.bnToU8a(y, BN_BE_256_OPTS));
  }

  function secp256k1Recover(msgHash, signature, recovery, hashType = 'blake2', onlyJs) {
    const sig = util.u8aToU8a(signature).subarray(0, 64);
    const msg = util.u8aToU8a(msgHash);
    const publicKey = !util.hasBigInt || !onlyJs && isReady() ? secp256k1Recover$1(msg, sig, recovery) : recoverPublicKey(msg, Signature.fromCompact(sig).toRawBytes(), recovery);
    util.assert(publicKey, 'Unable to recover publicKey from signature');
    return hashType === 'keccak' ? secp256k1Expand(publicKey, onlyJs) : secp256k1Compress(publicKey, onlyJs);
  }

  function secp256k1Sign(message, {
    secretKey
  }, hashType = 'blake2', onlyJs) {
    util.assert((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 32, 'Expected valid secp256k1 secretKey, 32-bytes');
    const data = hasher(hashType, message, onlyJs);
    if (!util.hasBigInt || !onlyJs && isReady()) {
      return secp256k1Sign$1(data, secretKey);
    }
    const [sigBytes, recoveryParam] = signSync(data, secretKey, {
      canonical: true,
      recovered: true
    });
    const {
      r,
      s
    } = Signature.fromHex(sigBytes);
    return util.u8aConcat(util.bnToU8a(r, BN_BE_256_OPTS), util.bnToU8a(s, BN_BE_256_OPTS), new Uint8Array([recoveryParam || 0]));
  }

  const N = 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141'.replace(/ /g, '');
  const N_BI = BigInt$1(`0x${N}`);
  const N_BN = new util.BN(N, 'hex');
  function addBi(seckey, tweak) {
    let res = util.u8aToBigInt(tweak, BN_BE_OPTS);
    util.assert(res < N_BI, 'Tweak parameter is out of range');
    res += util.u8aToBigInt(seckey, BN_BE_OPTS);
    if (res >= N_BI) {
      res -= N_BI;
    }
    util.assert(res !== util._0n, 'Invalid resulting private key');
    return util.nToU8a(res, BN_BE_256_OPTS);
  }
  function addBn(seckey, tweak) {
    const res = new util.BN(tweak);
    util.assert(res.cmp(N_BN) < 0, 'Tweak parameter is out of range');
    res.iadd(new util.BN(seckey));
    if (res.cmp(N_BN) >= 0) {
      res.isub(N_BN);
    }
    util.assert(!res.isZero(), 'Invalid resulting private key');
    return util.bnToU8a(res, BN_BE_256_OPTS);
  }
  function secp256k1PrivateKeyTweakAdd(seckey, tweak, onlyBn) {
    util.assert(util.isU8a(seckey) && seckey.length === 32, 'Expected seckey to be an Uint8Array with length 32');
    util.assert(util.isU8a(tweak) && tweak.length === 32, 'Expected tweak to be an Uint8Array with length 32');
    return !util.hasBigInt || onlyBn ? addBn(seckey, tweak) : addBi(seckey, tweak);
  }

  function secp256k1Verify(msgHash, signature, address, hashType = 'blake2', onlyJs) {
    const sig = util.u8aToU8a(signature);
    util.assert(sig.length === 65, `Expected signature with 65 bytes, ${sig.length} found instead`);
    const publicKey = secp256k1Recover(hasher(hashType, msgHash), sig, sig[64], hashType, onlyJs);
    const signerAddr = hasher(hashType, publicKey, onlyJs);
    const inputAddr = util.u8aToU8a(address);
    return util.u8aEq(publicKey, inputAddr) || (hashType === 'keccak' ? util.u8aEq(signerAddr.slice(-20), inputAddr.slice(-20)) : util.u8aEq(signerAddr, inputAddr));
  }

  function getH160(u8a) {
    if ([33, 65].includes(u8a.length)) {
      u8a = keccakAsU8a(secp256k1Expand(u8a));
    }
    return u8a.slice(-20);
  }
  function ethereumEncode(addressOrPublic) {
    if (!addressOrPublic) {
      return '0x';
    }
    const u8aAddress = util.u8aToU8a(addressOrPublic);
    util.assert([20, 32, 33, 65].includes(u8aAddress.length), 'Invalid address or publicKey passed');
    const address = util.u8aToHex(getH160(u8aAddress), -1, false);
    const hash = util.u8aToHex(keccakAsU8a(address), -1, false);
    let result = '';
    for (let i = 0; i < 40; i++) {
      result = `${result}${parseInt(hash[i], 16) > 7 ? address[i].toUpperCase() : address[i]}`;
    }
    return `0x${result}`;
  }

  function isInvalidChar(char, byte) {
    return char !== (byte > 7 ? char.toUpperCase() : char.toLowerCase());
  }
  function isEthereumChecksum(_address) {
    const address = _address.replace('0x', '');
    const hash = util.u8aToHex(keccakAsU8a(address.toLowerCase()), -1, false);
    for (let i = 0; i < 40; i++) {
      if (isInvalidChar(address[i], parseInt(hash[i], 16))) {
        return false;
      }
    }
    return true;
  }

  function isEthereumAddress(address) {
    if (!address || address.length !== 42 || !util.isHex(address)) {
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      return true;
    }
    return isEthereumChecksum(address);
  }

  const HARDENED = 0x80000000;
  function hdValidatePath(path) {
    if (!path.startsWith('m/')) {
      return false;
    }
    const parts = path.split('/').slice(1);
    for (const p of parts) {
      const n = /^\d+'?$/.test(p) ? parseInt(p.replace(/'$/, ''), 10) : Number.NaN;
      if (isNaN(n) || n >= HARDENED || n < 0) {
        return false;
      }
    }
    return true;
  }

  const MASTER_SECRET = util.stringToU8a('Bitcoin seed');
  function createCoded(secretKey, chainCode) {
    return {
      chainCode,
      publicKey: secp256k1PairFromSeed(secretKey).publicKey,
      secretKey
    };
  }
  function deriveChild(hd, index) {
    const indexBuffer = util.bnToU8a(index, BN_BE_32_OPTS);
    const data = index >= HARDENED ? util.u8aConcat(new Uint8Array(1), hd.secretKey, indexBuffer) : util.u8aConcat(hd.publicKey, indexBuffer);
    try {
      const I = hmacShaAsU8a(hd.chainCode, data, 512);
      return createCoded(secp256k1PrivateKeyTweakAdd(hd.secretKey, I.slice(0, 32)), I.slice(32));
    } catch (err) {
      return deriveChild(hd, index + 1);
    }
  }
  function hdEthereum(seed, path = '') {
    const I = hmacShaAsU8a(MASTER_SECRET, seed, 512);
    let hd = createCoded(I.slice(0, 32), I.slice(32));
    if (!path || path === 'm' || path === 'M' || path === "m'" || path === "M'") {
      return hd;
    }
    util.assert(hdValidatePath(path), 'Invalid derivation path');
    const parts = path.split('/').slice(1);
    for (const p of parts) {
      hd = deriveChild(hd, parseInt(p, 10) + (p.length > 1 && p.endsWith("'") ? HARDENED : 0));
    }
    return hd;
  }

  function ledgerDerivePrivate(xprv, index) {
    const kl = xprv.subarray(0, 32);
    const kr = xprv.subarray(32, 64);
    const cc = xprv.subarray(64, 96);
    const data = util.u8aConcat([0], kl, kr, util.bnToU8a(index, BN_LE_32_OPTS));
    const z = hmacShaAsU8a(cc, data, 512);
    data[0] = 0x01;
    return util.u8aConcat(util.bnToU8a(util.u8aToBn(kl, BN_LE_OPTS).iadd(util.u8aToBn(z.subarray(0, 28), BN_LE_OPTS).imul(util.BN_EIGHT)), BN_LE_512_OPTS).subarray(0, 32), util.bnToU8a(util.u8aToBn(kr, BN_LE_OPTS).iadd(util.u8aToBn(z.subarray(32, 64), BN_LE_OPTS)), BN_LE_512_OPTS).subarray(0, 32), hmacShaAsU8a(cc, data, 512).subarray(32, 64));
  }

  const ED25519_CRYPTO = 'ed25519 seed';
  function ledgerMaster(mnemonic, password) {
    const seed = mnemonicToSeedSync(mnemonic, password);
    const chainCode = hmacShaAsU8a(ED25519_CRYPTO, new Uint8Array([1, ...seed]), 256);
    let priv;
    while (!priv || priv[31] & 0b00100000) {
      priv = hmacShaAsU8a(ED25519_CRYPTO, priv || seed, 512);
    }
    priv[0] &= 0b11111000;
    priv[31] &= 0b01111111;
    priv[31] |= 0b01000000;
    return util.u8aConcat(priv, chainCode);
  }

  function hdLedger(_mnemonic, path) {
    const words = _mnemonic.split(' ').map(s => s.trim()).filter(s => s);
    util.assert([12, 24, 25].includes(words.length), 'Expected a mnemonic with 24 words (or 25 including a password)');
    const [mnemonic, password] = words.length === 25 ? [words.slice(0, 24).join(' '), words[24]] : [words.join(' '), ''];
    util.assert(mnemonicValidate(mnemonic), 'Invalid mnemonic passed to ledger derivation');
    util.assert(hdValidatePath(path), 'Invalid derivation path');
    const parts = path.split('/').slice(1);
    let seed = ledgerMaster(mnemonic, password);
    for (const p of parts) {
      const n = parseInt(p.replace(/'$/, ''), 10);
      seed = ledgerDerivePrivate(seed, n < HARDENED ? n + HARDENED : n);
    }
    return ed25519PairFromSeed(seed.slice(0, 32));
  }

  const rotl$1 = (a, b) => (a << b) | (a >>> (32 - b));
  function XorAndSalsa(prev, pi, input, ii, out, oi) {
      let y00 = prev[pi++] ^ input[ii++], y01 = prev[pi++] ^ input[ii++];
      let y02 = prev[pi++] ^ input[ii++], y03 = prev[pi++] ^ input[ii++];
      let y04 = prev[pi++] ^ input[ii++], y05 = prev[pi++] ^ input[ii++];
      let y06 = prev[pi++] ^ input[ii++], y07 = prev[pi++] ^ input[ii++];
      let y08 = prev[pi++] ^ input[ii++], y09 = prev[pi++] ^ input[ii++];
      let y10 = prev[pi++] ^ input[ii++], y11 = prev[pi++] ^ input[ii++];
      let y12 = prev[pi++] ^ input[ii++], y13 = prev[pi++] ^ input[ii++];
      let y14 = prev[pi++] ^ input[ii++], y15 = prev[pi++] ^ input[ii++];
      let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
      for (let i = 0; i < 8; i += 2) {
          x04 ^= rotl$1(x00 + x12 | 0, 7);
          x08 ^= rotl$1(x04 + x00 | 0, 9);
          x12 ^= rotl$1(x08 + x04 | 0, 13);
          x00 ^= rotl$1(x12 + x08 | 0, 18);
          x09 ^= rotl$1(x05 + x01 | 0, 7);
          x13 ^= rotl$1(x09 + x05 | 0, 9);
          x01 ^= rotl$1(x13 + x09 | 0, 13);
          x05 ^= rotl$1(x01 + x13 | 0, 18);
          x14 ^= rotl$1(x10 + x06 | 0, 7);
          x02 ^= rotl$1(x14 + x10 | 0, 9);
          x06 ^= rotl$1(x02 + x14 | 0, 13);
          x10 ^= rotl$1(x06 + x02 | 0, 18);
          x03 ^= rotl$1(x15 + x11 | 0, 7);
          x07 ^= rotl$1(x03 + x15 | 0, 9);
          x11 ^= rotl$1(x07 + x03 | 0, 13);
          x15 ^= rotl$1(x11 + x07 | 0, 18);
          x01 ^= rotl$1(x00 + x03 | 0, 7);
          x02 ^= rotl$1(x01 + x00 | 0, 9);
          x03 ^= rotl$1(x02 + x01 | 0, 13);
          x00 ^= rotl$1(x03 + x02 | 0, 18);
          x06 ^= rotl$1(x05 + x04 | 0, 7);
          x07 ^= rotl$1(x06 + x05 | 0, 9);
          x04 ^= rotl$1(x07 + x06 | 0, 13);
          x05 ^= rotl$1(x04 + x07 | 0, 18);
          x11 ^= rotl$1(x10 + x09 | 0, 7);
          x08 ^= rotl$1(x11 + x10 | 0, 9);
          x09 ^= rotl$1(x08 + x11 | 0, 13);
          x10 ^= rotl$1(x09 + x08 | 0, 18);
          x12 ^= rotl$1(x15 + x14 | 0, 7);
          x13 ^= rotl$1(x12 + x15 | 0, 9);
          x14 ^= rotl$1(x13 + x12 | 0, 13);
          x15 ^= rotl$1(x14 + x13 | 0, 18);
      }
      out[oi++] = (y00 + x00) | 0;
      out[oi++] = (y01 + x01) | 0;
      out[oi++] = (y02 + x02) | 0;
      out[oi++] = (y03 + x03) | 0;
      out[oi++] = (y04 + x04) | 0;
      out[oi++] = (y05 + x05) | 0;
      out[oi++] = (y06 + x06) | 0;
      out[oi++] = (y07 + x07) | 0;
      out[oi++] = (y08 + x08) | 0;
      out[oi++] = (y09 + x09) | 0;
      out[oi++] = (y10 + x10) | 0;
      out[oi++] = (y11 + x11) | 0;
      out[oi++] = (y12 + x12) | 0;
      out[oi++] = (y13 + x13) | 0;
      out[oi++] = (y14 + x14) | 0;
      out[oi++] = (y15 + x15) | 0;
  }
  function BlockMix(input, ii, out, oi, r) {
      let head = oi + 0;
      let tail = oi + 16 * r;
      for (let i = 0; i < 16; i++)
          out[tail + i] = input[ii + (2 * r - 1) * 16 + i];
      for (let i = 0; i < r; i++, head += 16, ii += 16) {
          XorAndSalsa(out, tail, input, ii, out, head);
          if (i > 0)
              tail += 16;
          XorAndSalsa(out, head, input, (ii += 16), out, tail);
      }
  }
  function scryptInit(password, salt, _opts) {
      const opts = checkOpts({
          dkLen: 32,
          asyncTick: 10,
          maxmem: 1024 ** 3 + 1024,
      }, _opts);
      const { N, r, p, dkLen, asyncTick, maxmem, onProgress } = opts;
      assertNumber(N);
      assertNumber(r);
      assertNumber(p);
      assertNumber(dkLen);
      assertNumber(asyncTick);
      assertNumber(maxmem);
      if (onProgress !== undefined && typeof onProgress !== 'function')
          throw new Error('progressCb should be function');
      const blockSize = 128 * r;
      const blockSize32 = blockSize / 4;
      if (N <= 1 || (N & (N - 1)) !== 0 || N >= 2 ** (blockSize / 8) || N > 2 ** 32) {
          throw new Error('Scrypt: N must be larger than 1, a power of 2, less than 2^(128 * r / 8) and less than 2^32');
      }
      if (p < 0 || p > ((2 ** 32 - 1) * 32) / blockSize) {
          throw new Error('Scrypt: p must be a positive integer less than or equal to ((2^32 - 1) * 32) / (128 * r)');
      }
      if (dkLen < 0 || dkLen > (2 ** 32 - 1) * 32) {
          throw new Error('Scrypt: dkLen should be positive integer less than or equal to (2^32 - 1) * 32');
      }
      const memUsed = blockSize * (N + p);
      if (memUsed > maxmem) {
          throw new Error(`Scrypt: parameters too large, ${memUsed} (128 * r * (N + p)) > ${maxmem} (maxmem)`);
      }
      const B = pbkdf2(sha256, password, salt, { c: 1, dkLen: blockSize * p });
      const B32 = u32(B);
      const V = u32(new Uint8Array(blockSize * N));
      const tmp = u32(new Uint8Array(blockSize));
      let blockMixCb = () => { };
      if (onProgress) {
          const totalBlockMix = 2 * N * p;
          const callbackPer = Math.max(Math.floor(totalBlockMix / 10000), 1);
          let blockMixCnt = 0;
          blockMixCb = () => {
              blockMixCnt++;
              if (onProgress && (!(blockMixCnt % callbackPer) || blockMixCnt === totalBlockMix))
                  onProgress(blockMixCnt / totalBlockMix);
          };
      }
      return { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb, asyncTick };
  }
  function scryptOutput(password, dkLen, B, V, tmp) {
      const res = pbkdf2(sha256, password, B, { c: 1, dkLen });
      B.fill(0);
      V.fill(0);
      tmp.fill(0);
      return res;
  }
  function scrypt(password, salt, _opts) {
      const { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb } = scryptInit(password, salt, _opts);
      for (let pi = 0; pi < p; pi++) {
          const Pi = blockSize32 * pi;
          for (let i = 0; i < blockSize32; i++)
              V[i] = B32[Pi + i];
          for (let i = 0, pos = 0; i < N - 1; i++) {
              BlockMix(V, pos, V, (pos += blockSize32), r);
              blockMixCb();
          }
          BlockMix(V, (N - 1) * blockSize32, B32, Pi, r);
          blockMixCb();
          for (let i = 0; i < N; i++) {
              const j = B32[Pi + blockSize32 - 16] % N;
              for (let k = 0; k < blockSize32; k++)
                  tmp[k] = B32[Pi + k] ^ V[j * blockSize32 + k];
              BlockMix(tmp, 0, B32, Pi, r);
              blockMixCb();
          }
      }
      return scryptOutput(password, dkLen, B, V, tmp);
  }

  const DEFAULT_PARAMS = {
    N: 1 << 15,
    p: 1,
    r: 8
  };

  function scryptEncode(passphrase, salt = randomAsU8a(), params = DEFAULT_PARAMS, onlyJs) {
    const u8a = util.u8aToU8a(passphrase);
    return {
      params,
      password: !util.hasBigInt || !onlyJs && isReady() ? scrypt$1(u8a, salt, Math.log2(params.N), params.r, params.p) : scrypt(u8a, salt, util.objectSpread({
        dkLen: 64
      }, params)),
      salt
    };
  }

  function scryptFromU8a(data) {
    const salt = data.subarray(0, 32);
    const N = util.u8aToBn(data.subarray(32 + 0, 32 + 4), BN_LE_OPTS).toNumber();
    const p = util.u8aToBn(data.subarray(32 + 4, 32 + 8), BN_LE_OPTS).toNumber();
    const r = util.u8aToBn(data.subarray(32 + 8, 32 + 12), BN_LE_OPTS).toNumber();
    util.assert(N === DEFAULT_PARAMS.N && p === DEFAULT_PARAMS.p && r === DEFAULT_PARAMS.r, 'Invalid injected scrypt params found');
    return {
      params: {
        N,
        p,
        r
      },
      salt
    };
  }

  function scryptToU8a(salt, {
    N,
    p,
    r
  }) {
    return util.u8aConcat(salt, util.bnToU8a(N, BN_LE_32_OPTS), util.bnToU8a(p, BN_LE_32_OPTS), util.bnToU8a(r, BN_LE_32_OPTS));
  }

  const ENCODING = ['scrypt', 'xsalsa20-poly1305'];
  const ENCODING_NONE = ['none'];
  const ENCODING_VERSION = '3';
  const NONCE_LENGTH = 24;
  const SCRYPT_LENGTH = 32 + 3 * 4;

  function jsonDecryptData(encrypted, passphrase, encType = ENCODING) {
    util.assert(encrypted, 'No encrypted data available to decode');
    util.assert(passphrase || !encType.includes('xsalsa20-poly1305'), 'Password required to decode encrypted data');
    let encoded = encrypted;
    if (passphrase) {
      let password;
      if (encType.includes('scrypt')) {
        const {
          params,
          salt
        } = scryptFromU8a(encrypted);
        password = scryptEncode(passphrase, salt, params).password;
        encrypted = encrypted.subarray(SCRYPT_LENGTH);
      } else {
        password = util.stringToU8a(passphrase);
      }
      encoded = naclDecrypt(encrypted.subarray(NONCE_LENGTH), encrypted.subarray(0, NONCE_LENGTH), util.u8aFixLength(password, 256, true));
    }
    util.assert(encoded, 'Unable to decode using the supplied passphrase');
    return encoded;
  }

  function jsonDecrypt({
    encoded,
    encoding
  }, passphrase) {
    util.assert(encoded, 'No encrypted data available to decode');
    return jsonDecryptData(util.isHex(encoded) ? util.hexToU8a(encoded) : base64Decode(encoded), passphrase, Array.isArray(encoding.type) ? encoding.type : [encoding.type]);
  }

  function jsonEncryptFormat(encoded, contentType, isEncrypted) {
    return {
      encoded: base64Encode(encoded),
      encoding: {
        content: contentType,
        type: isEncrypted ? ENCODING : ENCODING_NONE,
        version: ENCODING_VERSION
      }
    };
  }

  function jsonEncrypt(data, contentType, passphrase) {
    let isEncrypted = false;
    let encoded = data;
    if (passphrase) {
      const {
        params,
        password,
        salt
      } = scryptEncode(passphrase);
      const {
        encrypted,
        nonce
      } = naclEncrypt(encoded, password.subarray(0, 32));
      isEncrypted = true;
      encoded = util.u8aConcat(scryptToU8a(salt, params), nonce, encrypted);
    }
    return jsonEncryptFormat(encoded, contentType, isEncrypted);
  }

  const secp256k1VerifyHasher = hashType => (message, signature, publicKey) => secp256k1Verify(message, signature, publicKey, hashType);
  const VERIFIERS_ECDSA = [['ecdsa', secp256k1VerifyHasher('blake2')], ['ethereum', secp256k1VerifyHasher('keccak')]];
  const VERIFIERS = [['ed25519', ed25519Verify], ['sr25519', sr25519Verify], ...VERIFIERS_ECDSA];
  const CRYPTO_TYPES = ['ed25519', 'sr25519', 'ecdsa'];
  function verifyDetect(result, {
    message,
    publicKey,
    signature
  }, verifiers = VERIFIERS) {
    result.isValid = verifiers.some(([crypto, verify]) => {
      try {
        if (verify(message, signature, publicKey)) {
          result.crypto = crypto;
          return true;
        }
      } catch (error) {
      }
      return false;
    });
    return result;
  }
  function verifyMultisig(result, {
    message,
    publicKey,
    signature
  }) {
    util.assert([0, 1, 2].includes(signature[0]), () => `Unknown crypto type, expected signature prefix [0..2], found ${signature[0]}`);
    const type = CRYPTO_TYPES[signature[0]] || 'none';
    result.crypto = type;
    try {
      result.isValid = {
        ecdsa: () => verifyDetect(result, {
          message,
          publicKey,
          signature: signature.subarray(1)
        }, VERIFIERS_ECDSA).isValid,
        ed25519: () => ed25519Verify(message, signature.subarray(1), publicKey),
        none: () => {
          throw Error('no verify for `none` crypto type');
        },
        sr25519: () => sr25519Verify(message, signature.subarray(1), publicKey)
      }[type]();
    } catch (error) {
    }
    return result;
  }
  function getVerifyFn(signature) {
    return [0, 1, 2].includes(signature[0]) && [65, 66].includes(signature.length) ? verifyMultisig : verifyDetect;
  }
  function signatureVerify(message, signature, addressOrPublicKey) {
    const signatureU8a = util.u8aToU8a(signature);
    util.assert([64, 65, 66].includes(signatureU8a.length), () => `Invalid signature length, expected [64..66] bytes, found ${signatureU8a.length}`);
    const publicKey = decodeAddress(addressOrPublicKey);
    const input = {
      message: util.u8aToU8a(message),
      publicKey,
      signature: signatureU8a
    };
    const result = {
      crypto: 'none',
      isValid: false,
      isWrapped: util.u8aIsWrapped(input.message, true),
      publicKey
    };
    const isWrappedBytes = util.u8aIsWrapped(input.message, false);
    const verifyFn = getVerifyFn(signatureU8a);
    verifyFn(result, input);
    if (result.crypto !== 'none' || result.isWrapped && !isWrappedBytes) {
      return result;
    }
    input.message = isWrappedBytes ? util.u8aUnwrapBytes(input.message) : util.u8aWrapBytes(input.message);
    return verifyFn(result, input);
  }

  const P64_1 = BigInt$1('11400714785074694791');
  const P64_2 = BigInt$1('14029467366897019727');
  const P64_3 = BigInt$1('1609587929392839161');
  const P64_4 = BigInt$1('9650029242287828579');
  const P64_5 = BigInt$1('2870177450012600261');
  const U64 = BigInt$1('0xffffffffffffffff');
  const _7n = BigInt$1(7);
  const _11n = BigInt$1(11);
  const _12n = BigInt$1(12);
  const _16n = BigInt$1(16);
  const _18n = BigInt$1(18);
  const _23n = BigInt$1(23);
  const _27n = BigInt$1(27);
  const _29n = BigInt$1(29);
  const _31n = BigInt$1(31);
  const _32n = BigInt$1(32);
  const _33n = BigInt$1(33);
  const _64n = BigInt$1(64);
  const _256n = BigInt$1(256);
  function rotl(a, b) {
    const c = a & U64;
    return (c << b | c >> _64n - b) & U64;
  }
  function fromU8a(u8a, p, count) {
    const bigints = new Array(count);
    let offset = 0;
    for (let i = 0; i < count; i++, offset += 2) {
      bigints[i] = BigInt$1(u8a[p + offset] | u8a[p + 1 + offset] << 8);
    }
    let result = util._0n;
    for (let i = count - 1; i >= 0; i--) {
      result = (result << _16n) + bigints[i];
    }
    return result;
  }
  function toU8a(h64) {
    const result = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      result[i] = Number(h64 % _256n);
      h64 = h64 / _256n;
    }
    return result;
  }
  function state(initSeed) {
    const seed = BigInt$1(initSeed);
    return {
      seed,
      u8a: new Uint8Array(32),
      u8asize: 0,
      v1: seed + P64_1 + P64_2,
      v2: seed + P64_2,
      v3: seed,
      v4: seed - P64_1
    };
  }
  function init(state, input) {
    if (input.length < 32) {
      state.u8a.set(input);
      state.u8asize = input.length;
      return state;
    }
    const limit = input.length - 32;
    let p = 0;
    if (limit >= 0) {
      const adjustV = v => P64_1 * rotl(v + P64_2 * fromU8a(input, p, 4), _31n);
      do {
        state.v1 = adjustV(state.v1);
        p += 8;
        state.v2 = adjustV(state.v2);
        p += 8;
        state.v3 = adjustV(state.v3);
        p += 8;
        state.v4 = adjustV(state.v4);
        p += 8;
      } while (p <= limit);
    }
    if (p < input.length) {
      state.u8a.set(input.subarray(p, input.length));
      state.u8asize = input.length - p;
    }
    return state;
  }
  function xxhash64(input, initSeed) {
    const {
      seed,
      u8a,
      u8asize,
      v1,
      v2,
      v3,
      v4
    } = init(state(initSeed), input);
    let p = 0;
    let h64 = U64 & BigInt$1(input.length) + (input.length >= 32 ? ((((rotl(v1, util._1n) + rotl(v2, _7n) + rotl(v3, _12n) + rotl(v4, _18n) ^ P64_1 * rotl(v1 * P64_2, _31n)) * P64_1 + P64_4 ^ P64_1 * rotl(v2 * P64_2, _31n)) * P64_1 + P64_4 ^ P64_1 * rotl(v3 * P64_2, _31n)) * P64_1 + P64_4 ^ P64_1 * rotl(v4 * P64_2, _31n)) * P64_1 + P64_4 : seed + P64_5);
    while (p <= u8asize - 8) {
      h64 = U64 & P64_4 + P64_1 * rotl(h64 ^ P64_1 * rotl(P64_2 * fromU8a(u8a, p, 4), _31n), _27n);
      p += 8;
    }
    if (p + 4 <= u8asize) {
      h64 = U64 & P64_3 + P64_2 * rotl(h64 ^ P64_1 * fromU8a(u8a, p, 2), _23n);
      p += 4;
    }
    while (p < u8asize) {
      h64 = U64 & P64_1 * rotl(h64 ^ P64_5 * BigInt$1(u8a[p++]), _11n);
    }
    h64 = U64 & P64_2 * (h64 ^ h64 >> _33n);
    h64 = U64 & P64_3 * (h64 ^ h64 >> _29n);
    return toU8a(U64 & (h64 ^ h64 >> _32n));
  }

  function xxhashAsU8a(data, bitLength = 64, onlyJs) {
    const rounds = Math.ceil(bitLength / 64);
    const u8a = util.u8aToU8a(data);
    if (!util.hasBigInt || !onlyJs && isReady()) {
      return twox(u8a, rounds);
    }
    const result = new Uint8Array(rounds * 8);
    for (let seed = 0; seed < rounds; seed++) {
      result.set(xxhash64(u8a, seed).reverse(), seed * 8);
    }
    return result;
  }
  const xxhashAsHex = createAsHex(xxhashAsU8a);

  exports.addressEq = addressEq;
  exports.addressToEvm = addressToEvm;
  exports.allNetworks = allNetworks;
  exports.availableNetworks = availableNetworks;
  exports.base32Decode = base32Decode;
  exports.base32Encode = base32Encode;
  exports.base32Validate = base32Validate;
  exports.base58Decode = base58Decode;
  exports.base58Encode = base58Encode;
  exports.base58Validate = base58Validate;
  exports.base64Decode = base64Decode;
  exports.base64Encode = base64Encode;
  exports.base64Pad = base64Pad;
  exports.base64Trim = base64Trim;
  exports.base64Validate = base64Validate;
  exports.blake2AsHex = blake2AsHex;
  exports.blake2AsU8a = blake2AsU8a;
  exports.checkAddress = checkAddress;
  exports.checkAddressChecksum = checkAddressChecksum;
  exports.convertPublicKeyToCurve25519 = convertPublicKeyToCurve25519;
  exports.convertSecretKeyToCurve25519 = convertSecretKeyToCurve25519;
  exports.createKeyDerived = createKeyDerived;
  exports.createKeyMulti = createKeyMulti;
  exports.cryptoIsReady = cryptoIsReady;
  exports.cryptoWaitReady = cryptoWaitReady;
  exports.decodeAddress = decodeAddress;
  exports.deriveAddress = deriveAddress;
  exports.ed25519Decrypt = ed25519Decrypt;
  exports.ed25519DeriveHard = ed25519DeriveHard;
  exports.ed25519Encrypt = ed25519Encrypt;
  exports.ed25519PairFromRandom = ed25519PairFromRandom;
  exports.ed25519PairFromSecret = ed25519PairFromSecret;
  exports.ed25519PairFromSeed = ed25519PairFromSeed;
  exports.ed25519PairFromString = ed25519PairFromString;
  exports.ed25519Sign = ed25519Sign;
  exports.ed25519Verify = ed25519Verify;
  exports.encodeAddress = encodeAddress;
  exports.encodeDerivedAddress = encodeDerivedAddress;
  exports.encodeMultiAddress = encodeMultiAddress;
  exports.encrypt = encrypt;
  exports.ethereumEncode = ethereumEncode;
  exports.evmToAddress = evmToAddress;
  exports.hdEthereum = hdEthereum;
  exports.hdLedger = hdLedger;
  exports.hdValidatePath = hdValidatePath;
  exports.hmacSha256AsU8a = hmacSha256AsU8a;
  exports.hmacSha512AsU8a = hmacSha512AsU8a;
  exports.hmacShaAsU8a = hmacShaAsU8a;
  exports.isAddress = isAddress;
  exports.isBase32 = isBase32;
  exports.isBase58 = isBase58;
  exports.isBase64 = isBase64;
  exports.isEthereumAddress = isEthereumAddress;
  exports.isEthereumChecksum = isEthereumChecksum;
  exports.jsonDecrypt = jsonDecrypt;
  exports.jsonDecryptData = jsonDecryptData;
  exports.jsonEncrypt = jsonEncrypt;
  exports.jsonEncryptFormat = jsonEncryptFormat;
  exports.keccak256AsU8a = keccak256AsU8a;
  exports.keccak512AsU8a = keccak512AsU8a;
  exports.keccakAsHex = keccakAsHex;
  exports.keccakAsU8a = keccakAsU8a;
  exports.keyExtractPath = keyExtractPath;
  exports.keyExtractSuri = keyExtractSuri;
  exports.keyFromPath = keyFromPath;
  exports.keyHdkdEcdsa = keyHdkdEcdsa;
  exports.keyHdkdEd25519 = keyHdkdEd25519;
  exports.keyHdkdSr25519 = keyHdkdSr25519;
  exports.mnemonicGenerate = mnemonicGenerate;
  exports.mnemonicToEntropy = mnemonicToEntropy;
  exports.mnemonicToLegacySeed = mnemonicToLegacySeed;
  exports.mnemonicToMiniSecret = mnemonicToMiniSecret;
  exports.mnemonicValidate = mnemonicValidate;
  exports.naclBoxPairFromSecret = naclBoxPairFromSecret;
  exports.naclDecrypt = naclDecrypt;
  exports.naclEncrypt = naclEncrypt;
  exports.naclOpen = naclOpen;
  exports.naclSeal = naclSeal;
  exports.packageInfo = packageInfo;
  exports.pbkdf2Encode = pbkdf2Encode;
  exports.randomAsHex = randomAsHex;
  exports.randomAsNumber = randomAsNumber;
  exports.randomAsU8a = randomAsU8a;
  exports.scryptEncode = scryptEncode;
  exports.scryptFromU8a = scryptFromU8a;
  exports.scryptToU8a = scryptToU8a;
  exports.secp256k1Compress = secp256k1Compress;
  exports.secp256k1Expand = secp256k1Expand;
  exports.secp256k1PairFromSeed = secp256k1PairFromSeed;
  exports.secp256k1PrivateKeyTweakAdd = secp256k1PrivateKeyTweakAdd;
  exports.secp256k1Recover = secp256k1Recover;
  exports.secp256k1Sign = secp256k1Sign;
  exports.secp256k1Verify = secp256k1Verify;
  exports.selectableNetworks = selectableNetworks;
  exports.setSS58Format = setSS58Format;
  exports.sha256AsU8a = sha256AsU8a;
  exports.sha512AsU8a = sha512AsU8a;
  exports.shaAsU8a = shaAsU8a;
  exports.signatureVerify = signatureVerify;
  exports.sortAddresses = sortAddresses;
  exports.sr25519Agreement = sr25519Agreement;
  exports.sr25519Decrypt = sr25519Decrypt;
  exports.sr25519DeriveHard = sr25519DeriveHard;
  exports.sr25519DerivePublic = sr25519DerivePublic;
  exports.sr25519DeriveSoft = sr25519DeriveSoft;
  exports.sr25519Encrypt = sr25519Encrypt;
  exports.sr25519PairFromSeed = sr25519PairFromSeed;
  exports.sr25519Sign = sr25519Sign;
  exports.sr25519Verify = sr25519Verify;
  exports.sr25519VrfSign = sr25519VrfSign;
  exports.sr25519VrfVerify = sr25519VrfVerify;
  exports.validateAddress = validateAddress;
  exports.xxhashAsHex = xxhashAsHex;
  exports.xxhashAsU8a = xxhashAsU8a;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, polkadotUtil);
