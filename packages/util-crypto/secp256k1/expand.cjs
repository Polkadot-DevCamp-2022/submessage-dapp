"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1Expand = secp256k1Expand;

var _secp256k = require("@noble/secp256k1");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _bn = require("../bn.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function secp256k1Expand(publicKey, onlyJs) {
  if (publicKey.length === 65) {
    return publicKey.subarray(1);
  }

  (0, _util.assert)(publicKey.length === 33, 'Invalid publicKey provided');

  if (!_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)()) {
    return (0, _wasmCrypto.secp256k1Expand)(publicKey).subarray(1);
  }

  const {
    x,
    y
  } = _secp256k.Point.fromHex(publicKey);

  return (0, _util.u8aConcat)((0, _util.bnToU8a)(x, _bn.BN_BE_256_OPTS), (0, _util.bnToU8a)(y, _bn.BN_BE_256_OPTS));
}