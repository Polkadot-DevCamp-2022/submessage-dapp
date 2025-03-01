"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasher = hasher;

var _index = require("../blake2/index.cjs");

var _index2 = require("../keccak/index.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hasher(hashType, data, onlyJs) {
  return hashType === 'keccak' ? (0, _index2.keccakAsU8a)(data, undefined, onlyJs) : (0, _index.blake2AsU8a)(data, undefined, undefined, onlyJs);
}