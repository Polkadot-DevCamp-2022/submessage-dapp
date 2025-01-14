"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1Recover = secp256k1Recover;

var _secp256k = require("@noble/secp256k1");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _compress = require("./compress.cjs");

var _expand = require("./expand.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name secp256k1Recover
 * @description Recovers a publicKey from the supplied signature
 */
function secp256k1Recover(msgHash, signature, recovery) {
  let hashType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'blake2';
  let onlyJs = arguments.length > 4 ? arguments[4] : undefined;
  const sig = (0, _util.u8aToU8a)(signature).subarray(0, 64);
  const msg = (0, _util.u8aToU8a)(msgHash);
  const publicKey = !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.secp256k1Recover)(msg, sig, recovery) : (0, _secp256k.recoverPublicKey)(msg, _secp256k.Signature.fromCompact(sig).toRawBytes(), recovery);
  (0, _util.assert)(publicKey, 'Unable to recover publicKey from signature');
  return hashType === 'keccak' ? (0, _expand.secp256k1Expand)(publicKey, onlyJs) : (0, _compress.secp256k1Compress)(publicKey, onlyJs);
}