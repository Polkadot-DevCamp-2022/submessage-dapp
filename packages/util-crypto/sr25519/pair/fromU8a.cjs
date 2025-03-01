"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sr25519PairFromU8a = sr25519PairFromU8a;

var _util = require("@polkadot/util");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const SEC_LEN = 64;
const PUB_LEN = 32;
const TOT_LEN = SEC_LEN + PUB_LEN;

function sr25519PairFromU8a(full) {
  const fullU8a = (0, _util.u8aToU8a)(full);
  (0, _util.assert)(fullU8a.length === TOT_LEN, () => `Expected keypair with ${TOT_LEN} bytes, found ${fullU8a.length}`);
  return {
    publicKey: fullU8a.slice(SEC_LEN, TOT_LEN),
    secretKey: fullU8a.slice(0, SEC_LEN)
  };
}