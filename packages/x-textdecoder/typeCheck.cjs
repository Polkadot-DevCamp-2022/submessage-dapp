"use strict";

var _browser = require("./browser.cjs");

var _node = require("./node.cjs");

// Copyright 2017-2021 @polkadot/x-textdecoder authors & contributors
// SPDX-License-Identifier: Apache-2.0
console.log(new _browser.TextDecoder('utf-8').decode(new Uint8Array([1, 2, 3])));
console.log(new _node.TextDecoder('utf-8').decode(new Uint8Array([1, 2, 3])));