// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { Keypair } from '../../types';

import { assert, u8aToU8a } from '@polkadot/util';

const SEC_LEN = 64;
const PUB_LEN = 32;
const TOT_LEN = SEC_LEN + PUB_LEN;

export function sr25519PairFromU8a (full: HexString | Uint8Array | string): Keypair {
  const fullU8a = u8aToU8a(full);

  assert(fullU8a.length === TOT_LEN, () => `Expected keypair with ${TOT_LEN} bytes, found ${fullU8a.length}`);

  return {
    publicKey: fullU8a.slice(SEC_LEN, TOT_LEN),
    secretKey: fullU8a.slice(0, SEC_LEN)
  };
}
