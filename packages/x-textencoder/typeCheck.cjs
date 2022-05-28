"use strict";

var _browser = require("./browser.cjs");

var _node = require("./node.cjs");

// Copyright 2017-2021 @polkadot/x-textencoder authors & contributors
// SPDX-License-Identifier: Apache-2.0
console.log(new _browser.TextEncoder().encode('abc'));
console.log(new _node.TextEncoder().encode('abc'));