"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519Encrypt = ed25519Encrypt;

var _util = require("@polkadot/util");

var _seal = require("../nacl/seal.cjs");

var _fromRandom = require("./pair/fromRandom.cjs");

var _convertKey = require("./convertKey.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name ed25519Encrypt
 * @description Returns encrypted message of `message`, using the supplied pair
 */
function ed25519Encrypt(message, receiverPublicKey, senderKeyPair) {
  const messageKeyPair = senderKeyPair || (0, _fromRandom.ed25519PairFromRandom)();
  const x25519PublicKey = (0, _convertKey.convertPublicKeyToCurve25519)(receiverPublicKey);
  const x25519SecretKey = (0, _convertKey.convertSecretKeyToCurve25519)(messageKeyPair.secretKey);
  const {
    nonce,
    sealed
  } = (0, _seal.naclSeal)((0, _util.u8aToU8a)(message), x25519SecretKey, x25519PublicKey);
  return (0, _util.u8aConcat)(nonce, messageKeyPair.publicKey, sealed);
}