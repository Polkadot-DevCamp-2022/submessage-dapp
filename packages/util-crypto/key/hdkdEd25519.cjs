"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyHdkdEd25519 = void 0;

var _index = require("../ed25519/index.cjs");

var _hdkdDerive = require("./hdkdDerive.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const keyHdkdEd25519 = (0, _hdkdDerive.createSeedDeriveFn)(_index.ed25519PairFromSeed, _index.ed25519DeriveHard);
exports.keyHdkdEd25519 = keyHdkdEd25519;