import type { HexString } from '@polkadot/util/types';
import type { Keypair, KeypairType } from '../types';
/**
 * @name encrypt
 * @summary Encrypt a message using the given publickey
 * @description Returns the encrypted message of the given message using the public key.
 * The encrypted message can be decrypted by the corresponding keypair using keypair.decrypt() method
 */
export declare function encrypt(message: HexString | string | Uint8Array, recipientPublicKey: HexString | string | Uint8Array, recipientKeyType: KeypairType, senderKeyPair?: Keypair): Uint8Array;
