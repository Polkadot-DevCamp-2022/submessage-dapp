// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
const U8_TO_HEX = new Array(256);
const U16_TO_HEX = new Array(256 * 256);
const HEX_TO_U8 = {};
const HEX_TO_U16 = {};

for (let n = 0; n < 256; n++) {
  const hex = n.toString(16).padStart(2, '0');
  U8_TO_HEX[n] = hex;
  HEX_TO_U8[hex] = n;
}

for (let i = 0; i < 256; i++) {
  for (let j = 0; j < 256; j++) {
    const hex = U8_TO_HEX[i] + U8_TO_HEX[j];
    const n = i << 8 | j;
    U16_TO_HEX[n] = hex;
    HEX_TO_U16[hex] = n;
  }
}

export { HEX_TO_U16, HEX_TO_U8, U16_TO_HEX, U8_TO_HEX };