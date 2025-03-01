"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keccakAsU8a = exports.keccakAsHex = exports.keccak512AsU8a = exports.keccak256AsU8a = void 0;

var _sha = require("@noble/hashes/lib/sha3");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _helpers = require("../helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name keccakAsU8a
 * @summary Creates a keccak Uint8Array from the input.
 * @description
 * From either a `string` or a `Buffer` input, create the keccak and return the result as a `Uint8Array`.
 * @example
 * <BR>
 *
 * ```javascript
 * import { keccakAsU8a } from '@polkadot/util-crypto';
 *
 * keccakAsU8a('123'); // => Uint8Array
 * ```
 */
const keccakAsU8a = (0, _helpers.createDualHasher)({
  256: _wasmCrypto.keccak256,
  512: _wasmCrypto.keccak512
}, {
  256: _sha.keccak_256,
  512: _sha.keccak_512
});
/**
 * @name keccak256AsU8a
 * @description Creates a keccak256 Uint8Array from the input.
 */

exports.keccakAsU8a = keccakAsU8a;
const keccak256AsU8a = (0, _helpers.createBitHasher)(256, keccakAsU8a);
/**
 * @name keccak512AsU8a
 * @description Creates a keccak512 Uint8Array from the input.
 */

exports.keccak256AsU8a = keccak256AsU8a;
const keccak512AsU8a = (0, _helpers.createBitHasher)(512, keccakAsU8a);
/**
 * @name keccakAsHex
 * @description Creates a keccak hex string from the input.
 */

exports.keccak512AsU8a = keccak512AsU8a;
const keccakAsHex = (0, _helpers.createAsHex)(keccakAsU8a);
exports.keccakAsHex = keccakAsHex;