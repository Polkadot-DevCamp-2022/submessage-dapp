"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519VrfVerify = sr25519VrfVerify;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const EMPTY_U8A = new Uint8Array();
/**
 * @name sr25519VrfVerify
 * @description Verify with sr25519 vrf verification
 */

function sr25519VrfVerify(message, signOutput, publicKey) {
  let context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EMPTY_U8A;
  let extra = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : EMPTY_U8A;
  const publicKeyU8a = (0, _util.u8aToU8a)(publicKey);
  const proofU8a = (0, _util.u8aToU8a)(signOutput);
  (0, _util.assert)(publicKeyU8a.length === 32, 'Invalid publicKey, expected 32-bytes');
  (0, _util.assert)(proofU8a.length === 96, 'Invalid vrfSign output, expected 96 bytes');
  return (0, _wasmCrypto.vrfVerify)(publicKeyU8a, (0, _util.u8aToU8a)(context), (0, _util.u8aToU8a)(message), (0, _util.u8aToU8a)(extra), proofU8a);
}