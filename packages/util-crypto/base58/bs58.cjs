"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBase58 = exports.base58Validate = exports.base58Encode = exports.base58Decode = void 0;

var _microBase = require("micro-base");

var _helpers = require("../base32/helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const config = {
  chars: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  coder: _microBase.base58,
  ipfs: 'z',
  type: 'base58'
};
/**
 * @name base58Validate
 * @summary Validates a base58 value.
 * @description
 * Validates that the supplied value is valid base58, throwing exceptions if not
 */

const base58Validate = (0, _helpers.createValidate)(config);
/**
 * @name base58Decode
 * @summary Decodes a base58 value.
 * @description
 * From the provided input, decode the base58 and return the result as an `Uint8Array`.
 */

exports.base58Validate = base58Validate;
const base58Decode = (0, _helpers.createDecode)(config, base58Validate);
/**
* @name base58Encode
* @summary Creates a base58 value.
* @description
* From the provided input, create the base58 and return the result as a string.
*/

exports.base58Decode = base58Decode;
const base58Encode = (0, _helpers.createEncode)(config);
/**
* @name isBase58
* @description Checks if the input is in base58, returning true/false
*/

exports.base58Encode = base58Encode;
const isBase58 = (0, _helpers.createIs)(base58Validate);
exports.isBase58 = isBase58;