"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatBalance = void 0;

var _toBn = require("../bn/toBn.cjs");

var _boolean = require("../is/boolean.cjs");

var _undefined = require("../is/undefined.cjs");

var _formatDecimal = require("./formatDecimal.cjs");

var _si = require("./si.cjs");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const DEFAULT_DECIMALS = 0;
const DEFAULT_UNIT = _si.SI[_si.SI_MID].text;
let defaultDecimals = DEFAULT_DECIMALS;
let defaultUnit = DEFAULT_UNIT;

function getUnits(si, withSi, withSiFull, withUnit) {
  const unit = (0, _boolean.isBoolean)(withUnit) ? _si.SI[_si.SI_MID].text : withUnit;
  return withSi || withSiFull ? si.value === '-' ? withUnit ? ` ${unit}` : '' : ` ${withSiFull ? `${si.text}${withUnit ? ' ' : ''}` : si.value}${withUnit ? unit : ''}` : '';
}

function getPrePost(text, decimals, forceUnit) {
  // NOTE We start at midpoint (8) minus 1 - this means that values display as
  // 123.456 instead of 0.123k (so always 6 relevant). Additionally we use ceil
  // so there are at most 3 decimal before the decimal separator
  const si = (0, _si.calcSi)(text, decimals, forceUnit);
  const mid = text.length - (decimals + si.power);
  const prefix = text.substring(0, mid);
  const padding = mid < 0 ? 0 - mid : 0;
  const postfix = `${`${new Array(padding + 1).join('0')}${text}`.substring(mid < 0 ? 0 : mid)}0000`.substring(0, 4);
  return [si, prefix || '0', postfix];
} // Formats a string/number with <prefix>.<postfix><type> notation


function _formatBalance(input) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  let optDecimals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultDecimals;
  let text = (0, _toBn.bnToBn)(input).toString();

  if (text.length === 0 || text === '0') {
    return '0';
  } // extract options - the boolean case is for backwards-compat


  const {
    decimals = optDecimals,
    forceUnit = undefined,
    withSi = true,
    withSiFull = false,
    withUnit = true
  } = (0, _boolean.isBoolean)(options) ? {
    withSi: options
  } : options; // strip the negative sign so we can work with clean groupings, re-add this in the
  // end when we return the result (from here on we work with positive numbers)

  let sign = '';

  if (text[0].startsWith('-')) {
    sign = '-';
    text = text.substring(1);
  }

  const [si, prefix, postfix] = getPrePost(text, decimals, forceUnit);
  const units = getUnits(si, withSi, withSiFull, withUnit);
  return `${sign}${(0, _formatDecimal.formatDecimal)(prefix)}.${postfix}${units}`;
}

const formatBalance = _formatBalance; // eslint-disable-next-line @typescript-eslint/unbound-method

exports.formatBalance = formatBalance;

formatBalance.calcSi = function (text) {
  let decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultDecimals;
  return (0, _si.calcSi)(text, decimals);
}; // eslint-disable-next-line @typescript-eslint/unbound-method


formatBalance.findSi = _si.findSi; // eslint-disable-next-line @typescript-eslint/unbound-method

formatBalance.getDefaults = () => {
  return {
    decimals: defaultDecimals,
    unit: defaultUnit
  };
}; // get allowable options to display in a dropdown
// eslint-disable-next-line @typescript-eslint/unbound-method


formatBalance.getOptions = function () {
  let decimals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultDecimals;
  return _si.SI.filter(_ref => {
    let {
      power
    } = _ref;
    return power < 0 ? decimals + power >= 0 : true;
  });
}; // Sets the default decimals to use for formatting (ui-wide)
// eslint-disable-next-line @typescript-eslint/unbound-method


formatBalance.setDefaults = _ref2 => {
  let {
    decimals,
    unit
  } = _ref2;
  defaultDecimals = (0, _undefined.isUndefined)(decimals) ? defaultDecimals : Array.isArray(decimals) ? decimals[0] : decimals;
  defaultUnit = (0, _undefined.isUndefined)(unit) ? defaultUnit : Array.isArray(unit) ? unit[0] : unit;
  _si.SI[_si.SI_MID].text = defaultUnit;
};