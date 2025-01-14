"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDecode = createDecode;
exports.createEncode = createEncode;
exports.createIs = createIs;
exports.createValidate = createValidate;

var _util = require("@polkadot/util");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function createDecode(_ref, validate) {
  let {
    coder,
    ipfs
  } = _ref;
  return (value, ipfsCompat) => {
    validate(value, ipfsCompat);
    return coder.decode(ipfs && ipfsCompat ? value.substr(1) : value);
  };
}

function createEncode(_ref2) {
  let {
    coder,
    ipfs
  } = _ref2;
  return (value, ipfsCompat) => {
    const out = coder.encode((0, _util.u8aToU8a)(value));
    return ipfs && ipfsCompat ? `${ipfs}${out}` : out;
  };
}

function createIs(validate) {
  return (value, ipfsCompat) => {
    try {
      return validate(value, ipfsCompat);
    } catch (error) {
      return false;
    }
  };
}

function createValidate(_ref3) {
  let {
    chars,
    ipfs,
    type
  } = _ref3;
  return (value, ipfsCompat) => {
    (0, _util.assert)(value && typeof value === 'string', () => `Expected non-null, non-empty ${type} string input`);

    if (ipfs && ipfsCompat) {
      (0, _util.assert)(value[0] === ipfs, () => `Expected ipfs-compatible ${type} to start with '${ipfs}'`);
    }

    for (let i = ipfsCompat ? 1 : 0; i < value.length; i++) {
      (0, _util.assert)(chars.includes(value[i]) || value[i] === '=' && (i === value.length - 1 || !chars.includes(value[i + 1])), () => `Invalid ${type} character "${value[i]}" (0x${value.charCodeAt(i).toString(16)}) at index ${i}`);
    }

    return true;
  };
}