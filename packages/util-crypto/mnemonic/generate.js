// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { hasBigInt } from '@polkadot/util';
import { bip39Generate, isReady } from '@polkadot/wasm-crypto';
import { generateMnemonic } from "./bip39.js";
// mapping of words to the actual strength (as expected)
const STRENGTH_MAP = {
  12: 16 * 8,
  15: 20 * 8,
  18: 24 * 8,
  21: 28 * 8,
  24: 32 * 8
};
/**
 * @name mnemonicGenerate
 * @summary Creates a valid mnemonic string using using [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
 * @example
 * <BR>
 *
 * ```javascript
 * import { mnemonicGenerate } from '@polkadot/util-crypto';
 *
 * const mnemonic = mnemonicGenerate(); // => string
 * ```
 */

export function mnemonicGenerate(numWords = 12, onlyJs) {
  return !hasBigInt || !onlyJs && isReady() ? bip39Generate(numWords) : generateMnemonic(STRENGTH_MAP[numWords]);
}