"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nSqrt = nSqrt;

var _xBigint = require("@polkadot/x-bigint");

var _assert = require("../assert.cjs");

var _consts = require("./consts.cjs");

var _toBigInt = require("./toBigInt.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const _sqrt2pow53n = (0, _xBigint.BigInt)(94906265);
/**
 * @name nSqrt
 * @summary Calculates the integer square root of a bigint
 */


function nSqrt(value) {
  const n = (0, _toBigInt.nToBigInt)(value);
  (0, _assert.assert)(n >= _consts._0n, 'square root of negative numbers is not supported'); // https://stackoverflow.com/questions/53683995/javascript-big-integer-square-root/
  // shortcut <= 2^53 - 1 to use the JS utils

  if (n <= _consts._2pow53n) {
    return (0, _xBigint.BigInt)(Math.floor(Math.sqrt(Number(n))));
  } // Use sqrt(MAX_SAFE_INTEGER) as starting point. since we already know the
  // output will be larger than this, we expect this to be a safe start


  let x0 = _sqrt2pow53n;

  while (true) {
    const x1 = n / x0 + x0 >> _consts._1n;

    if (x0 === x1 || x0 === x1 - _consts._1n) {
      return x0;
    }

    x0 = x1;
  }
}