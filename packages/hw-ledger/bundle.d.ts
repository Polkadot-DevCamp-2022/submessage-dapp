import type { AccountOptions, LedgerAddress, LedgerSignature, LedgerTypes, LedgerVersion } from './types';
import { ledgerApps } from './defaults';
export { packageInfo } from './packageInfo';
declare type Chain = keyof typeof ledgerApps;
export declare class Ledger {
    #private;
    constructor(transport: LedgerTypes, chain: Chain);
    getAddress(confirm?: boolean, accountOffset?: number, addressOffset?: number, { account, addressIndex, change }?: Partial<AccountOptions>): Promise<LedgerAddress>;
    getVersion(): Promise<LedgerVersion>;
    sign(message: Uint8Array, accountOffset?: number, addressOffset?: number, { account, addressIndex, change }?: Partial<AccountOptions>): Promise<LedgerSignature>;
}
