// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Params } from './types';

import { assert, u8aToBn } from '@polkadot/util';

import { BN_LE_OPTS } from '../bn';
import { DEFAULT_PARAMS } from './defaults';

interface Result {
  params: Params,
  salt: Uint8Array;
}

export function scryptFromU8a (data: Uint8Array): Result {
  const salt = data.subarray(0, 32);
  const N = u8aToBn(data.subarray(32 + 0, 32 + 4), BN_LE_OPTS).toNumber();
  const p = u8aToBn(data.subarray(32 + 4, 32 + 8), BN_LE_OPTS).toNumber();
  const r = u8aToBn(data.subarray(32 + 8, 32 + 12), BN_LE_OPTS).toNumber();

  // FIXME At this moment we assume these to be fixed params, this is not a great idea since we lose flexibility
  // and updates for greater security. However we need some protection against carefully-crafted params that can
  // eat up CPU since these are user inputs. So we need to get very clever here, but atm we only allow the defaults
  // and if no match, bail out
  assert(N === DEFAULT_PARAMS.N && p === DEFAULT_PARAMS.p && r === DEFAULT_PARAMS.r, 'Invalid injected scrypt params found');

  return { params: { N, p, r }, salt };
}
