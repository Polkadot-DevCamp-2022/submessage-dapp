"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1Verify = secp256k1Verify;

var _util = require("@polkadot/util");

var _hasher = require("./hasher.cjs");

var _recover = require("./recover.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name secp256k1Verify
 * @description Verifies the signature of `message`, using the supplied pair
 */
function secp256k1Verify(msgHash, signature, address) {
  let hashType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'blake2';
  let onlyJs = arguments.length > 4 ? arguments[4] : undefined;
  const sig = (0, _util.u8aToU8a)(signature);
  (0, _util.assert)(sig.length === 65, `Expected signature with 65 bytes, ${sig.length} found instead`);
  const publicKey = (0, _recover.secp256k1Recover)((0, _hasher.hasher)(hashType, msgHash), sig, sig[64], hashType, onlyJs);
  const signerAddr = (0, _hasher.hasher)(hashType, publicKey, onlyJs);
  const inputAddr = (0, _util.u8aToU8a)(address); // for Ethereum (keccak) the last 20 bytes is the address

  return (0, _util.u8aEq)(publicKey, inputAddr) || (hashType === 'keccak' ? (0, _util.u8aEq)(signerAddr.slice(-20), inputAddr.slice(-20)) : (0, _util.u8aEq)(signerAddr, inputAddr));
}