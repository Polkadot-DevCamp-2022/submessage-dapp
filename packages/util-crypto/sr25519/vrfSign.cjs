"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519VrfSign = sr25519VrfSign;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const EMPTY_U8A = new Uint8Array();
/**
 * @name sr25519VrfSign
 * @description Sign with sr25519 vrf signing (deterministic)
 */

function sr25519VrfSign(message, _ref) {
  let {
    secretKey
  } = _ref;
  let context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EMPTY_U8A;
  let extra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EMPTY_U8A;
  (0, _util.assert)((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 64, 'Invalid secretKey, expected 64-bytes');
  return (0, _wasmCrypto.vrfSign)(secretKey, (0, _util.u8aToU8a)(context), (0, _util.u8aToU8a)(message), (0, _util.u8aToU8a)(extra));
}