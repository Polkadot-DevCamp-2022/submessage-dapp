"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deriveAddress = deriveAddress;

var _util = require("@polkadot/util");

var _index = require("../key/index.cjs");

var _index2 = require("../sr25519/index.cjs");

var _decode = require("./decode.cjs");

var _encode = require("./encode.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function filterHard(_ref) {
  let {
    isHard
  } = _ref;
  return isHard;
}
/**
 * @name deriveAddress
 * @summary Creates a sr25519 derived address from the supplied and path.
 * @description
 * Creates a sr25519 derived address based on the input address/publicKey and the uri supplied.
 */


function deriveAddress(who, suri, ss58Format) {
  const {
    path
  } = (0, _index.keyExtractPath)(suri);
  (0, _util.assert)(path.length && !path.every(filterHard), 'Expected suri to contain a combination of non-hard paths');
  let publicKey = (0, _decode.decodeAddress)(who);

  for (const {
    chainCode
  } of path) {
    publicKey = (0, _index2.sr25519DerivePublic)(publicKey, chainCode);
  }

  return (0, _encode.encodeAddress)(publicKey, ss58Format);
}