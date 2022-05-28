import type { HexString } from '@polkadot/util/types';
import type { Keypair } from '../types';
/**
 * @name ed25519Decrypt
 * @description Returns decrypted message of `encryptedMessage`, using the supplied pair
 */
export declare function ed25519Decrypt(encryptedMessage: HexString | Uint8Array | string, { secretKey }: Partial<Keypair>): Uint8Array | null;
