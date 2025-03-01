"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blake2AsHex = void 0;
exports.blake2AsU8a = blake2AsU8a;

var _blake2b = require("@noble/hashes/lib/blake2b");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _helpers = require("../helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name blake2AsU8a
 * @summary Creates a blake2b u8a from the input.
 * @description
 * From a `Uint8Array` input, create the blake2b and return the result as a u8a with the specified `bitLength`.
 * @example
 * <BR>
 *
 * ```javascript
 * import { blake2AsU8a } from '@polkadot/util-crypto';
 *
 * blake2AsU8a('abc'); // => [0xba, 0x80, 0xa5, 0x3f, 0x98, 0x1c, 0x4d, 0x0d]
 * ```
 */
function blake2AsU8a(data) {
  let bitLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;
  let key = arguments.length > 2 ? arguments[2] : undefined;
  let onlyJs = arguments.length > 3 ? arguments[3] : undefined;
  const byteLength = Math.ceil(bitLength / 8);
  const u8a = (0, _util.u8aToU8a)(data);
  return !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.blake2b)(u8a, (0, _util.u8aToU8a)(key), byteLength) : (0, _blake2b.blake2b)(u8a, {
    dkLen: byteLength,
    key: key || undefined
  });
}
/**
 * @name blake2AsHex
 * @description Creates a blake2b hex from the input.
 */


const blake2AsHex = (0, _helpers.createAsHex)(blake2AsU8a);
exports.blake2AsHex = blake2AsHex;