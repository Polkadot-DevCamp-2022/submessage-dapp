"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519Sign = ed25519Sign;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name ed25519Sign
 * @summary Signs a message using the supplied secretKey
 * @description
 * Returns message signature of `message`, using the `secretKey`.
 * @example
 * <BR>
 *
 * ```javascript
 * import { ed25519Sign } from '@polkadot/util-crypto';
 *
 * ed25519Sign([...], [...]); // => [...]
 * ```
 */
function ed25519Sign(message, _ref, onlyJs) {
  let {
    publicKey,
    secretKey
  } = _ref;
  (0, _util.assert)(secretKey, 'Expected a valid secretKey');
  const messageU8a = (0, _util.u8aToU8a)(message);
  return !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.ed25519Sign)(publicKey, secretKey.subarray(0, 32), messageU8a) : _tweetnacl.default.sign.detached(messageU8a, secretKey);
}