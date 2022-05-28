"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ledgerApps = void 0;

var _ledgerSubstrate = require("@zondax/ledger-substrate");

// Copyright 2017-2021 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0
// These match up with the keys of the knownLedger object in the @polkadot/networks/defaults.ts
const ledgerApps = {
  bifrost: _ledgerSubstrate.newBifrostApp,
  centrifuge: _ledgerSubstrate.newCentrifugeApp,
  'dock-mainnet': _ledgerSubstrate.newDockApp,
  edgeware: _ledgerSubstrate.newEdgewareApp,
  equilibrium: _ledgerSubstrate.newEquilibriumApp,
  genshiro: _ledgerSubstrate.newGenshiroApp,
  kusama: _ledgerSubstrate.newKusamaApp,
  'nodle-chain': _ledgerSubstrate.newNodleApp,
  polkadot: _ledgerSubstrate.newPolkadotApp,
  polymesh: _ledgerSubstrate.newPolymeshApp,
  sora: _ledgerSubstrate.newSoraApp,
  statemine: _ledgerSubstrate.newStatemineApp
};
exports.ledgerApps = ledgerApps;