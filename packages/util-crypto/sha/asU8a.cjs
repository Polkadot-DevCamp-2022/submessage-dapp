"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shaAsU8a = exports.sha512AsU8a = exports.sha256AsU8a = void 0;

var _sha = require("@noble/hashes/lib/sha256");

var _sha2 = require("@noble/hashes/lib/sha512");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _helpers = require("../helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name shaAsU8a
 * @summary Creates a sha Uint8Array from the input.
 */
const shaAsU8a = (0, _helpers.createDualHasher)({
  256: _wasmCrypto.sha256,
  512: _wasmCrypto.sha512
}, {
  256: _sha.sha256,
  512: _sha2.sha512
});
/**
 * @name sha256AsU8a
 * @summary Creates a sha256 Uint8Array from the input.
 */

exports.shaAsU8a = shaAsU8a;
const sha256AsU8a = (0, _helpers.createBitHasher)(256, shaAsU8a);
/**
 * @name sha512AsU8a
 * @summary Creates a sha512 Uint8Array from the input.
 */

exports.sha256AsU8a = sha256AsU8a;
const sha512AsU8a = (0, _helpers.createBitHasher)(512, shaAsU8a);
exports.sha512AsU8a = sha512AsU8a;