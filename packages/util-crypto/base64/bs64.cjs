"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBase64 = exports.base64Validate = exports.base64Encode = exports.base64Decode = void 0;

var _microBase = require("micro-base");

var _helpers = require("../base32/helpers.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const config = {
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  coder: _microBase.base64,
  type: 'base64'
};
/**
 * @name base64Validate
 * @summary Validates a base64 value.
 * @description
 * Validates that the supplied value is valid base64
 */

const base64Validate = (0, _helpers.createValidate)(config);
/**
 * @name isBase64
 * @description Checks if the input is in base64, returning true/false
 */

exports.base64Validate = base64Validate;
const isBase64 = (0, _helpers.createIs)(base64Validate);
/**
 * @name base64Decode
 * @summary Decodes a base64 value.
 * @description
 * From the provided input, decode the base64 and return the result as an `Uint8Array`.
 */

exports.isBase64 = isBase64;
const base64Decode = (0, _helpers.createDecode)(config, base64Validate);
/**
 * @name base64Encode
 * @summary Creates a base64 value.
 * @description
 * From the provided input, create the base64 and return the result as a string.
 */

exports.base64Decode = base64Decode;
const base64Encode = (0, _helpers.createEncode)(config);
exports.base64Encode = base64Encode;