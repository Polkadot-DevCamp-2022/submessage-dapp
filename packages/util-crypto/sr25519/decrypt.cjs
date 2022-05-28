"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519Decrypt = sr25519Decrypt;

var _util = require("@polkadot/util");

var _index = require("../nacl/index.cjs");

var _encrypt = require("./encrypt.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const publicKeySize = 32;
const macValueSize = 32;

/**
 * @name sr25519Decrypt
 * @description Returns decrypted message of `encryptedMessage`, using the supplied pair
 */
function sr25519Decrypt(encryptedMessage, _ref) {
  let {
    secretKey
  } = _ref;
  const {
    ephemeralPublicKey,
    keyDerivationSalt,
    macValue,
    nonce,
    sealed
  } = sr25519DecapsulateEncryptedMessage((0, _util.u8aToU8a)(encryptedMessage));
  const {
    encryptionKey,
    macKey
  } = (0, _encrypt.buildSR25519EncryptionKey)(ephemeralPublicKey, (0, _util.u8aToU8a)(secretKey), ephemeralPublicKey, keyDerivationSalt);
  const decryptedMacValue = (0, _encrypt.macData)(nonce, sealed, ephemeralPublicKey, macKey);
  (0, _util.assert)((0, _util.u8aCmp)(decryptedMacValue, macValue) === 0, "Mac values don't match");
  return (0, _index.naclDecrypt)(sealed, nonce, encryptionKey);
}
/**
 * @name sr25519DecapsulateEncryptedMessage
 * @description Split raw encrypted message
 */


function sr25519DecapsulateEncryptedMessage(encryptedMessage) {
  (0, _util.assert)(encryptedMessage.byteLength > _encrypt.nonceSize + _encrypt.keyDerivationSaltSize + publicKeySize + macValueSize, 'Wrong encrypted message length');
  return {
    ephemeralPublicKey: encryptedMessage.slice(_encrypt.nonceSize + _encrypt.keyDerivationSaltSize, _encrypt.nonceSize + _encrypt.keyDerivationSaltSize + publicKeySize),
    keyDerivationSalt: encryptedMessage.slice(_encrypt.nonceSize, _encrypt.nonceSize + _encrypt.keyDerivationSaltSize),
    macValue: encryptedMessage.slice(_encrypt.nonceSize + _encrypt.keyDerivationSaltSize + publicKeySize, _encrypt.nonceSize + _encrypt.keyDerivationSaltSize + publicKeySize + macValueSize),
    nonce: encryptedMessage.slice(0, _encrypt.nonceSize),
    sealed: encryptedMessage.slice(_encrypt.nonceSize + _encrypt.keyDerivationSaltSize + publicKeySize + macValueSize)
  };
}