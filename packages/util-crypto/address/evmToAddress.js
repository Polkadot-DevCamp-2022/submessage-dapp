// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, u8aConcat } from '@polkadot/util';
import { hasher } from "../secp256k1/hasher.js";
import { encodeAddress } from "./encode.js";
/**
 * @name evmToAddress
 * @summary Converts an EVM address to its corresponding SS58 address.
 */

export function evmToAddress(evmAddress, ss58Format, hashType = 'blake2') {
  const message = u8aConcat('evm:', evmAddress);
  assert(message.length === 24, () => `Converting ${evmAddress}: Invalid evm address length`);
  return encodeAddress(hasher(hashType, message), ss58Format);
}