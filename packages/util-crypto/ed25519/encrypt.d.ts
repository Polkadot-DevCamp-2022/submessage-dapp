import type { HexString } from '@polkadot/util/types';
import { Keypair } from '../types';
/**
 * @name ed25519Encrypt
 * @description Returns encrypted message of `message`, using the supplied pair
 */
export declare function ed25519Encrypt(message: HexString | Uint8Array | string, receiverPublicKey: Uint8Array, senderKeyPair?: Keypair): Uint8Array;
