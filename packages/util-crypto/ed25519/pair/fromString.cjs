"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ed25519PairFromString = ed25519PairFromString;

var _util = require("@polkadot/util");

var _asU8a = require("../../blake2/asU8a.cjs");

var _fromSeed = require("./fromSeed.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name ed25519PairFromString
 * @summary Creates a new public/secret keypair from a string.
 * @description
 * Returns a object containing a `publicKey` & `secretKey` generated from the supplied string. The string is hashed and the value used as the input seed.
 * @example
 * <BR>
 *
 * ```javascript
 * import { ed25519PairFromString } from '@polkadot/util-crypto';
 *
 * ed25519PairFromString('test'); // => { secretKey: [...], publicKey: [...] }
 * ```
 */
function ed25519PairFromString(value) {
  return (0, _fromSeed.ed25519PairFromSeed)((0, _asU8a.blake2AsU8a)((0, _util.stringToU8a)(value)));
}