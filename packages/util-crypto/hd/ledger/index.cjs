"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hdLedger = hdLedger;

var _util = require("@polkadot/util");

var _index = require("../../ed25519/index.cjs");

var _index2 = require("../../mnemonic/index.cjs");

var _validatePath = require("../validatePath.cjs");

var _derivePrivate = require("./derivePrivate.cjs");

var _master = require("./master.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hdLedger(_mnemonic, path) {
  const words = _mnemonic.split(' ').map(s => s.trim()).filter(s => s);

  (0, _util.assert)([12, 24, 25].includes(words.length), 'Expected a mnemonic with 24 words (or 25 including a password)');
  const [mnemonic, password] = words.length === 25 ? [words.slice(0, 24).join(' '), words[24]] : [words.join(' '), ''];
  (0, _util.assert)((0, _index2.mnemonicValidate)(mnemonic), 'Invalid mnemonic passed to ledger derivation');
  (0, _util.assert)((0, _validatePath.hdValidatePath)(path), 'Invalid derivation path');
  const parts = path.split('/').slice(1);
  let seed = (0, _master.ledgerMaster)(mnemonic, password);

  for (const p of parts) {
    const n = parseInt(p.replace(/'$/, ''), 10);
    seed = (0, _derivePrivate.ledgerDerivePrivate)(seed, n < _validatePath.HARDENED ? n + _validatePath.HARDENED : n);
  }

  return (0, _index.ed25519PairFromSeed)(seed.slice(0, 32));
}