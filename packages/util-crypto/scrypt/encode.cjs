"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scryptEncode = scryptEncode;

var _scrypt = require("@noble/hashes/lib/scrypt");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _asU8a = require("../random/asU8a.cjs");

var _defaults = require("./defaults.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function scryptEncode(passphrase) {
  let salt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _asU8a.randomAsU8a)();
  let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaults.DEFAULT_PARAMS;
  let onlyJs = arguments.length > 3 ? arguments[3] : undefined;
  const u8a = (0, _util.u8aToU8a)(passphrase);
  return {
    params,
    password: !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.scrypt)(u8a, salt, Math.log2(params.N), params.r, params.p) : (0, _scrypt.scrypt)(u8a, salt, (0, _util.objectSpread)({
      dkLen: 64
    }, params)),
    salt
  };
}