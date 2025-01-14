"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCodec = isCodec;

var _helpers = require("./helpers.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const checkCodec = (0, _helpers.isOnObject)('toHex', 'toU8a');
const checkRegistry = (0, _helpers.isOnObject)('get');

function isCodec(value) {
  return checkCodec(value) && checkRegistry(value.registry);
}