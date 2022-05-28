// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import nacl from 'tweetnacl';
import { assert, u8aToU8a } from '@polkadot/util';
import { naclOpen } from "../nacl/index.js";
import { convertPublicKeyToCurve25519, convertSecretKeyToCurve25519 } from "./convertKey.js";

/**
 * @name ed25519Decrypt
 * @description Returns decrypted message of `encryptedMessage`, using the supplied pair
 */
export function ed25519Decrypt(encryptedMessage, {
  secretKey
}) {
  const decapsulatedEncryptedMessage = ed25519DecapsulateEncryptedMessage(encryptedMessage);
  const x25519PublicKey = convertPublicKeyToCurve25519(decapsulatedEncryptedMessage.ephemeralPublicKey);
  const x25519SecretKey = convertSecretKeyToCurve25519(u8aToU8a(secretKey));
  return naclOpen(decapsulatedEncryptedMessage.sealed, decapsulatedEncryptedMessage.nonce, x25519PublicKey, x25519SecretKey);
}
/**
 * @name ed25519DecapsulateEncryptedMessage
 * @description Split raw encrypted message
 */

function ed25519DecapsulateEncryptedMessage(encryptedMessage) {
  assert(encryptedMessage.length > nacl.box.publicKeyLength + nacl.box.nonceLength + nacl.box.overheadLength, 'Too short encrypted message');
  return {
    ephemeralPublicKey: u8aToU8a(encryptedMessage.slice(nacl.box.nonceLength, nacl.box.nonceLength + nacl.box.publicKeyLength)),
    nonce: u8aToU8a(encryptedMessage.slice(0, nacl.box.nonceLength)),
    sealed: u8aToU8a(encryptedMessage.slice(nacl.box.nonceLength + nacl.box.publicKeyLength))
  };
}