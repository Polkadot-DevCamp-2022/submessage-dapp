// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { u8aConcat, u8aToU8a } from '@polkadot/util';
import { naclSeal } from "../nacl/seal.js";
import { ed25519PairFromRandom } from "./pair/fromRandom.js";
import { convertPublicKeyToCurve25519, convertSecretKeyToCurve25519 } from "./convertKey.js";
/**
 * @name ed25519Encrypt
 * @description Returns encrypted message of `message`, using the supplied pair
 */

export function ed25519Encrypt(message, receiverPublicKey, senderKeyPair) {
  const messageKeyPair = senderKeyPair || ed25519PairFromRandom();
  const x25519PublicKey = convertPublicKeyToCurve25519(receiverPublicKey);
  const x25519SecretKey = convertSecretKeyToCurve25519(messageKeyPair.secretKey);
  const {
    nonce,
    sealed
  } = naclSeal(u8aToU8a(message), x25519SecretKey, x25519PublicKey);
  return u8aConcat(nonce, messageKeyPair.publicKey, sealed);
}