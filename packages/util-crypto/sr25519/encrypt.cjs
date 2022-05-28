"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSR25519EncryptionKey = buildSR25519EncryptionKey;
exports.keyDerivationSaltSize = void 0;
exports.macData = macData;
exports.nonceSize = void 0;
exports.sr25519Encrypt = sr25519Encrypt;

var _util = require("@polkadot/util");

var _index = require("../hmac/index.cjs");

var _index2 = require("../mnemonic/index.cjs");

var _index3 = require("../nacl/index.cjs");

var _index4 = require("../pbkdf2/index.cjs");

var _index5 = require("../random/index.cjs");

var _fromSeed = require("./pair/fromSeed.cjs");

var _agreement = require("./agreement.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// SR25519 Encryption/Decryption following Elliptic Curve Integrated Encryption Scheme (ECIES)
// https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption
// Implementation details:
// The algorithms used were chosen among those already used in this library
// - 1 - Ephemeral Key generation
//       Generate new keypair using the wasm sr25519KeypairFromSeed function, with a random seed from
//       mnemonicGenerate
// - 2 - Key Agreement
//       Use wasm sr25519Agree function between the generated ephemeral private key and the recipient public key
// - 3 - Key Derivation
//       Use pbkdf2 (random salt is generated, default 2048 rounds) to derive a new secret from the previous step output
//       The derived secret is split into :
//       - MAC key (first 32 bytes)
//       - encryption key (last 32 bytes)
// - 4 - Encryption
//       Use nacl.secretbox api symmetric encryption (xsalsa20-poly1305) to encrypt the message
//       with the encryption key generated at step 3.
//       A nonce (24 bytes) is randomly generated.
// - 5 - MAC Generation
//       HMAC SHA256 (using the MAC key from step 3) of the concatenation of the encryption nonce, ephemeral public key and encrypted message
//
// The encrypted message is the concatenation of the following elements :
// - nonce (24 bytes) : random generated nonce used for the symmetric encryption (step 4)
// - keyDerivationSalt (32 bytes) : random generated salt used for the key derivation (step 3)
// - public key (32 bytes): public key of the ephemeral generated keypair (step 1)
// - macValue (32 bytes): mac value computed at step 5
// - encrypted (remaining bytes): encrypted message (step 4)
const encryptionKeySize = 32;
const macKeySize = 32;
const derivationKeyRounds = 2048;
const keyDerivationSaltSize = 32;
exports.keyDerivationSaltSize = keyDerivationSaltSize;
const nonceSize = 24;
/**
 * @name sr25519Encrypt
 * @description Returns encrypted message of `message`, using the supplied pair
 */

exports.nonceSize = nonceSize;

function sr25519Encrypt(message, receiverPublicKey, senderKeyPair) {
  const messageKeyPair = senderKeyPair || generateEphemeralKeypair();
  const {
    encryptionKey,
    keyDerivationSalt,
    macKey
  } = generateEncryptionKey(messageKeyPair, receiverPublicKey);
  const {
    encrypted,
    nonce
  } = (0, _index3.naclEncrypt)((0, _util.u8aToU8a)(message), encryptionKey, (0, _index5.randomAsU8a)(nonceSize));
  const macValue = macData(nonce, encrypted, messageKeyPair.publicKey, macKey);
  return (0, _util.u8aConcat)(nonce, keyDerivationSalt, messageKeyPair.publicKey, macValue, encrypted);
}

function generateEphemeralKeypair() {
  return (0, _fromSeed.sr25519PairFromSeed)((0, _index2.mnemonicToMiniSecret)((0, _index2.mnemonicGenerate)()));
}

function generateEncryptionKey(senderKeyPair, receiverPublicKey) {
  const {
    encryptionKey,
    keyDerivationSalt,
    macKey
  } = buildSR25519EncryptionKey(receiverPublicKey, senderKeyPair.secretKey, senderKeyPair.publicKey);
  return {
    encryptionKey,
    keyDerivationSalt,
    macKey
  };
}

function buildSR25519EncryptionKey(publicKey, secretKey, encryptedMessagePairPublicKey) {
  let salt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : (0, _index5.randomAsU8a)(keyDerivationSaltSize);
  const agreementKey = (0, _agreement.sr25519Agreement)(secretKey, publicKey);
  const masterSecret = (0, _util.u8aConcat)(encryptedMessagePairPublicKey, agreementKey);
  return deriveKey(masterSecret, salt);
}

function deriveKey(masterSecret, salt) {
  const {
    password
  } = (0, _index4.pbkdf2Encode)(masterSecret, salt, derivationKeyRounds);
  (0, _util.assert)(password.byteLength >= macKeySize + encryptionKeySize, 'Wrong derived key length');
  return {
    encryptionKey: password.slice(macKeySize, macKeySize + encryptionKeySize),
    keyDerivationSalt: salt,
    macKey: password.slice(0, macKeySize)
  };
}

function macData(nonce, encryptedMessage, encryptedMessagePairPublicKey, macKey) {
  return (0, _index.hmacSha256AsU8a)(macKey, (0, _util.u8aConcat)(nonce, encryptedMessagePairPublicKey, encryptedMessage));
}