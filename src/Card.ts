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

import * as PIXI from 'pixi.js';
import { game } from "./main";
import { Layers, CardType } from './Global';

/**
 * Encapsulates cards into a sprite
 */
export class Card extends PIXI.Sprite {
  static DefaultScale = 0.25;
  static ZoomScale = 0.28;

  /**
   * Creates a sprite and sets interaction events
   * @param tex Texture for card
   * @param Type Card type
   */
  constructor(tex: PIXI.Texture, public Type: CardType) {
    super(tex);
    this.anchor.set(0.5);
    this.scale.set(Card.DefaultScale);

    this.interactive = true;
    this.zIndex = Layers.UICards;

    // basic event lister for Card objects
    this.on("pointerdown", (evt: PIXI.InteractionEvent) => game.input.cardClicked(evt));
    this.on("mouseover", () => game.input.OutlineCard(this));
    this.on("mouseout", () => game.input.UnoutlineCard(this));
  }
}
