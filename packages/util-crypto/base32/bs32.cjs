"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBase32 = exports.base32Validate = exports.base32Encode = exports.base32Decode = void 0;

var _microBase = require("micro-base");

var _helpers = require("./helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const chars = 'abcdefghijklmnopqrstuvwxyz234567';
const config = {
  chars,
  coder: _microBase.utils.chain( // We define our own chain, the default base32 has padding
  _microBase.utils.radix2(5), _microBase.utils.alphabet(chars), {
    decode: input => input.split(''),
    encode: input => input.join('')
  }),
  ipfs: 'b',
  type: 'base32'
};
/**
 * @name base32Validate
 * @summary Validates a base32 value.
 * @description
 * Validates that the supplied value is valid base32, throwing exceptions if not
 */

const base32Validate = (0, _helpers.createValidate)(config);
/**
* @name isBase32
* @description Checks if the input is in base32, returning true/false
*/

exports.base32Validate = base32Validate;
const isBase32 = (0, _helpers.createIs)(base32Validate);
/**
 * @name base32Decode
 * @summary Delookup a base32 value.
 * @description
 * From the provided input, decode the base32 and return the result as an `Uint8Array`.
 */

exports.isBase32 = isBase32;
const base32Decode = (0, _helpers.createDecode)(config, base32Validate);
/**
* @name base32Encode
* @summary Creates a base32 value.
* @description
* From the provided input, create the base32 and return the result as a string.
*/

exports.base32Decode = base32Decode;
const base32Encode = (0, _helpers.createEncode)(config);
exports.base32Encode = base32Encode;