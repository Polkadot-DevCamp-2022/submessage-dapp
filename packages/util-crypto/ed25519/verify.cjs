"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519Verify = ed25519Verify;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name ed25519Sign
 * @summary Verifies the signature on the supplied message.
 * @description
 * Verifies the `signature` on `message` with the supplied `publicKey`. Returns `true` on sucess, `false` otherwise.
 * @example
 * <BR>
 *
 * ```javascript
 * import { ed25519Verify } from '@polkadot/util-crypto';
 *
 * ed25519Verify([...], [...], [...]); // => true/false
 * ```
 */
function ed25519Verify(message, signature, publicKey, onlyJs) {
  const messageU8a = (0, _util.u8aToU8a)(message);
  const publicKeyU8a = (0, _util.u8aToU8a)(publicKey);
  const signatureU8a = (0, _util.u8aToU8a)(signature);
  (0, _util.assert)(publicKeyU8a.length === 32, () => `Invalid publicKey, received ${publicKeyU8a.length}, expected 32`);
  (0, _util.assert)(signatureU8a.length === 64, () => `Invalid signature, received ${signatureU8a.length} bytes, expected 64`);
  return !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.ed25519Verify)(signatureU8a, messageU8a, publicKeyU8a) : _tweetnacl.default.sign.detached.verify(messageU8a, signatureU8a, publicKeyU8a);
}