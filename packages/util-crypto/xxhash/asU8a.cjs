"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xxhashAsHex = void 0;
exports.xxhashAsU8a = xxhashAsU8a;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _helpers = require("../helpers.cjs");

var _xxhash = require("./xxhash64.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name xxhashAsU8a
 * @summary Creates a xxhash64 u8a from the input.
 * @description
 * From either a `string`, `Uint8Array` or a `Buffer` input, create the xxhash64 and return the result as a `Uint8Array` with the specified `bitLength`.
 * @example
 * <BR>
 *
 * ```javascript
 * import { xxhashAsU8a } from '@polkadot/util-crypto';
 *
 * xxhashAsU8a('abc'); // => 0x44bc2cf5ad770999
 * ```
 */
function xxhashAsU8a(data) {
  let bitLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64;
  let onlyJs = arguments.length > 2 ? arguments[2] : undefined;
  const rounds = Math.ceil(bitLength / 64);
  const u8a = (0, _util.u8aToU8a)(data);

  if (!_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)()) {
    return (0, _wasmCrypto.twox)(u8a, rounds);
  }

  const result = new Uint8Array(rounds * 8);

  for (let seed = 0; seed < rounds; seed++) {
    result.set((0, _xxhash.xxhash64)(u8a, seed).reverse(), seed * 8);
  }

  return result;
}
/**
 * @name xxhashAsHex
 * @description Creates a xxhash64 hex from the input.
 */


const xxhashAsHex = (0, _helpers.createAsHex)(xxhashAsU8a);
exports.xxhashAsHex = xxhashAsHex;