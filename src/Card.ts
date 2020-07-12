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
import { gsap } from "gsap";
import { Layers, CardType, TweenConfig, Palette } from './Global';
import { OutlineFilter } from 'pixi-filters';

/**
 * Encapsulates cards into a sprite
 */
export class Card extends PIXI.Sprite {
  static DefaultScale = 0.25;
  static ZoomScale = 0.28;
  private outlineFilter: OutlineFilter;

  /**
   * Exposes sprite scale for both x and y to one variable
   * @property
   */
  set cardScale(value: number) {
    this.scale.x = value;
    this.scale.y = value;
  }
  get cardScale(): number {
    return this.scale.x;
  }

  /**
   * Exposes outline filter padding
   * - is this terrible inefficient or bad performance-wise?
   */
  // HACK
  // sometimes there's a sliver of outline left even after
  // the filter padding gets specifically set to zero
  // probably some webgl thing
  // just shunt it to -1 anytime it gets set to 0
  set borderWidth(value: number) {
    this.outlineFilter.padding = (value <= 0) ? -1 : value;
  }
  get borderWidth(): number {
    return (this.outlineFilter.padding <= 0) ? 0 : this.outlineFilter.padding;
  }

  private _tween: gsap.core.Tween | null = null;

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

    this.outlineFilter = new OutlineFilter(2, Palette.UI.VeryBright);
    this.outlineFilter.padding = 0;
    this.filters = [this.outlineFilter];

    // basic event listeners for Card objects
    this.on("pointerdown", (evt: PIXI.InteractionEvent) => game.input.cardClicked(evt));
    this.on("mouseover", () => {
      this.zIndex = Layers.Interaction;
      this.Animate({
        duration: 0.1,
        ease: "linear",
        borderWidth: 2,
        cardScale: Card.ZoomScale
      });
    });
    this.on("mouseout", () => {
      this.zIndex = Layers.UICards;
      this.Animate({
        duration: 0.1,
        ease: "linear",
        borderWidth: 0,
        cardScale: Card.DefaultScale
      });
    });
  }

  /**
   * Outlines card with `color`
   * @param color 
   */
  public Outline(color: number = Palette.UI.VeryBright): void {
    this.zIndex = Layers.Interaction;
    this.Animate({
      duration: 0.2,
      ease: "power2",
      borderWidth: 2
    });
  }

  /**
   * Removes card outline
   */
  public Unoutline(): void {
    this.zIndex = Layers.UICards;
    this.Animate({
      duration: 0.2,
      ease: "power2",
      borderWidth: 0
    });
  }

  /**
   * Queues animation described by `config`
   * @param config 
   */
  //TODO figure out how gsap works because surely it does this for you
  public Animate(config: TweenConfig): void {
    if (this._tween == null) {
      this._tween = gsap.to(this, config);
    } else {
      this._tween.then(() => {
        this._tween = gsap.to(this, config);
      });
    }
  }
}
