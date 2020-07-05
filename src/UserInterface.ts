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

import { game } from "./main";
import { Card } from "./Card";
import { Palette, Layers } from "./Global";
import * as PIXI from 'pixi.js';
import gsap from "gsap";

/**
 * Encapsulates and contains UI elements
 */
export class UserInterface extends PIXI.Container {
  public turnIndicator: TurnIndicator;

  private playerPowerPoints: PIXI.Text;
  private opponentPowerPoints: PIXI.Text;
  private playerCarrier: Card;
  private opponentCarrier: Card;

  private navPointTL: Card;
  private navPointTR: Card;
  private navPointC: Card;
  private navPointBL: Card;
  private navPointBR: Card;

  //TODO: break up into individual lines so we can highlight individually later
  private navPointLines: PIXI.Graphics;

  private playerReadyArea: PIXI.Graphics;
  private opponentReadyArea: PIXI.Graphics;

  /**
   * Instantiates all UI elements and adds to container
   */
  constructor() {
    super();
    this.sortableChildren = true;

    // Whose turn is it? indicator
    this.turnIndicator = new TurnIndicator();
    this.turnIndicator.zIndex = Layers.UIBackground;
    this.addChild(this.turnIndicator);

    // font styling for power point indicators
    let powerPointsStyle = new PIXI.TextStyle({
      fontFamily: "Audiowide",
      fontSize: 32,
      fill: Palette.Highlight
    });

    // player power points indicator
    this.playerPowerPoints = new PIXI.Text("30", powerPointsStyle);
    this.playerPowerPoints.x = game.windowWidth * 0.43;
    this.playerPowerPoints.y = game.windowHeight - 60;
    this.playerPowerPoints.zIndex = Layers.UIBackground;
    this.addChild(this.playerPowerPoints);

    // opponent power points indicator
    this.opponentPowerPoints = new PIXI.Text("30", powerPointsStyle);
    this.opponentPowerPoints.x = game.windowWidth * 0.536;
    this.opponentPowerPoints.y = 10;
    this.opponentPowerPoints.zIndex = Layers.UIBackground;
    this.addChild(this.opponentPowerPoints);

    // player's carrier card
    this.playerCarrier = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture)
    this.playerCarrier.x = game.windowWidth * 0.5;
    this.playerCarrier.y = game.windowHeight - (this.playerCarrier.height / 2 + 20);
    this.playerCarrier.zIndex = Layers.UICards;
    this.addChild(this.playerCarrier);

    // opponent's carrier card
    this.opponentCarrier = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture)
    this.opponentCarrier.x = game.windowWidth * 0.5;
    this.opponentCarrier.y = (this.opponentCarrier.height / 2 + 20);
    this.opponentCarrier.zIndex = Layers.UICards;
    this.addChild(this.opponentCarrier);

    // top-left nav point card
    this.navPointTL = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture);
    this.navPointTL.angle = 90;
    this.navPointTL.x = game.windowWidth * 0.35;
    this.navPointTL.y = game.windowHeight * 0.3;
    this.navPointTL.zIndex = Layers.UICards;
    this.addChild(this.navPointTL);

    // top-right nav point card
    this.navPointTR = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture);
    this.navPointTR.angle = 90;
    this.navPointTR.x = game.windowWidth * 0.65;
    this.navPointTR.y = game.windowHeight * 0.3;
    this.navPointTR.zIndex = Layers.UICards;
    this.addChild(this.navPointTR);
    
    // center nav point card
    this.navPointC = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture);
    this.navPointC.angle = 90;
    this.navPointC.x = game.windowWidth * 0.5;
    this.navPointC.y = game.windowHeight * 0.5;
    this.navPointC.zIndex = Layers.UICards;
    this.addChild(this.navPointC);

    // bottom-left nav point card
    this.navPointBL = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture);
    this.navPointBL.angle = 90;
    this.navPointBL.x = game.windowWidth * 0.35;
    this.navPointBL.y = game.windowHeight * 0.7;
    this.navPointBL.zIndex = Layers.UICards;
    this.addChild(this.navPointBL);

    // bottom-right nav point card
    this.navPointBR = new Card(game.loader.resources["assets/wc-ccg-confed-back.png"].texture);
    this.navPointBR.angle = 90;
    this.navPointBR.x = game.windowWidth * 0.65;
    this.navPointBR.y = game.windowHeight * 0.7;
    this.navPointBR.zIndex = Layers.UICards;
    this.addChild(this.navPointBR);

    // nav point lines
    this.navPointLines = new PIXI.Graphics();
    this.navPointLines.lineStyle(3, Palette.BackgroundHighlight)
      .moveTo(this.opponentCarrier.x, this.opponentCarrier.y)
      .lineTo(this.navPointTL.x, this.navPointTL.y)
      .lineTo(this.navPointC.x, this.navPointC.y)
      .lineTo(this.opponentCarrier.x, this.opponentCarrier.y)
      .lineTo(this.navPointTR.x, this.navPointTR.y)
      .lineTo(this.navPointC.x, this.navPointC.y)
      .lineTo(this.navPointBL.x, this.navPointBL.y)
      .lineTo(this.navPointTL.x, this.navPointTL.y)
      .moveTo(this.navPointTR.x, this.navPointTR.y)
      .lineTo(this.navPointBR.x, this.navPointBR.y)
      .lineTo(this.navPointC.x, this.navPointC.y)
      .lineTo(this.playerCarrier.x, this.playerCarrier.y)
      .lineTo(this.navPointBL.x, this.navPointBL.y)
      .moveTo(this.navPointBR.x, this.navPointBR.y)
      .lineTo(this.playerCarrier.x, this.playerCarrier.y)
      .zIndex = Layers.UIBackground;
    this.addChild(this.navPointLines);

    // player's ready area
    this.playerReadyArea = new PIXI.Graphics();
    this.playerReadyArea.lineStyle(4, Palette.BackgroundHighlight)
      .beginFill(0x000000, 0)
      .drawRoundedRect(game.windowWidth * 0.01, game.windowHeight * 0.615, game.windowWidth * 0.29, game.windowHeight * 0.37, 16)
      .zIndex = Layers.UIBackground;
    this.addChild(this.playerReadyArea);

    // opponent's ready area
    this.opponentReadyArea = new PIXI.Graphics();
    this.opponentReadyArea.lineStyle(4, Palette.BackgroundHighlight)
      .beginFill(0x000000, 0)
      .drawRoundedRect(game.windowWidth * 0.7, 15, game.windowWidth * 0.29, game.windowHeight * 0.37, 16)
      .zIndex = Layers.UIBackground;
    this.addChild(this.opponentReadyArea);
  }

  /**
   * Increases/Decreases player point indicator by `delta`
   * @param delta 
   */
  public PlayerPowerPoints(delta: number): void {
    let currentPoints = parseInt(this.playerPowerPoints.text);
    this.playerPowerPoints.text = `${currentPoints + delta}`;
  }

  /**
   * Increases/Decreases opponent point indicator by `delta`
   * @param delta 
   */
  public OpponentPowerPoints(delta: number): void {
    let currentPoints = parseInt(this.opponentPowerPoints.text);
    this.opponentPowerPoints.text = `${currentPoints + delta}`;
  }
}

/**
 * Sprite that indicates current player
 */
export class TurnIndicator extends PIXI.Sprite {
  /**
   * Resource for Confed indicator
   */
  static ConfedStarURI = "assets/wc-ccg-confed-star.png";
  /**
   * Resource for Kilrathi indicator
   */
  static KilrathiSigilURI = "assets/wc-ccg-kilrathi-sigil.png";

  private _confedTexture: PIXI.Texture;
  private _kilrathiTexture: PIXI.Texture;
  private _flipped: boolean = true;

  constructor() {
    super();
    this.anchor.set(0.5);
    this.x = game.windowWidth * 0.06;
    this.y = game.windowHeight * 0.5;

    this._confedTexture = game.loader.resources[TurnIndicator.ConfedStarURI].texture;
    this._kilrathiTexture = game.loader.resources[TurnIndicator.KilrathiSigilURI].texture;
    this.texture = this._kilrathiTexture;

    //DEBUG for animation testing
    this.interactive = true;
    this.on("pointertap", () => this.FlipOver());
  }

  /**
   * Triggers flip animation and changes texture
   */
  public FlipOver(): void {
    let endTex = this._flipped ? this._confedTexture : this._kilrathiTexture
    this._flipped = !this._flipped;
    gsap.to(this.scale, {
      x: 0,
      ease: "none",
      duration: 0.15,
      repeat: 1,
      yoyo: true,
      onRepeat: () => this.texture = endTex
    });
  }
}