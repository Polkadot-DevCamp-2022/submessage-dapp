"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evmToAddress = evmToAddress;

var _util = require("@polkadot/util");

var _hasher = require("../secp256k1/hasher.cjs");

var _encode = require("./encode.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name evmToAddress
 * @summary Converts an EVM address to its corresponding SS58 address.
 */
function evmToAddress(evmAddress, ss58Format) {
  let hashType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'blake2';
  const message = (0, _util.u8aConcat)('evm:', evmAddress);
  (0, _util.assert)(message.length === 24, () => `Converting ${evmAddress}: Invalid evm address length`);
  return (0, _encode.encodeAddress)((0, _hasher.hasher)(hashType, message), ss58Format);
}