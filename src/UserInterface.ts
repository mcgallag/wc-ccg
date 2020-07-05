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
import { Palette, Layers } from "./Global";
import * as PIXI from 'pixi.js';
import gsap from "gsap";

/**
 * Displays a target for card drag and drop
 * No interactivity currently implemented
 */
class CardTarget extends PIXI.Graphics {
  // private _card: Card | null = null;

  /**
   * 
   * @param angle number of degrees by which to rotate
   */
  constructor(angle: number = 0) {
    const width = 108;
    const height = 158;
    super();
    this.lineStyle(4, Palette.BackgroundHightlight)
      .beginFill(Palette.Background)
      .drawRoundedRect(0, 0, width, height, 4);
    this.pivot.set(width / 2, height / 2);
    this.angle = angle;
    this.zIndex = Layers.UIBackground+1;
  }
}

/**
 * Encapsulates and contains UI elements
 */
export class UserInterface extends PIXI.Container {
  public turnIndicator: TurnIndicator;

  private playerPowerPoints: PIXI.Text;
  private opponentPowerPoints: PIXI.Text;

  private targetPlayerCarrier: CardTarget;
  private targetOpponentCarrier: CardTarget;
  private targetTL: CardTarget;
  private targetTR: CardTarget;
  private targetC: CardTarget;
  private targetBL: CardTarget;
  private targetBR: CardTarget;

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
    this.targetPlayerCarrier = new CardTarget();
    this.targetPlayerCarrier.x = game.windowWidth * 0.5;
    this.targetPlayerCarrier.y = game.windowHeight - (this.targetPlayerCarrier.height / 2 + 20);
    this.addChild(this.targetPlayerCarrier);

    // opponent's carrier card
    this.targetOpponentCarrier = new CardTarget();
    this.targetOpponentCarrier.x = game.windowWidth * 0.5;
    this.targetOpponentCarrier.y = (this.targetOpponentCarrier.height / 2 + 20);
    this.addChild(this.targetOpponentCarrier);

    // top-left nav point card
    this.targetTL = new CardTarget(90);
    this.targetTL.x = game.windowWidth * 0.35;
    this.targetTL.y = game.windowHeight * 0.3;
    this.addChild(this.targetTL);

    // top-right nav point card
    this.targetTR = new CardTarget(90);
    this.targetTR.x = game.windowWidth * 0.65;
    this.targetTR.y = game.windowHeight * 0.3;
    this.addChild(this.targetTR);
    
    // center nav point target
    this.targetC = new CardTarget(90);
    this.targetC.x = game.windowWidth / 2;
    this.targetC.y = game.windowHeight / 2;
    this.addChild(this.targetC);

    // bottom-left nav point card
    this.targetBL = new CardTarget(90);
    this.targetBL.x = game.windowWidth * 0.35;
    this.targetBL.y = game.windowHeight * 0.7;
    this.addChild(this.targetBL);

    // bottom-right nav point card
    this.targetBR = new CardTarget(90);
    this.targetBR.x = game.windowWidth * 0.65;
    this.targetBR.y = game.windowHeight * 0.7;
    this.addChild(this.targetBR);

    // nav point lines
    this.navPointLines = new PIXI.Graphics();
    this.navPointLines.lineStyle(3, Palette.BackgroundMedium)
      .moveTo(this.targetOpponentCarrier.x, this.targetOpponentCarrier.y)
      .lineTo(this.targetTL.x, this.targetTL.y)
      .lineTo(this.targetC.x, this.targetC.y)
      .lineTo(this.targetOpponentCarrier.x, this.targetOpponentCarrier.y)
      .lineTo(this.targetTR.x, this.targetTR.y)
      .lineTo(this.targetC.x, this.targetC.y)
      .lineTo(this.targetBL.x, this.targetBL.y)
      .lineTo(this.targetTL.x, this.targetTL.y)
      .moveTo(this.targetTR.x, this.targetTR.y)
      .lineTo(this.targetBR.x, this.targetBR.y)
      .lineTo(this.targetC.x, this.targetC.y)
      .lineTo(this.targetPlayerCarrier.x, this.targetPlayerCarrier.y)
      .lineTo(this.targetBL.x, this.targetBL.y)
      .moveTo(this.targetBR.x, this.targetBR.y)
      .lineTo(this.targetPlayerCarrier.x, this.targetPlayerCarrier.y)
      .zIndex = Layers.UIBackground;
    this.addChild(this.navPointLines);

    // player's ready area
    this.playerReadyArea = new PIXI.Graphics();
    this.playerReadyArea.lineStyle(4, Palette.BackgroundMedium)
      .beginFill(0x000000, 0)
      .drawRoundedRect(game.windowWidth * 0.01, game.windowHeight * 0.615, game.windowWidth * 0.29, game.windowHeight * 0.37, 16)
      .zIndex = Layers.UIBackground;
    this.addChild(this.playerReadyArea);

    // opponent's ready area
    this.opponentReadyArea = new PIXI.Graphics();
    this.opponentReadyArea.lineStyle(4, Palette.BackgroundMedium)
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