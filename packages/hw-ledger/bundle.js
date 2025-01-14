import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { transports } from '@polkadot/hw-ledger-transports';
import { assert, u8aToBuffer } from '@polkadot/util';
import { LEDGER_DEFAULT_ACCOUNT, LEDGER_DEFAULT_CHANGE, LEDGER_DEFAULT_INDEX, LEDGER_SUCCESS_CODE } from "./constants.js";
import { ledgerApps } from "./defaults.js";
export { packageInfo } from "./packageInfo.js";

var _app = /*#__PURE__*/_classPrivateFieldLooseKey("app");

var _chain = /*#__PURE__*/_classPrivateFieldLooseKey("chain");

var _transport = /*#__PURE__*/_classPrivateFieldLooseKey("transport");

var _getApp = /*#__PURE__*/_classPrivateFieldLooseKey("getApp");

var _withApp = /*#__PURE__*/_classPrivateFieldLooseKey("withApp");

var _wrapError = /*#__PURE__*/_classPrivateFieldLooseKey("wrapError");

// A very basic wrapper for a ledger app -
//  - it connects automatically, creating an app as required
//  - Promises return errors (instead of wrapper errors)
export class Ledger {
  constructor(_transport2, chain) {
    Object.defineProperty(this, _app, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _chain, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _transport, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _getApp, {
      writable: true,
      value: async () => {
        if (!_classPrivateFieldLooseBase(this, _app)[_app]) {
          const def = transports.find(({
            type
          }) => type === _classPrivateFieldLooseBase(this, _transport)[_transport]);
          assert(def, () => `Unable to find a transport for ${_classPrivateFieldLooseBase(this, _transport)[_transport]}`);
          const transport = await def.create();
          _classPrivateFieldLooseBase(this, _app)[_app] = ledgerApps[_classPrivateFieldLooseBase(this, _chain)[_chain]](transport);
        }

        return _classPrivateFieldLooseBase(this, _app)[_app];
      }
    });
    Object.defineProperty(this, _withApp, {
      writable: true,
      value: async fn => {
        try {
          const app = await _classPrivateFieldLooseBase(this, _getApp)[_getApp]();
          return await fn(app);
        } catch (error) {
          _classPrivateFieldLooseBase(this, _app)[_app] = null;
          throw error;
        }
      }
    });
    Object.defineProperty(this, _wrapError, {
      writable: true,
      value: async promise => {
        const result = await promise;
        assert(result.return_code === LEDGER_SUCCESS_CODE, () => result.error_message);
        return result;
      }
    });
    // u2f is deprecated
    assert(['hid', 'webusb'].includes(_transport2), () => `Unsupported transport ${_transport2}`);
    assert(Object.keys(ledgerApps).includes(chain), () => `Unsupported chain ${chain}`);
    _classPrivateFieldLooseBase(this, _chain)[_chain] = chain;
    _classPrivateFieldLooseBase(this, _transport)[_transport] = _transport2;
  }

  async getAddress(confirm = false, accountOffset = 0, addressOffset = 0, {
    account = LEDGER_DEFAULT_ACCOUNT,
    addressIndex = LEDGER_DEFAULT_INDEX,
    change = LEDGER_DEFAULT_CHANGE
  } = {}) {
    return _classPrivateFieldLooseBase(this, _withApp)[_withApp](async app => {
      const {
        address,
        pubKey
      } = await _classPrivateFieldLooseBase(this, _wrapError)[_wrapError](app.getAddress(account + accountOffset, change, addressIndex + addressOffset, confirm));
      return {
        address,
        publicKey: `0x${pubKey}`
      };
    });
  }

  async getVersion() {
    return _classPrivateFieldLooseBase(this, _withApp)[_withApp](async app => {
      const {
        device_locked: isLocked,
        major,
        minor,
        patch,
        test_mode: isTestMode
      } = await _classPrivateFieldLooseBase(this, _wrapError)[_wrapError](app.getVersion());
      return {
        isLocked,
        isTestMode,
        version: [major, minor, patch]
      };
    });
  }

  async sign(message, accountOffset = 0, addressOffset = 0, {
    account = LEDGER_DEFAULT_ACCOUNT,
    addressIndex = LEDGER_DEFAULT_INDEX,
    change = LEDGER_DEFAULT_CHANGE
  } = {}) {
    return _classPrivateFieldLooseBase(this, _withApp)[_withApp](async app => {
      const buffer = u8aToBuffer(message);
      const {
        signature
      } = await _classPrivateFieldLooseBase(this, _wrapError)[_wrapError](app.sign(account + accountOffset, change, addressIndex + addressOffset, buffer));
      return {
        signature: `0x${signature.toString('hex')}`
      };
    });
  }

}