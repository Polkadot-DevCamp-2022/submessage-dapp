"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOn = isOn;
exports.isOnObject = isOnObject;

var _function = require("./function.cjs");

var _object = require("./object.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
function isOn() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return value => ((0, _object.isObject)(value) || (0, _function.isFunction)(value)) && fns.every(f => (0, _function.isFunction)(value[f]));
}

function isOnObject() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return value => (0, _object.isObject)(value) && fns.every(f => (0, _function.isFunction)(value[f]));
}