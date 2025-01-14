"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secp256k1Sign = secp256k1Sign;

var _secp256k = require("@noble/secp256k1");

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _bn = require("../bn.cjs");

var _hasher = require("./hasher.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name secp256k1Sign
 * @description Returns message signature of `message`, using the supplied pair
 */
function secp256k1Sign(message, _ref) {
  let {
    secretKey
  } = _ref;
  let hashType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'blake2';
  let onlyJs = arguments.length > 3 ? arguments[3] : undefined;
  (0, _util.assert)((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 32, 'Expected valid secp256k1 secretKey, 32-bytes');
  const data = (0, _hasher.hasher)(hashType, message, onlyJs);

  if (!_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)()) {
    return (0, _wasmCrypto.secp256k1Sign)(data, secretKey);
  }

  const [sigBytes, recoveryParam] = (0, _secp256k.signSync)(data, secretKey, {
    canonical: true,
    recovered: true
  });

  const {
    r,
    s
  } = _secp256k.Signature.fromHex(sigBytes);

  return (0, _util.u8aConcat)((0, _util.bnToU8a)(r, _bn.BN_BE_256_OPTS), (0, _util.bnToU8a)(s, _bn.BN_BE_256_OPTS), new Uint8Array([recoveryParam || 0]));
}