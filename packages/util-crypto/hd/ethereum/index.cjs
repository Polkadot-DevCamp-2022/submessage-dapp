"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hdEthereum = hdEthereum;

var _util = require("@polkadot/util");

var _bn = require("../../bn.cjs");

var _index = require("../../hmac/index.cjs");

var _index2 = require("../../secp256k1/index.cjs");

var _validatePath = require("../validatePath.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const MASTER_SECRET = (0, _util.stringToU8a)('Bitcoin seed');

function createCoded(secretKey, chainCode) {
  return {
    chainCode,
    publicKey: (0, _index2.secp256k1PairFromSeed)(secretKey).publicKey,
    secretKey
  };
}

function deriveChild(hd, index) {
  const indexBuffer = (0, _util.bnToU8a)(index, _bn.BN_BE_32_OPTS);
  const data = index >= _validatePath.HARDENED ? (0, _util.u8aConcat)(new Uint8Array(1), hd.secretKey, indexBuffer) : (0, _util.u8aConcat)(hd.publicKey, indexBuffer);

  try {
    const I = (0, _index.hmacShaAsU8a)(hd.chainCode, data, 512);
    return createCoded((0, _index2.secp256k1PrivateKeyTweakAdd)(hd.secretKey, I.slice(0, 32)), I.slice(32));
  } catch (err) {
    // In case parse256(IL) >= n or ki == 0, proceed with the next value for i
    return deriveChild(hd, index + 1);
  }
}

function hdEthereum(seed) {
  let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  const I = (0, _index.hmacShaAsU8a)(MASTER_SECRET, seed, 512);
  let hd = createCoded(I.slice(0, 32), I.slice(32));

  if (!path || path === 'm' || path === 'M' || path === "m'" || path === "M'") {
    return hd;
  }

  (0, _util.assert)((0, _validatePath.hdValidatePath)(path), 'Invalid derivation path');
  const parts = path.split('/').slice(1);

  for (const p of parts) {
    hd = deriveChild(hd, parseInt(p, 10) + (p.length > 1 && p.endsWith("'") ? _validatePath.HARDENED : 0));
  }

  return hd;
}