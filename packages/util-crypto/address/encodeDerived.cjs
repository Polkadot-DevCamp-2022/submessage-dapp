"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeDerivedAddress = encodeDerivedAddress;

var _decode = require("./decode.cjs");

var _encode = require("./encode.cjs");

var _keyDerived = require("./keyDerived.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name encodeDerivedAddress
 * @summary Creates a derived address as used in Substrate utility.
 * @description
 * Creates a Substrate derived address based on the input address/publicKey and the index supplied.
 */
function encodeDerivedAddress(who, index, ss58Format) {
  return (0, _encode.encodeAddress)((0, _keyDerived.createKeyDerived)((0, _decode.decodeAddress)(who), index), ss58Format);
}