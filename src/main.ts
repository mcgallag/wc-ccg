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

// Load LESS source for webpack
import "./main.less";
import * as PIXI from 'pixi.js';
import * as WebFont from "webfontloader";

import { UserInterface } from "./UserInterface";
import { Card } from "./Card";
import { InputController } from "./InputController";
import { CardType } from "./Global";

/**
 * PIXI Application settings
 */
const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
  resolution: window.devicePixelRatio || 1
};

/**
 * Main application
 */
export class CCG extends PIXI.Application {
  public windowWidth: number;
  public windowHeight: number;

  // assert assignment, is created in setup callback after loading resources
  public ui!: UserInterface;
  public input: InputController;

  constructor() {
    super(config);

    this.input = new InputController();

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    // disable right-click menu on canvas
    this.view.addEventListener("contextmenu", (evt) => evt.preventDefault());
    this.resizeTo = window;
    document.body.append(this.view);

    this.preload();
  }

  /**
   * Loads resources and performs other preload processes
   */
  preload() {
    let index = window.location.pathname;
    this.loader.baseUrl = index.substring(0, index.lastIndexOf("/")+1);
    this.loader
      .add("assets/wc-ccg-confed-back.png")
      .add("assets/wc-ccg-confed-star.png")
      .add("assets/wc-ccg-kilrathi-sigil.png")
      .add("assets/WCTCG_Arrow_Blue_Devil_Squadron.jpg")
      .load(() => this.setup());
  }

  /**
   * Initiates final game setup
   */
  setup() {
    this.ui = new UserInterface();
    this.stage.addChild(this.ui);

    // map event listeners to input controller
    this.stage.interactive = true;
    this.stage.sortableChildren = true;

    //DEBUG for card testing
    let card = new Card(this.loader.resources["assets/WCTCG_Arrow_Blue_Devil_Squadron.jpg"].texture, CardType.Ship);
    let card2 = new Card(this.loader.resources["assets/WCTCG_Arrow_Blue_Devil_Squadron.jpg"].texture, CardType.NavPoint);
    card.scale.set(0.25);
    card2.scale.set(0.25);
    card.x = 200;
    card2.x = 200;
    card.y = 200;
    card2.y = 700;
    this.stage.addChild(card);
    this.stage.addChild(card2);
  }

  /**
   * Displays msg to console in Warning font (yellow)
   * @param msg 
   */
  public Warning(msg: string): void {
    console.log(`%c${msg}`, "color: yellow; font-weight: bold");
  }
}

/**
 * Main game reference
 */
export let game: CCG;

/**
 * Once the DOM is loaded, preload our webfonts and instantiate the game
 */
window.addEventListener("load", () => {
  WebFont.load({
    custom: {
      families: ["Audiowide", "Open Sans"],
    },
    active() {
      game = new CCG();
    }
  })
});