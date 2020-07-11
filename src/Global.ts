/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * The Original Code is Copyright (C) 2020 Michael Gallagher
 */

/**
 * Game color palette
 */
export const Palette = {
  Background: 0x000010,
  BackgroundMedium: 0x1B1B36,
  Highlight: 0xD1E000,
  Bright: 0xF1FF33,
  Accent: 0xEE964B,
  UI: {
    BackgroundDark: 0x000010,
    LineDim: 0x1B1B36,
  },
  Interaction: {
    BrightHighlight: 0xF1FF33,
    MediumHighlight: 0xD1E000,
    Accent: 0xEE964B
  },
  NavPoint: {
    Normal: 0x30305F,
    Bright: 0xD1E000,
    ValidTarget: 0x1F7A8C,
    InvalidTarget: 0x632C34
  }
};

/**
 * Z-index for sprite layers
 */
export const Layers = {
  Background: 10,
  UIBackground: 20,
  UICards: 30,
  Interaction: 40
}

export enum CardType {
  NavPoint,
  Carrier,
  Ship,
  Pilot,
  Crew,
  WeaponSystem,
  PilotAward,
  Modifier,
  BattleDamage,
  Maneuver,
  Luck,
  SecretOrders
}