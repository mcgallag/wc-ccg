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
  UI: {
    /**
     * Darkest color of background
     */
    BackgroundBase: 0x000010,
    /**
     * Dark shade of background for non-distracting lines and UI elements
     */
    BackgroundDark: 0x1B1B36,
    /**
     * Medium shade of background for inactive lines and UI elements
     */
    BackgroundMedium: 0x30305F,

    /**
     * Yellow color for immediate interactions and warnings
     */
    Bright: 0xD1E000,
    /**
     * Brighter shade of yellow for immediate interactions and warnings
     */
    VeryBright: 0xF1FF33,

    /**
     * Green color for valid and affirmative UI actions
     */
    Valid: 0x9BE564,
    /**
     * Red color for invalid and negative UI actions
     */
    Invalid: 0x632C34,

    /**
     * Orange/peach color for non-distracting accents in UI
     */
    Accent: 0xEE964B
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

export interface TweenConfig {
  /**
   * duration in seconds
   */
  duration: number,
  ease: string,
  [others: string]: any
}