"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mnemonicToLegacySeed = mnemonicToLegacySeed;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _bip = require("./bip39.cjs");

var _validate = require("./validate.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name mnemonicToLegacySeed
 * @summary Creates a valid Ethereum/Bitcoin-compatible seed from a mnemonic input
 * @example
 * <BR>
 *
 * ```javascript
 * import { mnemonicGenerate, mnemonicToLegacySeed, mnemonicValidate } from '@polkadot/util-crypto';
 *
 * const mnemonic = mnemonicGenerate(); // => string
 * const isValidMnemonic = mnemonicValidate(mnemonic); // => boolean
 *
 * if (isValidMnemonic) {
 *   console.log(`Seed generated from mnemonic: ${mnemonicToLegacySeed(mnemonic)}`); => u8a
 * }
 * ```
 */
function mnemonicToLegacySeed(mnemonic) {
  let password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let onlyJs = arguments.length > 2 ? arguments[2] : undefined;
  let byteLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 32;
  (0, _util.assert)((0, _validate.mnemonicValidate)(mnemonic), 'Invalid bip39 mnemonic specified');
  (0, _util.assert)([32, 64].includes(byteLength), () => `Invalid seed length ${byteLength}, expected 32 or 64`);
  return byteLength === 32 ? !_util.hasBigInt || !onlyJs && (0, _wasmCrypto.isReady)() ? (0, _wasmCrypto.bip39ToSeed)(mnemonic, password) : (0, _bip.mnemonicToSeedSync)(mnemonic, password).subarray(0, 32) : (0, _bip.mnemonicToSeedSync)(mnemonic, password);
}