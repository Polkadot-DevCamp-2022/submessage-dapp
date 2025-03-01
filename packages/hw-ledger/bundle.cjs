"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ledger = void 0;
Object.defineProperty(exports, "packageInfo", {
  enumerable: true,
  get: function () {
    return _packageInfo.packageInfo;
  }
});

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _hwLedgerTransports = require("@polkadot/hw-ledger-transports");

var _util = require("@polkadot/util");

var _constants = require("./constants.cjs");

var _defaults = require("./defaults.cjs");

var _packageInfo = require("./packageInfo.cjs");

// Copyright 2017-2021 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0
var _app = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("app");

var _chain = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("chain");

var _transport = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("transport");

var _getApp = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("getApp");

var _withApp = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("withApp");

var _wrapError = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("wrapError");

// A very basic wrapper for a ledger app -
//  - it connects automatically, creating an app as required
//  - Promises return errors (instead of wrapper errors)
class Ledger {
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
        if (!(0, _classPrivateFieldLooseBase2.default)(this, _app)[_app]) {
          const def = _hwLedgerTransports.transports.find(_ref => {
            let {
              type
            } = _ref;
            return type === (0, _classPrivateFieldLooseBase2.default)(this, _transport)[_transport];
          });

          (0, _util.assert)(def, () => `Unable to find a transport for ${(0, _classPrivateFieldLooseBase2.default)(this, _transport)[_transport]}`);
          const transport = await def.create();
          (0, _classPrivateFieldLooseBase2.default)(this, _app)[_app] = _defaults.ledgerApps[(0, _classPrivateFieldLooseBase2.default)(this, _chain)[_chain]](transport);
        }

        return (0, _classPrivateFieldLooseBase2.default)(this, _app)[_app];
      }
    });
    Object.defineProperty(this, _withApp, {
      writable: true,
      value: async fn => {
        try {
          const app = await (0, _classPrivateFieldLooseBase2.default)(this, _getApp)[_getApp]();
          return await fn(app);
        } catch (error) {
          (0, _classPrivateFieldLooseBase2.default)(this, _app)[_app] = null;
          throw error;
        }
      }
    });
    Object.defineProperty(this, _wrapError, {
      writable: true,
      value: async promise => {
        const result = await promise;
        (0, _util.assert)(result.return_code === _constants.LEDGER_SUCCESS_CODE, () => result.error_message);
        return result;
      }
    });
    // u2f is deprecated
    (0, _util.assert)(['hid', 'webusb'].includes(_transport2), () => `Unsupported transport ${_transport2}`);
    (0, _util.assert)(Object.keys(_defaults.ledgerApps).includes(chain), () => `Unsupported chain ${chain}`);
    (0, _classPrivateFieldLooseBase2.default)(this, _chain)[_chain] = chain;
    (0, _classPrivateFieldLooseBase2.default)(this, _transport)[_transport] = _transport2;
  }

  async getAddress() {
    let confirm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let accountOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let addressOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    let {
      account = _constants.LEDGER_DEFAULT_ACCOUNT,
      addressIndex = _constants.LEDGER_DEFAULT_INDEX,
      change = _constants.LEDGER_DEFAULT_CHANGE
    } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    return (0, _classPrivateFieldLooseBase2.default)(this, _withApp)[_withApp](async app => {
      const {
        address,
        pubKey
      } = await (0, _classPrivateFieldLooseBase2.default)(this, _wrapError)[_wrapError](app.getAddress(account + accountOffset, change, addressIndex + addressOffset, confirm));
      return {
        address,
        publicKey: `0x${pubKey}`
      };
    });
  }

  async getVersion() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _withApp)[_withApp](async app => {
      const {
        device_locked: isLocked,
        major,
        minor,
        patch,
        test_mode: isTestMode
      } = await (0, _classPrivateFieldLooseBase2.default)(this, _wrapError)[_wrapError](app.getVersion());
      return {
        isLocked,
        isTestMode,
        version: [major, minor, patch]
      };
    });
  }

  async sign(message) {
    let accountOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let addressOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    let {
      account = _constants.LEDGER_DEFAULT_ACCOUNT,
      addressIndex = _constants.LEDGER_DEFAULT_INDEX,
      change = _constants.LEDGER_DEFAULT_CHANGE
    } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    return (0, _classPrivateFieldLooseBase2.default)(this, _withApp)[_withApp](async app => {
      const buffer = (0, _util.u8aToBuffer)(message);
      const {
        signature
      } = await (0, _classPrivateFieldLooseBase2.default)(this, _wrapError)[_wrapError](app.sign(account + accountOffset, change, addressIndex + addressOffset, buffer));
      return {
        signature: `0x${signature.toString('hex')}`
      };
    });
  }

}

exports.Ledger = Ledger;