"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bnMax = bnMax;
exports.bnMin = bnMin;
exports.find = find;

var _assert = require("../assert.cjs");

var _bn = require("./bn.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
function find(items, cmp) {
  (0, _assert.assert)(items.length >= 1, 'Must provide one or more BN arguments');
  let result = items[0];

  for (let i = 1; i < items.length; i++) {
    result = cmp(result, items[i]);
  }

  return result;
}
/**
 * @name bnMax
 * @summary Finds and returns the highest value in an array of BNs.
 * @example
 * <BR>
 *
 * ```javascript
 * import BN from 'bn.js';
 * import { bnMax } from '@polkadot/util';
 *
 * bnMax([new BN(1), new BN(3), new BN(2)]).toString(); // => '3'
 * ```
 */


function bnMax() {
  for (var _len = arguments.length, items = new Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  return find(items, _bn.BN.max);
}
/**
 * @name bnMin
 * @summary Finds and returns the smallest value in an array of BNs.
 * @example
 * <BR>
 *
 * ```javascript
 * import BN from 'bn.js';
 * import { bnMin } from '@polkadot/util';
 *
 * bnMin([new BN(1), new BN(3), new BN(2)]).toString(); // => '1'
 * ```
 */


function bnMin() {
  for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    items[_key2] = arguments[_key2];
  }

  return find(items, _bn.BN.min);
}