"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hexToBigInt = hexToBigInt;

var _xBigint = require("@polkadot/x-bigint");

var _spread = require("../object/spread.cjs");

var _toBigInt = require("../u8a/toBigInt.cjs");

var _toU8a = require("./toU8a.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name hexToBigInt
 * @summary Creates a BigInt instance object from a hex string.
 */
function hexToBigInt(value) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!value || value === '0x') {
    return (0, _xBigint.BigInt)(0);
  }

  return (0, _toBigInt.u8aToBigInt)((0, _toU8a.hexToU8a)(value), (0, _spread.objectSpread)({
    isLe: false,
    isNegative: false
  }, options));
}