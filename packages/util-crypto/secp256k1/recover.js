// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { recoverPublicKey, Signature } from '@noble/secp256k1';
import { assert, hasBigInt, u8aToU8a } from '@polkadot/util';
import { isReady, secp256k1Recover as wasm } from '@polkadot/wasm-crypto';
import { secp256k1Compress } from "./compress.js";
import { secp256k1Expand } from "./expand.js";
/**
 * @name secp256k1Recover
 * @description Recovers a publicKey from the supplied signature
 */

export function secp256k1Recover(msgHash, signature, recovery, hashType = 'blake2', onlyJs) {
  const sig = u8aToU8a(signature).subarray(0, 64);
  const msg = u8aToU8a(msgHash);
  const publicKey = !hasBigInt || !onlyJs && isReady() ? wasm(msg, sig, recovery) : recoverPublicKey(msg, Signature.fromCompact(sig).toRawBytes(), recovery);
  assert(publicKey, 'Unable to recover publicKey from signature');
  return hashType === 'keccak' ? secp256k1Expand(publicKey, onlyJs) : secp256k1Compress(publicKey, onlyJs);
}