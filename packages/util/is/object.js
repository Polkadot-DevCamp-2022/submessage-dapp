// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name isObject
 * @summary Tests for an `object`.
 * @description
 * Checks to see if the input value is a JavaScript object.
 * @example
 * <BR>
 *
 * ```javascript
 * import { isObject } from '@polkadot/util';
 *
 * isObject({}); // => true
 * isObject('something'); // => false
 * ```
 */
export function isObject(value) {
  return !!value && typeof value === 'object';
}