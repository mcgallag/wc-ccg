import { game } from "./main";
import { Card } from "./Card";
import gsap from "gsap";
import { CardTarget } from "./UserInterface";
import { Layers, Palette } from "./Global";

export class InputController {
  private _selectedCard: Card | null = null;
  private _outlinedCard: Card | null = null;
  private _pointerOffset: PIXI.Point | null = null;
  private _draggedCardTarget: CardTarget | null = null;

  private readonly DRAG_CARD_CALLBACK: Function;
  private readonly DRAG_END_CALLBACK: Function;
  private readonly DISPLAY_CARD_TARGET_CALLBACK: Function;
  private readonly CLEAR_CARD_TARGET_CALLBACK: Function;
  private readonly SET_CARD_TARGET_CALLBACK: Function;

  constructor() {
    this.DRAG_CARD_CALLBACK = (evt: PIXI.InteractionEvent) => {
      this.DragCard(evt.data);
    };
    this.DRAG_END_CALLBACK = (evt: PIXI.InteractionEvent) => {
      this.CardDragEnd(evt.data);
    };
    this.DISPLAY_CARD_TARGET_CALLBACK = (evt: PIXI.InteractionEvent) => {
      if (evt.currentTarget instanceof CardTarget) {
        this.DisplayCardInTarget(evt.currentTarget);
      }
    };
    this.CLEAR_CARD_TARGET_CALLBACK = (evt: PIXI.InteractionEvent) => {
      this.RemoveCardFromTarget();
    };
    this.SET_CARD_TARGET_CALLBACK = (evt: PIXI.InteractionEvent) => {
      this.SetCardInTarget();
    }
  }

  /**
   * Displays selected Card sprite in CardTarget object
   * @param target 
   */
  DisplayCardInTarget(target: CardTarget) {
    if (this._selectedCard) {
      target.DisplayCard(this._selectedCard);
      target.DrawBorder(Palette.Highlight);
      this._draggedCardTarget = target;
      this._selectedCard.visible = false;
    } else {
      game.Warning("DisplayCardInTarget called but _selectedCard is null!");
    }
  }

  /**
   * Completes drag event and sets the card into the CardTarget
   */
  SetCardInTarget(): void {
    if (this._selectedCard && this._draggedCardTarget) {
      this._draggedCardTarget.SetCard(this._selectedCard);
      this._draggedCardTarget.DrawBorder();
      this._draggedCardTarget = null;
      let draggedCardReference = this._selectedCard;
      this.CardDragEnd();
      draggedCardReference.parent.removeChild(draggedCardReference);
      draggedCardReference.destroy();
      this._outlinedCard = null;
    } else {
      let nullPart = "";
      if (!this._selectedCard) nullPart += "_selectedCard ";
      if (!this._draggedCardTarget) nullPart += "_draggedCardTarget";
      game.Warning(`SetCardInTarget called but ${nullPart}is null!`);
    }
  }

  /**
   * Clears dragged card from current CardTarget
   */
  RemoveCardFromTarget(): void {
    if (this._selectedCard && this._draggedCardTarget) {
      this._draggedCardTarget.ClearCard();
      this._draggedCardTarget.DrawBorder();
      this._draggedCardTarget = null;
      this._selectedCard.visible = true;
    } else {
      let nullPart = "";
      if (!this._selectedCard) nullPart += "_selectedCard ";
      if (!this._draggedCardTarget) nullPart += "_draggedCardTarget ";
      game.Warning(`RemoveCardFromTarget called but ${nullPart} is null!`);
    }
  }

  /**
   * Outlines and does initial zoom on `card`
   * @param card 
   */
  OutlineCard(card: Card): void {
    if (!this._outlinedCard) {
      this._outlinedCard = card;
      card.filters = [game.filters.outline];
      card.zIndex = Layers.Interaction;
      gsap.to(card.scale, {
        x: Card.ZoomScale,
        y: Card.ZoomScale,
        duration: 0.2
      });
    }
  }

  /**
   * Removes outline and removes zoom from `card`
   * @param card 
   */
  UnoutlineCard(card: Card): void {
    if (this._outlinedCard && card == this._outlinedCard) {
      this._outlinedCard = null;
      card.filters = [];
      card.zIndex = Layers.UICards;
      gsap.to(card.scale, {
        x: Card.DefaultScale,
        y: Card.DefaultScale,
        duration: 0.2
      });
    }
  }

  /**
   * Begins drag event on `card`
   * @param card dragged card
   * @param event interaction event data
   */
  CardDragStart(card: Card, event: PIXI.InteractionData): void {
    this._selectedCard = card;
    this._selectedCard.interactive = false;
    this._pointerOffset = event.getLocalPosition(card);
    this._pointerOffset.x *= card.scale.x;
    this._pointerOffset.y *= card.scale.y;

    // add callbacks for future mouse events to game stage
    game.stage.on("pointermove", this.DRAG_CARD_CALLBACK);
    game.stage.on("pointerup", this.DRAG_END_CALLBACK);
    game.stage.on("pointerupoutside", this.DRAG_END_CALLBACK);

    // add callbacks to CardTargets
    game.ui.GetCardTargets().forEach(targ => {
      targ.on("pointerover", this.DISPLAY_CARD_TARGET_CALLBACK);
      targ.on("pointerout", this.CLEAR_CARD_TARGET_CALLBACK);
      targ.on("pointerup", this.SET_CARD_TARGET_CALLBACK);
    });
  }

  /**
   * Ends drag event
   * @param event 
   */
  CardDragEnd(event?: PIXI.InteractionData): void {
    if (this._selectedCard) {
      // clear interaction references
      this._selectedCard.interactive = true;
      this._selectedCard = null;

      // clear callbacks to game stage
      game.stage.off("pointermove", this.DRAG_CARD_CALLBACK);
      game.stage.off("pointerup", this.DRAG_END_CALLBACK);
      game.stage.off("pointerupoutside", this.DRAG_END_CALLBACK);

      // clear callbacks to card targets
      game.ui.GetCardTargets().forEach(targ => {
        targ.off("pointerover", this.DISPLAY_CARD_TARGET_CALLBACK);
        targ.off("pointerout", this.CLEAR_CARD_TARGET_CALLBACK);
        targ.off("pointerup", this.SET_CARD_TARGET_CALLBACK);
      });
    } else {
      game.Warning("CardDragEnd called but _selectedCard is null!");
    }
  }

  /**
   * Drag callback for mouse movement
   * @param data 
   */
  DragCard(data: PIXI.InteractionData): void {
    if (this._selectedCard && this._pointerOffset) {
      // calculate new coordinates and adjust position
      let point = data.getLocalPosition(game.stage);
      this._selectedCard.x = point.x - this._pointerOffset.x;
      this._selectedCard.y = point.y - this._pointerOffset.y;
    } else {
      let nullpart = "";
      if (!this._selectedCard) nullpart += "_selectedCard ";
      if (!this._pointerOffset) nullpart += "_pointerOffset ";
      game.Warning(`DragCard called but ${nullpart}is null!`);
    }
  }
}