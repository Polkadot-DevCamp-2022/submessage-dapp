"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObservable = void 0;

var _helpers = require("./helpers.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name isBObservable
 * @summary Tests for a `Observable` object instance.
 * @description
 * Checks to see if the input object is an instance of `BN` (bn.js).
 * @example
 * <BR>
 *
 * ```javascript
 * import { isObservable } from '@polkadot/util';
 *
 * console.log('isObservable', isObservable(...));
 * ```
 */
const isObservable = (0, _helpers.isOn)('next');
exports.isObservable = isObservable;