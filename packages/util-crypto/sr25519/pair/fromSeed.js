// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, u8aToU8a } from '@polkadot/util';
import { sr25519KeypairFromSeed } from '@polkadot/wasm-crypto';
import { sr25519PairFromU8a } from "./fromU8a.js";
/**
 * @name sr25519PairFromSeed
 * @description Returns a object containing a `publicKey` & `secretKey` generated from the supplied seed.
 */

export function sr25519PairFromSeed(seed) {
  const seedU8a = u8aToU8a(seed);
  assert(seedU8a.length === 32, () => `Expected a seed matching 32 bytes, found ${seedU8a.length}`);
  return sr25519PairFromU8a(sr25519KeypairFromSeed(seedU8a));
}