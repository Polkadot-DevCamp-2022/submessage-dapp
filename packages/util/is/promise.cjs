"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPromise = void 0;

var _helpers = require("./helpers.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const isPromise = (0, _helpers.isOnObject)('catch', 'then');
exports.isPromise = isPromise;