// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { Signature, signSync } from '@noble/secp256k1';
import { assert, bnToU8a, hasBigInt, u8aConcat } from '@polkadot/util';
import { isReady, secp256k1Sign as wasm } from '@polkadot/wasm-crypto';
import { BN_BE_256_OPTS } from "../bn.js";
import { hasher } from "./hasher.js";
/**
 * @name secp256k1Sign
 * @description Returns message signature of `message`, using the supplied pair
 */

export function secp256k1Sign(message, {
  secretKey
}, hashType = 'blake2', onlyJs) {
  assert((secretKey === null || secretKey === void 0 ? void 0 : secretKey.length) === 32, 'Expected valid secp256k1 secretKey, 32-bytes');
  const data = hasher(hashType, message, onlyJs);

  if (!hasBigInt || !onlyJs && isReady()) {
    return wasm(data, secretKey);
  }

  const [sigBytes, recoveryParam] = signSync(data, secretKey, {
    canonical: true,
    recovered: true
  });
  const {
    r,
    s
  } = Signature.fromHex(sigBytes);
  return u8aConcat(bnToU8a(r, BN_BE_256_OPTS), bnToU8a(s, BN_BE_256_OPTS), new Uint8Array([recoveryParam || 0]));
}