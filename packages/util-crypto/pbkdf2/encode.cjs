"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pbkdf2Encode = pbkdf2Encode;

var _pbkdf = require("@noble/hashes/lib/pbkdf2");

var _sha = require("@noble/hashes/lib/sha512");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _asU8a = require("../random/asU8a.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function pbkdf2Encode(passphrase) {
  let salt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _asU8a.randomAsU8a)();
  let rounds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2048;
  let onlyJs = arguments.length > 3 ? arguments[3] : undefined;
  const u8aPass = (0, _util.u8aToU8a)(passphrase);
  const u8aSalt = (0, _util.u8aToU8a)(salt);
  return {
    password: !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.pbkdf2)(u8aPass, u8aSalt, rounds) : (0, _pbkdf.pbkdf2)(_sha.sha512, u8aPass, u8aSalt, {
      c: rounds,
      dkLen: 64
    }),
    rounds,
    salt
  };
}