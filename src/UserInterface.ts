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
import { Card } from "./Card";

enum Phase {
  Draw = "Draw",
  Muster = "Muster",
  Scramble = "Scramble",
  Movement = "Movement",
  Combat =  "Combat",
  Discard = "Discard"
}

/**
 * Style for phase indicator text
 */
const phaseIndicatorTextStyle = new PIXI.TextStyle({
  fontFamily: "Audiowide",
  fontSize: 24,
  fill: Palette.Highlight
});

/**
 * Indicates which turn phase it is
 */
class PhaseIndicator extends PIXI.Container {
  private _currentPhase: PIXI.Text;
  private _nextPhase: PIXI.Text;
  private _border: PIXI.Graphics;
  private _phaseMask: PIXI.Graphics;

  private readonly _fixedWidth = 146;

  constructor() {
    super();
    this.zIndex = Layers.UIBackground;
    this._border = new PIXI.Graphics();
    this._border.lineStyle(2, Palette.Accent)
      .beginFill(0, 0)
      .drawRect(0, 0, this._fixedWidth, 32);

    this._phaseMask = new PIXI.Graphics();
    this._phaseMask.beginFill(0xFFFFFF, 1)
      .drawRect(2, 6, this._fixedWidth, 22)
      .endFill();

    this._currentPhase = new PIXI.Text(Phase.Movement, phaseIndicatorTextStyle);
    this._currentPhase.x = (this._fixedWidth - this._currentPhase.width) / 2;
    this._currentPhase.mask = this._phaseMask;

    this._nextPhase = new PIXI.Text(Phase.Muster, phaseIndicatorTextStyle);
    this._nextPhase.y = 32;
    this._nextPhase.x = (this._fixedWidth - this._nextPhase.width) / 2;
    this._nextPhase.mask = this._phaseMask;

    this.addChild(this._currentPhase, this._phaseMask, this._nextPhase, this._border);

    //DEBUG for testing
    this.interactive = true;
    this.on("click", () => this.rotatePhase());
  }

  /**
   * Rotate display to next phase
   */
  private rotatePhase(): void {
    switch (this._currentPhase.text) {
      case "Draw":
        this.ChangePhase(Phase.Muster);
        break;
      case "Muster":
        this.ChangePhase(Phase.Scramble);
        break;
      case "Scramble":
        this.ChangePhase(Phase.Movement);
        break;
      case "Movement":
        this.ChangePhase(Phase.Combat);
        break;
      case "Combat":
        this.ChangePhase(Phase.Discard);
        break;
      case "Discard":
        this.ChangePhase(Phase.Draw);
        break;
    }
  }

  /**
   * Rotate indicator to `newPhase`
   * @param newPhase 
   */
  public ChangePhase(newPhase: Phase) {
    this._nextPhase.text = newPhase;
    this._nextPhase.x = (this._fixedWidth - this._nextPhase.width) / 2;

    gsap.to(this._nextPhase, {
      y: 0,
      duration: 1,
    });
    gsap.to(this._currentPhase, {
      y: -32,
      duration: 1,
      onComplete: () => {
        [this._nextPhase, this._currentPhase] = [this._currentPhase, this._nextPhase];
        this._nextPhase.y = 32;
      }
    });
  }
}

/**
 * Displays a target for card drag and drop
 * No interactivity currently implemented
 * - refactored base class to container and added card sprite 7/9/2020 mcg
 */
class CardTarget extends PIXI.Container {
  private _cardSprite: PIXI.Sprite | null = null;

  private _width: number =  108;
  private _height: number = 158;

  /**
   * 
   * @param angle number of degrees by which to rotate
   */
  constructor(angle: number = 0) {
    super();
    this.angle = angle;
    let border = new PIXI.Graphics();
    border.lineStyle(4, Palette.BackgroundHightlight)
      .beginFill(Palette.Background)
      .drawRoundedRect(0, 0, this._width, this._height, 4);
    border.pivot.set(this._width / 2, this._height / 2);
    this.addChild(border);
    this.zIndex = Layers.UIBackground+1;

    //DEBUG for card testing
    this.SetCard(new Card(game.loader.resources["assets/WCTCG_Arrow_Blue_Devil_Squadron.jpg"].texture))
  }

  // sets the card target's contents to a specific card texture
  public SetCard(card: Card): void {
    if (this._cardSprite) {
      this.removeChild(this._cardSprite);
      this._cardSprite.destroy();
    }
    this._cardSprite = new PIXI.Sprite(card.texture);
    this._cardSprite.width = this._width - 1;
    this._cardSprite.height = this._height - 2;
    this._cardSprite.x -= (this._width / 2 - 1);
    this._cardSprite.y -= (this.height / 2 - 3);
    this._cardSprite.zIndex = Layers.UIBackground;

    this.addChild(this._cardSprite);
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

  private playerPhaseIndicator: PhaseIndicator;
  private opponentPhaseIndicator: PhaseIndicator;

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
    this.playerPowerPoints.x = 847;
    this.playerPowerPoints.y = 922;
    this.playerPowerPoints.zIndex = Layers.UIBackground;
    this.addChild(this.playerPowerPoints);

    // player phase indicator
    this.playerPhaseIndicator = new PhaseIndicator();
    this.playerPhaseIndicator.x = 1023;
    this.playerPhaseIndicator.y = 925;
    this.playerPhaseIndicator.zIndex = Layers.UIBackground;
    this.addChild(this.playerPhaseIndicator);

    // opponent power points indicator
    this.opponentPowerPoints = new PIXI.Text("30", powerPointsStyle);
    this.opponentPowerPoints.x = 1021;
    this.opponentPowerPoints.y = 13;
    this.opponentPowerPoints.zIndex = Layers.UIBackground;
    this.addChild(this.opponentPowerPoints);

    // opponent phase indicator
    this.opponentPhaseIndicator = new PhaseIndicator();
    // console.log(Math.floor(game.windowWidth * 0.39));
    this.opponentPhaseIndicator.x = 750;
    this.opponentPhaseIndicator.y = 22;
    this.opponentPhaseIndicator.zIndex = Layers.UIBackground;
    this.addChild(this.opponentPhaseIndicator);

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