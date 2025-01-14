// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import '@polkadot/x-bigint/shim';
import { utils as utilsNobleSecp256k1 } from '@noble/secp256k1';
import { u8aConcat } from '@polkadot/util';
import { cryptoWaitReady } from "./crypto.js";
import { hmacSha256AsU8a } from "./hmac/index.js"; // Set overrides on the secp256k1 utils
//   - hmacShaSync - This needs to be set, unset by default

utilsNobleSecp256k1.hmacSha256Sync = (key, ...messages) => hmacSha256AsU8a(key, u8aConcat(...messages)); // start init process immediately


cryptoWaitReady().catch(() => {// shouldn't happen, logged above
});