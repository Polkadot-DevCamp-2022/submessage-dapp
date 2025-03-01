"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nMax = nMax;
exports.nMin = nMin;

var _assert = require("../assert.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
function gt(a, b) {
  return a > b;
}

function lt(a, b) {
  return a < b;
}

function find(items, cmp) {
  (0, _assert.assert)(items.length >= 1, 'Must provide one or more bigint arguments');
  let result = items[0];

  for (let i = 1; i < items.length; i++) {
    if (cmp(items[i], result)) {
      result = items[i];
    }
  }

  return result;
}
/**
 * @name nMax
 * @summary Finds and returns the highest value in an array of bigint.
 */


function nMax() {
  for (var _len = arguments.length, items = new Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  return find(items, gt);
}
/**
 * @name nMin
 * @summary Finds and returns the lowest value in an array of bigint.
 */


function nMin() {
  for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    items[_key2] = arguments[_key2];
  }

  return find(items, lt);
}