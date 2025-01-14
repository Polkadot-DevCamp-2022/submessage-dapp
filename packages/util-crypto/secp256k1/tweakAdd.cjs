"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1PrivateKeyTweakAdd = secp256k1PrivateKeyTweakAdd;

var _util = require("@polkadot/util");

var _xBigint = require("@polkadot/x-bigint");

var _bn = require("../bn.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// pre-defined curve param as lifted form elliptic
// https://github.com/indutny/elliptic/blob/e71b2d9359c5fe9437fbf46f1f05096de447de57/lib/elliptic/curves.js#L182
const N = 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141'.replace(/ /g, '');
const N_BI = (0, _xBigint.BigInt)(`0x${N}`);
const N_BN = new _util.BN(N, 'hex');

function addBi(seckey, tweak) {
  let res = (0, _util.u8aToBigInt)(tweak, _bn.BN_BE_OPTS);
  (0, _util.assert)(res < N_BI, 'Tweak parameter is out of range');
  res += (0, _util.u8aToBigInt)(seckey, _bn.BN_BE_OPTS);

  if (res >= N_BI) {
    res -= N_BI;
  }

  (0, _util.assert)(res !== _util._0n, 'Invalid resulting private key');
  return (0, _util.nToU8a)(res, _bn.BN_BE_256_OPTS);
}

function addBn(seckey, tweak) {
  const res = new _util.BN(tweak);
  (0, _util.assert)(res.cmp(N_BN) < 0, 'Tweak parameter is out of range');
  res.iadd(new _util.BN(seckey));

  if (res.cmp(N_BN) >= 0) {
    res.isub(N_BN);
  }

  (0, _util.assert)(!res.isZero(), 'Invalid resulting private key');
  return (0, _util.bnToU8a)(res, _bn.BN_BE_256_OPTS);
}

function secp256k1PrivateKeyTweakAdd(seckey, tweak, onlyBn) {
  (0, _util.assert)((0, _util.isU8a)(seckey) && seckey.length === 32, 'Expected seckey to be an Uint8Array with length 32');
  (0, _util.assert)((0, _util.isU8a)(tweak) && tweak.length === 32, 'Expected tweak to be an Uint8Array with length 32');
  return !_util.hasBigInt || onlyBn ? addBn(seckey, tweak) : addBi(seckey, tweak);
}