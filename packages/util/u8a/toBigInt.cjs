"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.u8aToBigInt = u8aToBigInt;

var _xBigint = require("@polkadot/x-bigint");

var _consts = require("../bi/consts.cjs");

var _spread = require("../object/spread.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const U8_MAX = (0, _xBigint.BigInt)(256);
const U16_MAX = (0, _xBigint.BigInt)(256 * 256);

function xor(input) {
  const result = new Uint8Array(input.length);
  const dvI = new DataView(input.buffer, input.byteOffset);
  const dvO = new DataView(result.buffer);
  const mod = input.length % 2;
  const length = input.length - mod;

  for (let i = 0; i < length; i += 2) {
    dvO.setUint16(i, dvI.getUint16(i) ^ 0xffff);
  }

  if (mod) {
    dvO.setUint8(length, dvI.getUint8(length) ^ 0xff);
  }

  return result;
}

function toBigInt(input) {
  const dvI = new DataView(input.buffer, input.byteOffset);
  const mod = input.length % 2;
  const length = input.length - mod;
  let result = (0, _xBigint.BigInt)(0);

  for (let i = 0; i < length; i += 2) {
    result = result * U16_MAX + (0, _xBigint.BigInt)(dvI.getUint16(i));
  }

  if (mod) {
    result = result * U8_MAX + (0, _xBigint.BigInt)(dvI.getUint8(length));
  }

  return result;
}
/**
 * @name u8aToBigInt
 * @summary Creates a BigInt from a Uint8Array object.
 */


function u8aToBigInt(value) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!value || !value.length) {
    return (0, _xBigint.BigInt)(0);
  }

  const {
    isLe,
    isNegative
  } = (0, _spread.objectSpread)({
    isLe: true,
    isNegative: false
  }, options);
  const u8a = isLe ? value.reverse() : value;
  return isNegative ? toBigInt(xor(u8a)) * -_consts._1n - _consts._1n : toBigInt(u8a);
}