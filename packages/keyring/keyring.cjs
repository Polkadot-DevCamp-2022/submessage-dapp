"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Keyring = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _util = require("@polkadot/util");

var _utilCrypto = require("@polkadot/util-crypto");

var _defaults = require("./defaults.cjs");

var _index = require("./pair/index.cjs");

var _pairs2 = require("./pairs.cjs");

// Copyright 2017-2021 @polkadot/keyring authors & contributors
// SPDX-License-Identifier: Apache-2.0
const PairFromSeed = {
  ecdsa: seed => (0, _utilCrypto.secp256k1PairFromSeed)(seed),
  ed25519: seed => (0, _utilCrypto.ed25519PairFromSeed)(seed),
  ethereum: seed => (0, _utilCrypto.secp256k1PairFromSeed)(seed),
  sr25519: seed => (0, _utilCrypto.sr25519PairFromSeed)(seed)
};

function pairToPublic(_ref) {
  let {
    publicKey
  } = _ref;
  return publicKey;
}
/**
 * # @polkadot/keyring
 *
 * ## Overview
 *
 * @name Keyring
 * @summary Keyring management of user accounts
 * @description Allows generation of keyring pairs from a variety of input combinations, such as
 * json object containing account address or public key, account metadata, and account encoded using
 * `addFromJson`, or by providing those values as arguments separately to `addFromAddress`,
 * or by providing the mnemonic (seed phrase) and account metadata as arguments to `addFromMnemonic`.
 * Stores the keyring pairs in a keyring pair dictionary. Removal of the keyring pairs from the keyring pair
 * dictionary is achieved using `removePair`. Retrieval of all the stored pairs via `getPairs` or perform
 * lookup of a pair for a given account address or public key using `getPair`. JSON metadata associated with
 * an account may be obtained using `toJson` accompanied by the account passphrase.
 */


var _pairs = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("pairs");

var _type = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("type");

var _ss = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("ss58");

class Keyring {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    Object.defineProperty(this, _pairs, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _type, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _ss, {
      writable: true,
      value: void 0
    });
    this.decodeAddress = _utilCrypto.decodeAddress;

    this.encodeAddress = (address, ss58Format) => {
      return this.type === 'ethereum' ? (0, _utilCrypto.ethereumEncode)(address) : (0, _utilCrypto.encodeAddress)(address, (0, _util.isUndefined)(ss58Format) ? (0, _classPrivateFieldLooseBase2.default)(this, _ss)[_ss] : ss58Format);
    };

    options.type = options.type || 'ed25519';
    (0, _util.assert)(['ecdsa', 'ethereum', 'ed25519', 'sr25519'].includes(options.type || 'undefined'), () => `Expected a keyring type of either 'ed25519', 'sr25519', 'ethereum' or 'ecdsa', found '${options.type || 'unknown'}`);
    (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs] = new _pairs2.Pairs();
    (0, _classPrivateFieldLooseBase2.default)(this, _ss)[_ss] = options.ss58Format;
    (0, _classPrivateFieldLooseBase2.default)(this, _type)[_type] = options.type;
  }
  /**
   * @description retrieve the pairs (alias for getPairs)
   */


  get pairs() {
    return this.getPairs();
  }
  /**
   * @description retrieve the publicKeys (alias for getPublicKeys)
   */


  get publicKeys() {
    return this.getPublicKeys();
  }
  /**
   * @description Returns the type of the keyring, ed25519, sr25519 or ecdsa
   */


  get type() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _type)[_type];
  }
  /**
   * @name addPair
   * @summary Stores an account, given a keyring pair, as a Key/Value (public key, pair) in Keyring Pair Dictionary
   */


  addPair(pair) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].add(pair);
  }
  /**
   * @name addFromAddress
   * @summary Stores an account, given an account address, as a Key/Value (public key, pair) in Keyring Pair Dictionary
   * @description Allows user to explicitly provide separate inputs including account address or public key, and optionally
   * the associated account metadata, and the default encoded value as arguments (that may be obtained from the json file
   * of an account backup), and then generates a keyring pair from them that it passes to
   * `addPair` to stores in a keyring pair dictionary the public key of the generated pair as a key and the pair as the associated value.
   */


  addFromAddress(address) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let encoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.type;
    let ignoreChecksum = arguments.length > 4 ? arguments[4] : undefined;
    let encType = arguments.length > 5 ? arguments[5] : undefined;
    const publicKey = this.decodeAddress(address, ignoreChecksum);
    return this.addPair((0, _index.createPair)({
      toSS58: this.encodeAddress,
      type
    }, {
      publicKey,
      secretKey: new Uint8Array()
    }, meta, encoded, encType));
  }
  /**
   * @name addFromJson
   * @summary Stores an account, given JSON data, as a Key/Value (public key, pair) in Keyring Pair Dictionary
   * @description Allows user to provide a json object argument that contains account information (that may be obtained from the json file
   * of an account backup), and then generates a keyring pair from it that it passes to
   * `addPair` to stores in a keyring pair dictionary the public key of the generated pair as a key and the pair as the associated value.
   */


  addFromJson(json, ignoreChecksum) {
    return this.addPair(this.createFromJson(json, ignoreChecksum));
  }
  /**
   * @name addFromMnemonic
   * @summary Stores an account, given a mnemonic, as a Key/Value (public key, pair) in Keyring Pair Dictionary
   * @description Allows user to provide a mnemonic (seed phrase that is provided when account is originally created)
   * argument and a metadata argument that contains account information (that may be obtained from the json file
   * of an account backup), and then generates a keyring pair from it that it passes to
   * `addPair` to stores in a keyring pair dictionary the public key of the generated pair as a key and the pair as the associated value.
   */


  addFromMnemonic(mnemonic) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    return this.addFromUri(mnemonic, meta, type);
  }
  /**
   * @name addFromPair
   * @summary Stores an account created from an explicit publicKey/secreteKey combination
   */


  addFromPair(pair) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    return this.addPair(this.createFromPair(pair, meta, type));
  }
  /**
   * @name addFromSeed
   * @summary Stores an account, given seed data, as a Key/Value (public key, pair) in Keyring Pair Dictionary
   * @description Stores in a keyring pair dictionary the public key of the pair as a key and the pair as the associated value.
   * Allows user to provide the account seed as an argument, and then generates a keyring pair from it that it passes to
   * `addPair` to store in a keyring pair dictionary the public key of the generated pair as a key and the pair as the associated value.
   */


  addFromSeed(seed) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    return this.addPair((0, _index.createPair)({
      toSS58: this.encodeAddress,
      type
    }, PairFromSeed[type](seed), meta, null));
  }
  /**
   * @name addFromUri
   * @summary Creates an account via an suri
   * @description Extracts the phrase, path and password from a SURI format for specifying secret keys `<secret>/<soft-key>//<hard-key>///<password>` (the `///password` may be omitted, and `/<soft-key>` and `//<hard-key>` maybe repeated and mixed). The secret can be a hex string, mnemonic phrase or a string (to be padded)
   */


  addFromUri(suri) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    return this.addPair(this.createFromUri(suri, meta, type));
  }
  /**
   * @name createFromJson
   * @description Creates a pair from a JSON keyfile
   */


  createFromJson(_ref2, ignoreChecksum) {
    let {
      address,
      encoded,
      encoding: {
        content,
        type,
        version
      },
      meta
    } = _ref2;
    (0, _util.assert)(version !== '3' || content[0] === 'pkcs8', () => `Unable to decode non-pkcs8 type, [${content.join(',')}] found}`);
    const cryptoType = version === '0' || !Array.isArray(content) ? this.type : content[1];
    const encType = !Array.isArray(type) ? [type] : type;
    (0, _util.assert)(['ed25519', 'sr25519', 'ecdsa', 'ethereum'].includes(cryptoType), () => `Unknown crypto type ${cryptoType}`); // Here the address and publicKey are 32 bytes and isomorphic. This is why the address field needs to be the public key for ethereum type pairs

    const publicKey = (0, _util.isHex)(address) ? (0, _util.hexToU8a)(address) : this.decodeAddress(address, ignoreChecksum);
    const decoded = (0, _util.isHex)(encoded) ? (0, _util.hexToU8a)(encoded) : (0, _utilCrypto.base64Decode)(encoded);
    return (0, _index.createPair)({
      toSS58: this.encodeAddress,
      type: cryptoType
    }, {
      publicKey,
      secretKey: new Uint8Array()
    }, meta, decoded, encType);
  }
  /**
   * @name createFromPair
   * @summary Creates a pair from an explicit publicKey/secreteKey combination
   */


  createFromPair(pair) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    return (0, _index.createPair)({
      toSS58: this.encodeAddress,
      type
    }, pair, meta, null);
  }
  /**
   * @name createFromUri
   * @summary Creates a Keypair from an suri
   * @description This creates a pair from the suri, but does not add it to the keyring
   */


  createFromUri(_suri) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.type;
    // here we only aut-add the dev phrase if we have a hard-derived path
    const suri = _suri.startsWith('//') ? `${_defaults.DEV_PHRASE}${_suri}` : _suri;
    const {
      derivePath,
      password,
      path,
      phrase
    } = (0, _utilCrypto.keyExtractSuri)(suri);
    let seed;
    const isPhraseHex = (0, _util.isHex)(phrase, 256);

    if (isPhraseHex) {
      seed = (0, _util.hexToU8a)(phrase);
    } else {
      const parts = phrase.split(' ');

      if ([12, 15, 18, 21, 24].includes(parts.length)) {
        seed = type === 'ethereum' ? (0, _utilCrypto.mnemonicToLegacySeed)(phrase, '', false, 64) : (0, _utilCrypto.mnemonicToMiniSecret)(phrase, password);
      } else {
        (0, _util.assert)(phrase.length <= 32, 'specified phrase is not a valid mnemonic and is invalid as a raw seed at > 32 bytes');
        seed = (0, _util.stringToU8a)(phrase.padEnd(32));
      }
    }

    const derived = type === 'ethereum' ? isPhraseHex ? PairFromSeed[type](seed) // for eth, if the private key is provided as suri, it must be derived only once
    : (0, _utilCrypto.hdEthereum)(seed, derivePath.substring(1)) : (0, _utilCrypto.keyFromPath)(PairFromSeed[type](seed), path, type);
    return (0, _index.createPair)({
      toSS58: this.encodeAddress,
      type
    }, derived, meta, null);
  }
  /**
   * @name encodeAddress
   * @description Encodes the input into an ss58 representation
   */


  /**
   * @name getPair
   * @summary Retrieves an account keyring pair from the Keyring Pair Dictionary, given an account address
   * @description Returns a keyring pair value from the keyring pair dictionary by performing
   * a key lookup using the provided account address or public key (after decoding it).
   */
  getPair(address) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].get(address);
  }
  /**
   * @name getPairs
   * @summary Retrieves all account keyring pairs from the Keyring Pair Dictionary
   * @description Returns an array list of all the keyring pair values that are stored in the keyring pair dictionary.
   */


  getPairs() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].all();
  }
  /**
   * @name getPublicKeys
   * @summary Retrieves Public Keys of all Keyring Pairs stored in the Keyring Pair Dictionary
   * @description Returns an array list of all the public keys associated with each of the keyring pair values that are stored in the keyring pair dictionary.
   */


  getPublicKeys() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].all().map(pairToPublic);
  }
  /**
   * @name removePair
   * @description Deletes the provided input address or public key from the stored Keyring Pair Dictionary.
   */


  removePair(address) {
    (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].remove(address);
  }
  /**
   * @name setSS58Format;
   * @description Sets the ss58 format for the keyring
   */


  setSS58Format(ss58) {
    (0, _classPrivateFieldLooseBase2.default)(this, _ss)[_ss] = ss58;
  }
  /**
   * @name toJson
   * @summary Returns a JSON object associated with the input argument that contains metadata assocated with an account
   * @description Returns a JSON object containing the metadata associated with an account
   * when valid address or public key and when the account passphrase is provided if the account secret
   * is not already unlocked and available in memory. Note that in [Polkadot-JS Apps](https://github.com/polkadot-js/apps) the user
   * may backup their account to a JSON file that contains this information.
   */


  toJson(address, passphrase) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _pairs)[_pairs].get(address).toJson(passphrase);
  }
  /**
   * @name encrypt
   * @summary Encrypt a message using the given publickey
   * @description Returns the encrypted message of the given message using the public key.
   * The encrypted message can be decrypted by the corresponding keypair using keypair.decrypt() method
   */


  encrypt(message, recipientPublicKey, recipientKeyType) {
    return (0, _utilCrypto.encrypt)(message, recipientPublicKey, recipientKeyType || this.type);
  }

}

exports.Keyring = Keyring;