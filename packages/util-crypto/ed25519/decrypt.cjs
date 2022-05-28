"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519Decrypt = ed25519Decrypt;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _util = require("@polkadot/util");

var _index = require("../nacl/index.cjs");

var _convertKey = require("./convertKey.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name ed25519Decrypt
 * @description Returns decrypted message of `encryptedMessage`, using the supplied pair
 */
function ed25519Decrypt(encryptedMessage, _ref) {
  let {
    secretKey
  } = _ref;
  const decapsulatedEncryptedMessage = ed25519DecapsulateEncryptedMessage(encryptedMessage);
  const x25519PublicKey = (0, _convertKey.convertPublicKeyToCurve25519)(decapsulatedEncryptedMessage.ephemeralPublicKey);
  const x25519SecretKey = (0, _convertKey.convertSecretKeyToCurve25519)((0, _util.u8aToU8a)(secretKey));
  return (0, _index.naclOpen)(decapsulatedEncryptedMessage.sealed, decapsulatedEncryptedMessage.nonce, x25519PublicKey, x25519SecretKey);
}
/**
 * @name ed25519DecapsulateEncryptedMessage
 * @description Split raw encrypted message
 */


function ed25519DecapsulateEncryptedMessage(encryptedMessage) {
  (0, _util.assert)(encryptedMessage.length > _tweetnacl.default.box.publicKeyLength + _tweetnacl.default.box.nonceLength + _tweetnacl.default.box.overheadLength, 'Too short encrypted message');
  return {
    ephemeralPublicKey: (0, _util.u8aToU8a)(encryptedMessage.slice(_tweetnacl.default.box.nonceLength, _tweetnacl.default.box.nonceLength + _tweetnacl.default.box.publicKeyLength)),
    nonce: (0, _util.u8aToU8a)(encryptedMessage.slice(0, _tweetnacl.default.box.nonceLength)),
    sealed: (0, _util.u8aToU8a)(encryptedMessage.slice(_tweetnacl.default.box.nonceLength + _tweetnacl.default.box.publicKeyLength))
  };
}