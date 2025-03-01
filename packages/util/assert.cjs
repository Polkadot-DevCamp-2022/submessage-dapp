"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;
exports.assertReturn = assertReturn;
exports.assertUnreachable = assertUnreachable;

var _function = require("./is/function.cjs");

var _null = require("./is/null.cjs");

var _undefined = require("./is/undefined.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name assert
 * @summary Checks for a valid test, if not Error is thrown.
 * @description
 * Checks that `test` is a truthy value. If value is falsy (`null`, `undefined`, `false`, ...), it throws an Error with the supplied `message`. When `test` passes, `true` is returned.
 * @example
 * <BR>
 *
 * ```javascript
 * const { assert } from '@polkadot/util';
 *
 * assert(true, 'True should be true'); // passes
 * assert(false, 'False should not be true'); // Error thrown
 * assert(false, () => 'message'); // Error with 'message'
 * ```
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error((0, _function.isFunction)(message) ? message() : message);
  }
}
/**
 * @name assertReturn
 * @description Returns when the value is not undefined/null, otherwise throws assertion error
 */


function assertReturn(value, message) {
  assert(!(0, _undefined.isUndefined)(value) && !(0, _null.isNull)(value), message);
  return value;
}
/**
 * @name assertUnreachable
 * @description An assertion helper that ensures all codepaths are followed
 */


function assertUnreachable(x) {
  throw new Error(`This codepath should be unreachable. Unhandled input: ${x}`);
}