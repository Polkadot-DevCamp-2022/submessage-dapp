"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1Compress = secp256k1Compress;

var _secp256k = require("@noble/secp256k1");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function secp256k1Compress(publicKey, onlyJs) {
  if (publicKey.length === 33) {
    return publicKey;
  }

  (0, _util.assert)(publicKey.length === 65, 'Invalid publicKey provided');
  return !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.secp256k1Compress)(publicKey) : _secp256k.Point.fromHex(publicKey).toRawBytes(true);
}