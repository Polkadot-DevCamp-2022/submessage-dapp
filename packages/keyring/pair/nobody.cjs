"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nobody = nobody;

var _utilCrypto = require("@polkadot/util-crypto");

// Copyright 2017-2021 @polkadot/keyring authors & contributors
// SPDX-License-Identifier: Apache-2.0
const publicKey = new Uint8Array(32);
const address = (0, _utilCrypto.encodeAddress)(publicKey);
const meta = {
  isTesting: true,
  name: 'nobody'
};
const json = {
  address,
  encoded: '',
  encoding: {
    content: ['pkcs8', 'ed25519'],
    type: 'none',
    version: '0'
  },
  meta
};
const pair = {
  address,
  addressRaw: publicKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decodePkcs8: (passphrase, encoded) => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decrypt: encryptedMessage => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decryptMessage: (encryptedMessageWithNonce, senderPublicKey) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  derive: (suri, meta) => pair,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encodePkcs8: passphrase => new Uint8Array(0),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encrypt: message => new Uint8Array(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encryptMessage: (message, recipientPublicKey, _nonce) => new Uint8Array(),
  isLocked: true,
  lock: () => {// no locking, it is always locked
  },
  meta,
  publicKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMeta: meta => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sign: message => new Uint8Array(64),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toJson: passphrase => json,
  type: 'ed25519',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unlock: passphrase => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verify: (message, signature) => false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vrfSign: (message, context, extra) => new Uint8Array(96),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vrfVerify: (message, vrfResult, context, extra) => false
};

function nobody() {
  return pair;
}