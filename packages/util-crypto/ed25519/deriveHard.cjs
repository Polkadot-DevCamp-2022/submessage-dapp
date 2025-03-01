"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519DeriveHard = ed25519DeriveHard;

var _util = require("@polkadot/util");

var _asU8a = require("../blake2/asU8a.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const HDKD = (0, _util.compactAddLength)((0, _util.stringToU8a)('Ed25519HDKD'));

function ed25519DeriveHard(seed, chainCode) {
  (0, _util.assert)((0, _util.isU8a)(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
  return (0, _asU8a.blake2AsU8a)((0, _util.u8aConcat)(HDKD, seed, chainCode));
}