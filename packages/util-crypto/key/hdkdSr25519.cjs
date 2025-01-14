"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyHdkdSr25519 = keyHdkdSr25519;

var _deriveHard = require("../sr25519/deriveHard.cjs");

var _deriveSoft = require("../sr25519/deriveSoft.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function keyHdkdSr25519(keypair, _ref) {
  let {
    chainCode,
    isSoft
  } = _ref;
  return isSoft ? (0, _deriveSoft.sr25519DeriveSoft)(keypair, chainCode) : (0, _deriveHard.sr25519DeriveHard)(keypair, chainCode);
}