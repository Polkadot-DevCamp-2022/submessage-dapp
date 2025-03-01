"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nToBigInt = nToBigInt;

var _xBigint = require("@polkadot/x-bigint");

var _toBigInt = require("../hex/toBigInt.cjs");

var _bn = require("../is/bn.cjs");

var _hex = require("../is/hex.cjs");

var _toBigInt2 = require("../is/toBigInt.cjs");

var _toBn = require("../is/toBn.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name nToBigInt
 * @summary Creates a bigInt value from a BN, bigint, string (base 10 or hex) or number input.
 */
function nToBigInt(value) {
  return typeof value === 'bigint' ? value : !value ? (0, _xBigint.BigInt)(0) : (0, _hex.isHex)(value) ? (0, _toBigInt.hexToBigInt)(value.toString()) : (0, _bn.isBn)(value) ? (0, _xBigint.BigInt)(value.toString()) : (0, _toBigInt2.isToBigInt)(value) ? value.toBigInt() : (0, _toBn.isToBn)(value) ? (0, _xBigint.BigInt)(value.toBn().toString()) : (0, _xBigint.BigInt)(value);
}