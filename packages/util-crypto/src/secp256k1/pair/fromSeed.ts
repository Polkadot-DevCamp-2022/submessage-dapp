// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Keypair } from '../../types';

import { getPublicKey } from '@noble/secp256k1';

import { assert, hasBigInt } from '@polkadot/util';
import { isReady, secp256k1FromSeed } from '@polkadot/wasm-crypto';

/**
 * @name secp256k1PairFromSeed
 * @description Returns a object containing a `publicKey` & `secretKey` generated from the supplied seed.
 */
export function secp256k1PairFromSeed (seed: Uint8Array, onlyJs?: boolean): Keypair {
  assert(seed.length === 32, 'Expected valid 32-byte private key as a seed');

  if (!hasBigInt || (!onlyJs && isReady())) {
    const full = secp256k1FromSeed(seed);

    return {
      publicKey: full.slice(32),
      secretKey: full.slice(0, 32)
    };
  }

  return {
    publicKey: getPublicKey(seed, true),
    secretKey: seed
  };
}
