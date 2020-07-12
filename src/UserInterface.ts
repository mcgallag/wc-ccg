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
import { Palette, Layers, CardType } from "./Global";
import * as PIXI from 'pixi.js';
import gsap from "gsap";
import { Card } from "./Card";

enum Phase {
  Draw = "Draw",
  Muster = "Muster",
  Scramble = "Scramble",
  Movement = "Movement",
  Combat = "Combat",
  Discard = "Discard"
}

/**
 * Style for phase indicator text
 */
const phaseIndicatorTextStyle = new PIXI.TextStyle({
  fontFamily: "Audiowide",
  fontSize: 24,
  fill: Palette.UI.Bright
});

/**
 * Indicates which turn phase it is
 */
class PhaseIndicator extends PIXI.Container {
  private _currentPhase: PIXI.Text;
  private _nextPhase: PIXI.Text;
  private _border: PIXI.Graphics;
  private _phaseMask: PIXI.Graphics;
  private _animating: boolean = false;

  private readonly _fixedWidth = 146;

  constructor() {
    super();
    this.zIndex = Layers.UIBackground;
    this._border = new PIXI.Graphics();
    this._border.lineStyle(2, Palette.UI.Accent)
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
    this.on("click", () => { if (!this._animating) this.rotatePhase(); });
  }

  /**
   * Rotate display to next phase
   */
  private rotatePhase(): void {
    this._animating = true;
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
        this._animating = false;
      }
    });
  }
}

/**
 * Displays a target for card drag and drop
 * - refactored base class to container and added card sprite 7/9/2020 mcg
 * - removed separate card sprite and refactored card interaction 7/12/2020 mcg
 */
export class CardTarget extends PIXI.Container {
  private _card: Card | null = null;
  private readonly _border: PIXI.Graphics;
  private readonly _cardMask: PIXI.Graphics;
  private readonly _validTypes: CardType[];

  private _fixedWidth: number = 108;
  private _fixedHeight: number = 158;

  /** 
   * currently held card or `null` if empty
   */
  get Card(): Card | null {
    return this._card;
  }

  /**
   * true if CardTarget accepts the provided `type`
   * @param type 
   */
  public Accepts(type: CardType): boolean {
    return this._validTypes.includes(type);
  }

  /**
   * 
   * @param type valid card type
   * @param rest (optional) additional types
   */
  constructor(type: CardType, ...rest: CardType[]) {
    super();
    this.zIndex = Layers.UIBackground + 1;
    this.sortableChildren = true;
    this.interactive = true;

    this._validTypes = [type, ...rest];

    this._border = new PIXI.Graphics();
    this._border.pivot.set(this._fixedWidth / 2, this._fixedHeight / 2);
    this._border.zIndex = Layers.UIBackground + 1;

    // set up mask for clipping held card sprite
    this._cardMask = new PIXI.Graphics();
    this._cardMask.pivot.set(this._fixedWidth / 2, this._fixedHeight / 2);
    this._cardMask.zIndex = Layers.UIBackground + 1;
    this._cardMask.lineStyle(4, Palette.UI.BackgroundMedium, 0)
      .beginFill(Palette.UI.BackgroundBase)
      .drawRoundedRect(0, 0, this._fixedWidth, this._fixedHeight, 4)
      .endFill();
    this._cardMask.visible = false;

    // initial border
    this.DrawBorder(Palette.UI.BackgroundMedium);

    this.addChild(this._border);
    this.addChild(this._cardMask);
  }

  /**
   * Refreshes the border graphics with specified color
   * @param color 
   */
  public DrawBorder(color: number): void {
    this._border.clear();

    this._border.lineStyle(4, color)
      // if card is set, then set fill with transparency
      .beginFill(Palette.UI.BackgroundBase, this._card ? 0 : 1)
      .drawRoundedRect(0, 0, this._fixedWidth, this._fixedHeight, 4)
      .endFill();
  }

  /**
   * Sets CardTarget's contained card to `card`
   * @param card 
   */
  public SetCard(card: Card): void {
    if (!this.Accepts(card.Type)) return;

    this._card = card;
    this._cardMask.visible = true;
    this.DrawBorder(Palette.UI.BackgroundMedium);

    card.mask = this._cardMask;
    card.angle = 0;
    card.height = this._fixedHeight;
    card.width = this._fixedWidth;
    card.zIndex = Layers.UIBackground;
    card.interactive = false;
    card.x = 0;
    card.y = 0;
    card.setParent(this);
  }
}

/**
 * Encapsulates and contains UI elements
 */
export class UserInterface extends PIXI.Container {
  public turnIndicator: TurnIndicator;

  private playerPowerPoints: PIXI.Text;
  private opponentPowerPoints: PIXI.Text;

  //TODO are these even needed? probably not
  private targetPlayerCarrier: CardTarget;
  private targetOpponentCarrier: CardTarget;
  private targetTL: CardTarget;
  private targetTR: CardTarget;
  private targetC: CardTarget;
  private targetBL: CardTarget;
  private targetBR: CardTarget;

  private targets: CardTarget[] = [];

  //TODO: break up into individual lines so we can highlight individually later
  private navPointLines: PIXI.Graphics;

  private playerReadyArea: PIXI.Graphics;
  private opponentReadyArea: PIXI.Graphics;

  private playerPhaseIndicator: PhaseIndicator;
  private opponentPhaseIndicator: PhaseIndicator;

  /**
   * Returns an array of CardTarget valid for `type`
   * @param type required card type
   * @param inverse if set, returns targets that don't accept
   */
  public GetTargetsByType(type: CardType, inverse: boolean = false): CardTarget[] {
    return this.targets.filter((targ) => {
      return inverse ? !targ.Accepts(type) : targ.Accepts(type);
    });
  }

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
      fill: Palette.UI.Bright
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
    //DEBUG remove the ship type
    this.targetPlayerCarrier = new CardTarget(CardType.Carrier, CardType.Ship);
    this.targetPlayerCarrier.x = game.windowWidth * 0.5;
    this.targetPlayerCarrier.y = game.windowHeight - (this.targetPlayerCarrier.height / 2 + 20);
    this.addChild(this.targetPlayerCarrier);
    this.targets.push(this.targetPlayerCarrier);

    // opponent's carrier card
    this.targetOpponentCarrier = new CardTarget(CardType.Carrier);
    this.targetOpponentCarrier.x = game.windowWidth * 0.5;
    this.targetOpponentCarrier.y = (this.targetOpponentCarrier.height / 2 + 20);
    this.addChild(this.targetOpponentCarrier);
    this.targets.push(this.targetOpponentCarrier);

    // top-left nav point card
    this.targetTL = new CardTarget(CardType.NavPoint);
    this.targetTL.angle = 90;
    this.targetTL.x = game.windowWidth * 0.35;
    this.targetTL.y = game.windowHeight * 0.3;
    this.addChild(this.targetTL);
    this.targets.push(this.targetTL);

    // top-right nav point card
    this.targetTR = new CardTarget(CardType.NavPoint);
    this.targetTR.angle = 90;
    this.targetTR.x = game.windowWidth * 0.65;
    this.targetTR.y = game.windowHeight * 0.3;
    this.addChild(this.targetTR);
    this.targets.push(this.targetTR);

    // center nav point target
    //DEBUG: remove the ship type
    this.targetC = new CardTarget(CardType.NavPoint, CardType.Ship);
    this.targetC.angle = 90;
    this.targetC.x = game.windowWidth / 2;
    this.targetC.y = game.windowHeight / 2;
    this.addChild(this.targetC);
    this.targets.push(this.targetC);

    // bottom-left nav point card
    this.targetBL = new CardTarget(CardType.NavPoint);
    this.targetBL.angle = 90;
    this.targetBL.x = game.windowWidth * 0.35;
    this.targetBL.y = game.windowHeight * 0.7;
    this.addChild(this.targetBL);
    this.targets.push(this.targetBL);

    // bottom-right nav point card
    this.targetBR = new CardTarget(CardType.NavPoint);
    this.targetBR.angle = 90;
    this.targetBR.x = game.windowWidth * 0.65;
    this.targetBR.y = game.windowHeight * 0.7;
    this.addChild(this.targetBR);
    this.targets.push(this.targetBR);

    // nav point lines
    this.navPointLines = new PIXI.Graphics();
    this.navPointLines.lineStyle(3, Palette.UI.BackgroundDark)
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
    this.playerReadyArea.lineStyle(4, Palette.UI.BackgroundDark)
      .beginFill(0x000000, 0)
      .drawRoundedRect(game.windowWidth * 0.01, game.windowHeight * 0.615, game.windowWidth * 0.29, game.windowHeight * 0.37, 16)
      .zIndex = Layers.UIBackground;
    this.addChild(this.playerReadyArea);

    // opponent's ready area
    this.opponentReadyArea = new PIXI.Graphics();
    this.opponentReadyArea.lineStyle(4, Palette.UI.BackgroundDark)
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