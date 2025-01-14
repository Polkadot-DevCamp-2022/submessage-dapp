// Copyright 2017-2021 @polkadot/x-global authors & contributors
// SPDX-License-Identifier: Apache-2.0
export { packageInfo } from "./packageInfo.js";

function evaluateThis(fn) {
  return fn('return this');
}

export const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : evaluateThis(Function);
export function extractGlobal(name, fallback) {
  return typeof xglobal[name] === 'undefined' ? fallback : xglobal[name];
}
export function exposeGlobal(name, fallback) {
  if (typeof xglobal[name] === 'undefined') {
    xglobal[name] = fallback;
  }
}