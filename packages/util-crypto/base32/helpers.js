// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, u8aToU8a } from '@polkadot/util'; // re-export the type so *.d.ts files don't have ../src imports

export function createDecode({
  coder,
  ipfs
}, validate) {
  return (value, ipfsCompat) => {
    validate(value, ipfsCompat);
    return coder.decode(ipfs && ipfsCompat ? value.substr(1) : value);
  };
}
export function createEncode({
  coder,
  ipfs
}) {
  return (value, ipfsCompat) => {
    const out = coder.encode(u8aToU8a(value));
    return ipfs && ipfsCompat ? `${ipfs}${out}` : out;
  };
}
export function createIs(validate) {
  return (value, ipfsCompat) => {
    try {
      return validate(value, ipfsCompat);
    } catch (error) {
      return false;
    }
  };
}
export function createValidate({
  chars,
  ipfs,
  type
}) {
  return (value, ipfsCompat) => {
    assert(value && typeof value === 'string', () => `Expected non-null, non-empty ${type} string input`);

    if (ipfs && ipfsCompat) {
      assert(value[0] === ipfs, () => `Expected ipfs-compatible ${type} to start with '${ipfs}'`);
    }

    for (let i = ipfsCompat ? 1 : 0; i < value.length; i++) {
      assert(chars.includes(value[i]) || value[i] === '=' && (i === value.length - 1 || !chars.includes(value[i + 1])), () => `Invalid ${type} character "${value[i]}" (0x${value.charCodeAt(i).toString(16)}) at index ${i}`);
    }

    return true;
  };
}