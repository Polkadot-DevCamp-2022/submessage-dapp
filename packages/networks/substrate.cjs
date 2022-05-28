"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.knownSubstrate = void 0;
// Copyright 2017-2021 @polkadot/networks authors & contributors
// SPDX-License-Identifier: Apache-2.0
//
// Auto-generated by yarn networks:sync (via scripts/fromSubstrate.mjs)
//
// This file should never be edited manually. Rather the process is as follow -
//
//   - make a PR to the upstream registry found at https://github.com/paritytech/ss58-registry/
//   - ensure the PR gets merged
//   - yarn networks:sync in this repo to sync
//
// Any manual changes to this file will make CI cron checks fail and will be
// lost when the registry is updated alongside the above sync.
//
const knownSubstrate = [{
  decimals: [10],
  displayName: 'Polkadot Relay Chain',
  network: 'polkadot',
  prefix: 0,
  standardAccount: '*25519',
  symbols: ['DOT'],
  website: 'https://polkadot.network'
}, {
  decimals: null,
  displayName: 'Bare 32-bit Schnorr/Ristretto (S/R 25519) public key.',
  network: 'BareSr25519',
  prefix: 1,
  standardAccount: 'Sr25519',
  symbols: null,
  website: null
}, {
  decimals: [12],
  displayName: 'Kusama Relay Chain',
  network: 'kusama',
  prefix: 2,
  standardAccount: '*25519',
  symbols: ['KSM'],
  website: 'https://kusama.network'
}, {
  decimals: null,
  displayName: 'Bare 32-bit Ed25519 public key.',
  network: 'BareEd25519',
  prefix: 3,
  standardAccount: 'Ed25519',
  symbols: null,
  website: null
}, {
  decimals: null,
  displayName: 'Katal Chain',
  network: 'katalchain',
  prefix: 4,
  standardAccount: '*25519',
  symbols: null,
  website: null
}, {
  decimals: [15],
  displayName: 'Plasm Network',
  network: 'plasm',
  prefix: 5,
  standardAccount: '*25519',
  symbols: ['PLM'],
  website: 'https://plasmnet.io'
}, {
  decimals: [12],
  displayName: 'Bifrost',
  network: 'bifrost',
  prefix: 6,
  standardAccount: '*25519',
  symbols: ['BNC'],
  website: 'https://bifrost.finance/'
}, {
  decimals: [18],
  displayName: 'Edgeware',
  network: 'edgeware',
  prefix: 7,
  standardAccount: '*25519',
  symbols: ['EDG'],
  website: 'https://edgewa.re'
}, {
  decimals: [12],
  displayName: 'Karura',
  network: 'karura',
  prefix: 8,
  standardAccount: '*25519',
  symbols: ['KAR'],
  website: 'https://karura.network/'
}, {
  decimals: [18],
  displayName: 'Laminar Reynolds Canary',
  network: 'reynolds',
  prefix: 9,
  standardAccount: '*25519',
  symbols: ['REY'],
  website: 'http://laminar.network/'
}, {
  decimals: [12],
  displayName: 'Acala',
  network: 'acala',
  prefix: 10,
  standardAccount: '*25519',
  symbols: ['ACA'],
  website: 'https://acala.network/'
}, {
  decimals: [18],
  displayName: 'Laminar',
  network: 'laminar',
  prefix: 11,
  standardAccount: '*25519',
  symbols: ['LAMI'],
  website: 'http://laminar.network/'
}, {
  decimals: [6],
  displayName: 'Polymesh',
  network: 'polymesh',
  prefix: 12,
  standardAccount: '*25519',
  symbols: ['POLYX'],
  website: 'https://polymath.network/'
}, {
  decimals: [12],
  displayName: 'Integritee',
  network: 'integritee',
  prefix: 13,
  standardAccount: '*25519',
  symbols: ['TEER'],
  website: 'https://integritee.network'
}, {
  decimals: [0],
  displayName: 'Totem',
  network: 'totem',
  prefix: 14,
  standardAccount: '*25519',
  symbols: ['TOTEM'],
  website: 'https://totemaccounting.com'
}, {
  decimals: [12],
  displayName: 'Synesthesia',
  network: 'synesthesia',
  prefix: 15,
  standardAccount: '*25519',
  symbols: ['SYN'],
  website: 'https://synesthesia.network/'
}, {
  decimals: [12],
  displayName: 'Kulupu',
  network: 'kulupu',
  prefix: 16,
  standardAccount: '*25519',
  symbols: ['KLP'],
  website: 'https://kulupu.network/'
}, {
  decimals: null,
  displayName: 'Dark Mainnet',
  network: 'dark',
  prefix: 17,
  standardAccount: '*25519',
  symbols: null,
  website: null
}, {
  decimals: [9, 9],
  displayName: 'Darwinia Network',
  network: 'darwinia',
  prefix: 18,
  standardAccount: '*25519',
  symbols: ['RING', 'KTON'],
  website: 'https://darwinia.network/'
}, {
  decimals: [12],
  displayName: 'GeekCash',
  network: 'geek',
  prefix: 19,
  standardAccount: '*25519',
  symbols: ['GEEK'],
  website: 'https://geekcash.org'
}, {
  decimals: [12],
  displayName: 'Stafi',
  network: 'stafi',
  prefix: 20,
  standardAccount: '*25519',
  symbols: ['FIS'],
  website: 'https://stafi.io'
}, {
  decimals: [6],
  displayName: 'Dock Testnet',
  network: 'dock-testnet',
  prefix: 21,
  standardAccount: '*25519',
  symbols: ['DCK'],
  website: 'https://dock.io'
}, {
  decimals: [6],
  displayName: 'Dock Mainnet',
  network: 'dock-mainnet',
  prefix: 22,
  standardAccount: '*25519',
  symbols: ['DCK'],
  website: 'https://dock.io'
}, {
  decimals: null,
  displayName: 'ShiftNrg',
  network: 'shift',
  prefix: 23,
  standardAccount: '*25519',
  symbols: null,
  website: null
}, {
  decimals: [18],
  displayName: 'ZERO',
  network: 'zero',
  prefix: 24,
  standardAccount: '*25519',
  symbols: ['PLAY'],
  website: 'https://zero.io'
}, {
  decimals: [18],
  displayName: 'ZERO Alphaville',
  network: 'zero-alphaville',
  prefix: 25,
  standardAccount: '*25519',
  symbols: ['PLAY'],
  website: 'https://zero.io'
}, {
  decimals: [10],
  displayName: 'Jupiter',
  network: 'jupiter',
  prefix: 26,
  standardAccount: '*25519',
  symbols: ['jDOT'],
  website: 'https://jupiter.patract.io'
}, {
  decimals: null,
  displayName: 'Subsocial',
  network: 'subsocial',
  prefix: 28,
  standardAccount: '*25519',
  symbols: null,
  website: null
}, {
  decimals: [12, 12],
  displayName: 'CORD Network',
  network: 'cord',
  prefix: 29,
  standardAccount: '*25519',
  symbols: ['DHI', 'WAY'],
  website: 'https://cord.network/'
}, {
  decimals: [12],
  displayName: 'Phala Network',
  network: 'phala',
  prefix: 30,
  standardAccount: '*25519',
  symbols: ['PHA'],
  website: 'https://phala.network'
}, {
  decimals: [12],
  displayName: 'Litentry Network',
  network: 'litentry',
  prefix: 31,
  standardAccount: '*25519',
  symbols: ['LIT'],
  website: 'https://litentry.com/'
}, {
  decimals: [9],
  displayName: 'Robonomics',
  network: 'robonomics',
  prefix: 32,
  standardAccount: '*25519',
  symbols: ['XRT'],
  website: 'https://robonomics.network'
}, {
  decimals: null,
  displayName: 'DataHighway',
  network: 'datahighway',
  prefix: 33,
  standardAccount: '*25519',
  symbols: null,
  website: null
}, {
  decimals: [12],
  displayName: 'Ares Protocol',
  network: 'ares',
  prefix: 34,
  standardAccount: '*25519',
  symbols: ['ARES'],
  website: 'https://www.aresprotocol.com/'
}, {
  decimals: [15],
  displayName: 'Valiu Liquidity Network',
  network: 'vln',
  prefix: 35,
  standardAccount: '*25519',
  symbols: ['USDv'],
  website: 'https://valiu.com/'
}, {
  decimals: [18],
  displayName: 'Centrifuge Chain',
  network: 'centrifuge',
  prefix: 36,
  standardAccount: '*25519',
  symbols: ['CFG'],
  website: 'https://centrifuge.io/'
}, {
  decimals: [18],
  displayName: 'Nodle Chain',
  network: 'nodle',
  prefix: 37,
  standardAccount: '*25519',
  symbols: ['NODL'],
  website: 'https://nodle.io/'
}, {
  decimals: [18],
  displayName: 'KILT Chain',
  network: 'kilt',
  prefix: 38,
  standardAccount: '*25519',
  symbols: ['KILT'],
  website: 'https://kilt.io/'
}, {
  decimals: [18],
  displayName: 'MathChain mainnet',
  network: 'mathchain',
  prefix: 39,
  standardAccount: '*25519',
  symbols: ['MATH'],
  website: 'https://mathwallet.org'
}, {
  decimals: [18],
  displayName: 'MathChain testnet',
  network: 'mathchain-testnet',
  prefix: 40,
  standardAccount: '*25519',
  symbols: ['MATH'],
  website: 'https://mathwallet.org'
}, {
  decimals: null,
  displayName: 'Polimec Chain',
  network: 'poli',
  prefix: 41,
  standardAccount: '*25519',
  symbols: null,
  website: 'https://polimec.io/'
}, {
  decimals: null,
  displayName: 'Substrate',
  network: 'substrate',
  prefix: 42,
  standardAccount: '*25519',
  symbols: null,
  website: 'https://substrate.io/'
}, {
  decimals: null,
  displayName: 'Bare 32-bit ECDSA SECP-256k1 public key.',
  network: 'BareSecp256k1',
  prefix: 43,
  standardAccount: 'secp256k1',
  symbols: null,
  website: null
}, {
  decimals: [8],
  displayName: 'ChainX',
  network: 'chainx',
  prefix: 44,
  standardAccount: '*25519',
  symbols: ['PCX'],
  website: 'https://chainx.org/'
}, {
  decimals: [12, 12],
  displayName: 'UniArts Network',
  network: 'uniarts',
  prefix: 45,
  standardAccount: '*25519',
  symbols: ['UART', 'UINK'],
  website: 'https://uniarts.me'
}, {
  decimals: null,
  displayName: 'This prefix is reserved.',
  network: 'reserved46',
  prefix: 46,
  standardAccount: null,
  symbols: null,
  website: null
}, {
  decimals: null,
  displayName: 'This prefix is reserved.',
  network: 'reserved47',
  prefix: 47,
  standardAccount: null,
  symbols: null,
  website: null
}, {
  decimals: [12],
  displayName: 'Neatcoin Mainnet',
  network: 'neatcoin',
  prefix: 48,
  standardAccount: '*25519',
  symbols: ['NEAT'],
  website: 'https://neatcoin.org'
}, {
  decimals: [12],
  displayName: 'Picasso',
  network: 'picasso',
  prefix: 49,
  standardAccount: '*25519',
  symbols: ['PICA'],
  website: 'https://picasso.composable.finance'
}, {
  decimals: [12],
  displayName: 'Composable',
  network: 'composable',
  prefix: 50,
  standardAccount: '*25519',
  symbols: ['LAYR'],
  website: 'https://composable.finance'
}, {
  decimals: [9],
  displayName: 'xx network',
  network: 'xxnetwork',
  prefix: 55,
  standardAccount: '*25519',
  symbols: ['XX'],
  website: 'https://xx.network'
}, {
  decimals: [12],
  displayName: 'HydraDX',
  network: 'hydradx',
  prefix: 63,
  standardAccount: '*25519',
  symbols: ['HDX'],
  website: 'https://hydradx.io'
}, {
  decimals: [18],
  displayName: 'AvN Mainnet',
  network: 'aventus',
  prefix: 65,
  standardAccount: '*25519',
  symbols: ['AVT'],
  website: 'https://aventus.io'
}, {
  decimals: [12],
  displayName: 'Crust Network',
  network: 'crust',
  prefix: 66,
  standardAccount: '*25519',
  symbols: ['CRU'],
  website: 'https://crust.network'
}, {
  decimals: [9, 9, 9],
  displayName: 'Genshiro Network',
  network: 'genshiro',
  prefix: 67,
  standardAccount: '*25519',
  symbols: ['GENS', 'EQD', 'LPT0'],
  website: 'https://genshiro.equilibrium.io'
}, {
  decimals: [9],
  displayName: 'Equilibrium Network',
  network: 'equilibrium',
  prefix: 68,
  standardAccount: '*25519',
  symbols: ['EQ'],
  website: 'https://equilibrium.io'
}, {
  decimals: [18],
  displayName: 'SORA Network',
  network: 'sora',
  prefix: 69,
  standardAccount: '*25519',
  symbols: ['XOR'],
  website: 'https://sora.org'
}, {
  decimals: [10],
  displayName: 'Zeitgeist',
  network: 'zeitgeist',
  prefix: 73,
  standardAccount: '*25519',
  symbols: ['ZTG'],
  website: 'https://zeitgeist.pm'
}, {
  decimals: [18],
  displayName: 'Manta network',
  network: 'manta',
  prefix: 77,
  standardAccount: '*25519',
  symbols: ['MANTA'],
  website: 'https://manta.network'
}, {
  decimals: [12],
  displayName: 'Calamari: Manta Canary Network',
  network: 'calamari',
  prefix: 78,
  standardAccount: '*25519',
  symbols: ['KMA'],
  website: 'https://manta.network'
}, {
  decimals: [12],
  displayName: 'Polkadex Mainnet',
  network: 'polkadex',
  prefix: 88,
  standardAccount: '*25519',
  symbols: ['PDEX'],
  website: 'https://polkadex.trade'
}, {
  decimals: [18],
  displayName: 'PolkaSmith Canary Network',
  network: 'polkasmith',
  prefix: 98,
  standardAccount: '*25519',
  symbols: ['PKS'],
  website: 'https://polkafoundry.com'
}, {
  decimals: [18],
  displayName: 'PolkaFoundry Network',
  network: 'polkafoundry',
  prefix: 99,
  standardAccount: '*25519',
  symbols: ['PKF'],
  website: 'https://polkafoundry.com'
}, {
  decimals: [18],
  displayName: 'OriginTrail Parachain',
  network: 'origintrail-parachain',
  prefix: 101,
  standardAccount: 'secp256k1',
  symbols: ['TRAC'],
  website: 'https://origintrail.io'
}, {
  decimals: [10],
  displayName: 'Pontem Network',
  network: 'pontem-network',
  prefix: 105,
  standardAccount: '*25519',
  symbols: ['PONT'],
  website: 'https://pontem.network'
}, {
  decimals: [12],
  displayName: 'Heiko',
  network: 'heiko',
  prefix: 110,
  standardAccount: '*25519',
  symbols: ['HKO'],
  website: 'https://parallel.fi/'
}, {
  decimals: null,
  displayName: 'Integritee Incognito',
  network: 'integritee-incognito',
  prefix: 113,
  standardAccount: '*25519',
  symbols: null,
  website: 'https://integritee.network'
}, {
  decimals: [18],
  displayName: 'Clover Finance',
  network: 'clover',
  prefix: 128,
  standardAccount: '*25519',
  symbols: ['CLV'],
  website: 'https://clover.finance'
}, {
  decimals: [18],
  displayName: 'Altair',
  network: 'altair',
  prefix: 136,
  standardAccount: '*25519',
  symbols: ['AIR'],
  website: 'https://centrifuge.io/'
}, {
  decimals: [12],
  displayName: 'Parallel',
  network: 'parallel',
  prefix: 172,
  standardAccount: '*25519',
  symbols: ['PARA'],
  website: 'https://parallel.fi/'
}, {
  decimals: [18],
  displayName: 'Social Network',
  network: 'social-network',
  prefix: 252,
  standardAccount: '*25519',
  symbols: ['NET'],
  website: 'https://social.network'
}, {
  decimals: [15],
  displayName: 'QUARTZ by UNIQUE',
  network: 'quartz_mainnet',
  prefix: 255,
  standardAccount: '*25519',
  symbols: ['QTZ'],
  website: 'https://unique.network'
}, {
  decimals: [18],
  displayName: 'Pioneer Network by Bit.Country',
  network: 'pioneer_network',
  prefix: 268,
  standardAccount: '*25519',
  symbols: ['NEER'],
  website: 'https://bit.country'
}, {
  decimals: [18],
  displayName: 'Efinity',
  network: 'efinity',
  prefix: 1110,
  standardAccount: 'Sr25519',
  symbols: ['EFI'],
  website: 'https://efinity.io/'
}, {
  decimals: [18],
  displayName: 'Moonbeam',
  network: 'moonbeam',
  prefix: 1284,
  standardAccount: 'secp256k1',
  symbols: ['GLMR'],
  website: 'https://moonbeam.network'
}, {
  decimals: [18],
  displayName: 'Moonriver',
  network: 'moonriver',
  prefix: 1285,
  standardAccount: 'secp256k1',
  symbols: ['MOVR'],
  website: 'https://moonbeam.network'
}, {
  decimals: [12],
  displayName: 'Kapex',
  network: 'kapex',
  prefix: 2007,
  standardAccount: '*25519',
  symbols: ['KAPEX'],
  website: 'https://totemaccounting.com'
}, {
  decimals: [10],
  displayName: 'Interlay',
  network: 'interlay',
  prefix: 2032,
  standardAccount: '*25519',
  symbols: ['INTR'],
  website: 'https://interlay.io/'
}, {
  decimals: [12],
  displayName: 'Kintsugi',
  network: 'kintsugi',
  prefix: 2092,
  standardAccount: '*25519',
  symbols: ['KINT'],
  website: 'https://interlay.io/'
}, {
  decimals: [18],
  displayName: 'Subspace testnet',
  network: 'subspace_testnet',
  prefix: 2254,
  standardAccount: '*25519',
  symbols: ['tSSC'],
  website: 'https://subspace.network'
}, {
  decimals: [18],
  displayName: 'Subspace',
  network: 'subspace',
  prefix: 6094,
  standardAccount: '*25519',
  symbols: ['SSC'],
  website: 'https://subspace.network'
}, {
  decimals: [12],
  displayName: 'Basilisk',
  network: 'basilisk',
  prefix: 10041,
  standardAccount: '*25519',
  symbols: ['BSX'],
  website: 'https://bsx.fi'
}, {
  decimals: [12],
  displayName: 'CESS Testnet',
  network: 'cess-testnet',
  prefix: 11330,
  standardAccount: '*25519',
  symbols: ['TCESS'],
  website: 'https://cess.cloud'
}, {
  decimals: [12],
  displayName: 'CESS',
  network: 'cess',
  prefix: 11331,
  standardAccount: '*25519',
  symbols: ['CESS'],
  website: 'https://cess.cloud'
}, {
  decimals: [18],
  displayName: 'Automata ContextFree',
  network: 'contextfree',
  prefix: 11820,
  standardAccount: '*25519',
  symbols: ['CTX'],
  website: 'https://ata.network'
}];
exports.knownSubstrate = knownSubstrate;