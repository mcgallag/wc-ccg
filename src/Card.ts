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
import { gsap } from "gsap";
import { game } from "./main";
import { Palette } from "./Global";

import { OutlineFilter } from "pixi-filters";

/**
 * Simple card outline filter
 */
const outlineFilter = new OutlineFilter(2, Palette.Bright);
outlineFilter.padding = 2;

/**
 * Encapsulates cards into a sprite
 */
export class Card extends PIXI.Sprite {
  private _drag: boolean = false;
  private _pointerOffset: PIXI.Point = new PIXI.Point();

  static DefaultScale = 0.25;
  static ZoomScale = 0.28;

  /**
   * Creates a sprite and sets interaction events
   * @param tex Texture for card
   */
  constructor(tex: PIXI.Texture) {
    super(tex);
    this.anchor.set(0.5);
    this.scale.set(Card.DefaultScale);

    this.interactive = true;
    this.on("pointerdown", (evt: PIXI.InteractionEvent) => this.onPointerDown(evt.data));
    this.on("pointerup", (evt: PIXI.InteractionEvent) => this.onPointerUp(evt.data));
    this.on("pointerupoutside", (evt: PIXI.InteractionEvent) => this.onPointerUp(evt.data));
    this.on("pointermove", (evt: PIXI.InteractionEvent) => this.onPointerMove(evt.data));
    this.on("mouseover", () => this.onMouseOver());
    this.on("mouseout", () => this.onMouseOut());
  }

  /**
   * Callback for mouseover event
   */
  onMouseOver() {
    // apply outline filter and animate the zoom in
    this.filters = [outlineFilter];
    gsap.to(this.scale, {
      x: Card.ZoomScale,
      y: Card.ZoomScale,
      duration: 0.2,
    });
  }

  /**
   * Callback for mouseout event
   */
  onMouseOut() {
    // remove outline filter and animate the zoom out
    this.filters = [];
    gsap.to(this.scale, {
      x: Card.DefaultScale,
      y: Card.DefaultScale,
      duration: 0.2
    });
  }

  /**
   * Callback for pointerdown event
   * @param data 
   */
  onPointerDown(data: PIXI.InteractionData) {
    // get reference to where the cursor is on the sprite
    this._pointerOffset = data.getLocalPosition(this);
    this._pointerOffset.x *= this.scale.x;
    this._pointerOffset.y *= this.scale.y;
    // start drag
    this._drag = true;
  }

  /**
   * Callback for pointerup event
   * @param data 
   */
  onPointerUp(data: PIXI.InteractionData) {
    // end drag
    this._drag = false;
  }

  /**
   * Callback for pointermove event
   * @param data 
   */
  onPointerMove(data: PIXI.InteractionData) {
    if (this._drag) {
      // drag the card
      let point = data.getLocalPosition(game.stage);
      this.x = point.x - this._pointerOffset.x;
      this.y = point.y - this._pointerOffset.y;
    }
  }
}
