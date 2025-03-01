// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { hasBigInt, u8aToHex, u8aToU8a } from '@polkadot/util';
import { isReady } from '@polkadot/wasm-crypto'; // re-export so TS *.d.ts generation is correct

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAsHex(fn) {
  return (...args) => u8aToHex(fn(...args));
}
export function createBitHasher(bitLength, fn) {
  return (data, onlyJs) => fn(data, bitLength, onlyJs);
}
export function createDualHasher(wa, js) {
  return (value, bitLength = 256, onlyJs) => {
    const u8a = u8aToU8a(value);
    return !hasBigInt || !onlyJs && isReady() ? wa[bitLength](u8a) : js[bitLength](u8a);
  };
}