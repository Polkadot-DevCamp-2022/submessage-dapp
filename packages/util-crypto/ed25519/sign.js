// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import nacl from 'tweetnacl';
import { assert, u8aToU8a } from '@polkadot/util';
import { ed25519Sign as wasmSign, isReady } from '@polkadot/wasm-crypto';
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

export function ed25519Sign(message, {
  publicKey,
  secretKey
}, onlyJs) {
  assert(secretKey, 'Expected a valid secretKey');
  const messageU8a = u8aToU8a(message);
  return !onlyJs && isReady() ? wasmSign(publicKey, secretKey.subarray(0, 32), messageU8a) : nacl.sign.detached(messageU8a, secretKey);
}