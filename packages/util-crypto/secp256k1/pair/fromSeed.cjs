"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1PairFromSeed = secp256k1PairFromSeed;

var _secp256k = require("@noble/secp256k1");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name secp256k1PairFromSeed
 * @description Returns a object containing a `publicKey` & `secretKey` generated from the supplied seed.
 */
function secp256k1PairFromSeed(seed, onlyJs) {
  (0, _util.assert)(seed.length === 32, 'Expected valid 32-byte private key as a seed');

  if (!_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)()) {
    const full = (0, _wasmCrypto.secp256k1FromSeed)(seed);
    return {
      publicKey: full.slice(32),
      secretKey: full.slice(0, 32)
    };
  }

  return {
    publicKey: (0, _secp256k.getPublicKey)(seed, true),
    secretKey: seed
  };
}