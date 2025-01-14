"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.u8aToU8a = u8aToU8a;

var _toU8a = require("../hex/toU8a.cjs");

var _buffer = require("../is/buffer.cjs");

var _hex = require("../is/hex.cjs");

var _u8a = require("../is/u8a.cjs");

var _toU8a2 = require("../string/toU8a.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name u8aToU8a
 * @summary Creates a Uint8Array value from a Uint8Array, Buffer, string or hex input.
 * @description
 * `null` or `undefined` inputs returns a `[]` result, Uint8Array values returns the value, hex strings returns a Uint8Array representation.
 * @example
 * <BR>
 *
 * ```javascript
 * import { u8aToU8a } from '@polkadot/util';
 *
 * u8aToU8a(new Uint8Array([0x12, 0x34]); // => Uint8Array([0x12, 0x34])
 * u8aToU8a(0x1234); // => Uint8Array([0x12, 0x34])
 * ```
 */
function u8aToU8a(value) {
  return !value ? new Uint8Array() : Array.isArray(value) || (0, _buffer.isBuffer)(value) ? new Uint8Array(value) : (0, _u8a.isU8a)(value) ? value : (0, _hex.isHex)(value) ? (0, _toU8a.hexToU8a)(value) : (0, _toU8a2.stringToU8a)(value);
}