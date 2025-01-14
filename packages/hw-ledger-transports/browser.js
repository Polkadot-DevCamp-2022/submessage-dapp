// Copyright 2017-2021 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0
import LedgerWebHid from '@ledgerhq/hw-transport-webhid';
import LedgerWebUsb from '@ledgerhq/hw-transport-webusb';
export { packageInfo } from "./packageInfo.js";
export const transports = [{
  create: () => LedgerWebUsb.create(),
  type: 'webusb'
}, {
  create: () => LedgerWebHid.create(),
  type: 'hid'
}];