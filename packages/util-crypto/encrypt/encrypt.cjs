"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encrypt = encrypt;

var _util = require("@polkadot/util");

var _index = require("../ed25519/index.cjs");

var _index2 = require("../sr25519/index.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name encrypt
 * @summary Encrypt a message using the given publickey
 * @description Returns the encrypted message of the given message using the public key.
 * The encrypted message can be decrypted by the corresponding keypair using keypair.decrypt() method
 */
function encrypt(message, recipientPublicKey, recipientKeyType, senderKeyPair) {
  (0, _util.assert)(!['ecdsa', 'ethereum'].includes(recipientKeyType), 'Secp256k1 not supported yet');
  const publicKey = (0, _util.u8aToU8a)(recipientPublicKey);
  return recipientKeyType === 'ed25519' ? (0, _index.ed25519Encrypt)(message, publicKey, senderKeyPair) : (0, _index2.sr25519Encrypt)(message, publicKey, senderKeyPair);
}