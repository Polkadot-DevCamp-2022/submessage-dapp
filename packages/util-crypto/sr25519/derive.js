// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isU8a } from '@polkadot/util';
import { sr25519PairFromU8a } from "./pair/fromU8a.js";
import { sr25519KeypairToU8a } from "./pair/toU8a.js";
export function createDeriveFn(derive) {
  return (keypair, chainCode) => {
    assert(isU8a(chainCode) && chainCode.length === 32, 'Invalid chainCode passed to derive');
    return sr25519PairFromU8a(derive(sr25519KeypairToU8a(keypair), chainCode));
  };
}