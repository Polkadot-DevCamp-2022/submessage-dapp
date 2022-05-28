import type { HexString } from '@polkadot/util/types';
import { Keypair } from '../types';
export declare const keyDerivationSaltSize = 32;
export declare const nonceSize = 24;
/**
 * @name sr25519Encrypt
 * @description Returns encrypted message of `message`, using the supplied pair
 */
export declare function sr25519Encrypt(message: HexString | Uint8Array | string, receiverPublicKey: Uint8Array, senderKeyPair?: Keypair): Uint8Array;
export declare function buildSR25519EncryptionKey(publicKey: Uint8Array, secretKey: Uint8Array, encryptedMessagePairPublicKey: Uint8Array, salt?: Uint8Array): {
    encryptionKey: Uint8Array;
    keyDerivationSalt: Uint8Array;
    macKey: Uint8Array;
};
export declare function macData(nonce: Uint8Array, encryptedMessage: Uint8Array, encryptedMessagePairPublicKey: Uint8Array, macKey: Uint8Array): Uint8Array;
