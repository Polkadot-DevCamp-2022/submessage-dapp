"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519PairFromSeed = sr25519PairFromSeed;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _fromU8a = require("./fromU8a.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name sr25519PairFromSeed
 * @description Returns a object containing a `publicKey` & `secretKey` generated from the supplied seed.
 */
function sr25519PairFromSeed(seed) {
  const seedU8a = (0, _util.u8aToU8a)(seed);
  (0, _util.assert)(seedU8a.length === 32, () => `Expected a seed matching 32 bytes, found ${seedU8a.length}`);
  return (0, _fromU8a.sr25519PairFromU8a)((0, _wasmCrypto.sr25519KeypairFromSeed)(seedU8a));
}