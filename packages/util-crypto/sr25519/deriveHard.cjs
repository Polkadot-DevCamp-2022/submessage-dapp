"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519DeriveHard = void 0;

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _derive = require("./derive.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const sr25519DeriveHard = (0, _derive.createDeriveFn)(_wasmCrypto.sr25519DeriveKeypairHard);
exports.sr25519DeriveHard = sr25519DeriveHard;