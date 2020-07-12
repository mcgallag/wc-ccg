import { game } from "./main";
import { Card } from "./Card";
import { CardTarget } from "./UserInterface";
import { Palette } from "./Global";

/**
 * For logging input assertion failures
 */
class InputError extends Error {
  constructor(obj: any) {
    console.error("Input Assertion failed. Something weird happened! 🤔");
    console.dir(obj);
    console.trace();
    super();
  }
}

enum InteractionState {
  Drag
};

export class InputController {
  // Do not delete this, Mike. You actually need it
  private _selectedCard: Card | null = null;
  private _pointerOffset: PIXI.Point | null = null;

  //TODO Find a better way of doing this
  private readonly DRAG_CARD: Function;
  private readonly DRAG_END: Function;
  private readonly DRAG_CANCEL: Function;
  private readonly DISPLAY_CARD_TARGET: Function;
  private readonly CLEAR_CARD_TARGET: Function;
  private readonly SET_CARD_TARGET: Function;

  /**
   * Current interaction state
   */
  private _state: InteractionState;

  constructor() {
    //DEBUG - testing card drag inputs
    this._state = InteractionState.Drag;

    this.DRAG_CARD = (evt: PIXI.InteractionEvent) => {
      this._dragSelectedCard(evt.data);
    };
    this.DRAG_END = (evt: PIXI.InteractionEvent) => {
      this._dragStop();
    };
    this.DRAG_CANCEL = (evt: PIXI.InteractionEvent) => {
      //TODO - implement some kind of cancel snapback
      this._dragStop();
    }
    this.DISPLAY_CARD_TARGET = (evt: PIXI.InteractionEvent) => {
      if (evt.currentTarget instanceof CardTarget) {
        if (this._selectedCard !== null) {
          this._snapCardToTarget(this._selectedCard, evt.currentTarget);
        }
      }
    };
    this.CLEAR_CARD_TARGET = (evt: PIXI.InteractionEvent) => {
      if (evt.currentTarget instanceof CardTarget) {
        if (this._selectedCard !== null) {
          this._snapCardFromTarget(this._selectedCard, evt.currentTarget);
        }
      }
    };
    this.SET_CARD_TARGET = (evt: PIXI.InteractionEvent) => {
      if (evt.currentTarget instanceof CardTarget) {
        if (this._selectedCard !== null) {
          this._setCardInTarget(this._selectedCard, evt.currentTarget);
        }
      }
    }
  }

  /**
   * Snaps dragged `card` into `target`
   * @param target 
   * @param card
   */
  private _snapCardToTarget(card: Card, target: CardTarget) {
    if (!target.Accepts(card.Type)) return;

    card.Animate({
      angle: target.angle,
      height: target.height * 0.98,
      width: target.width * 0.98,
      duration: 0.3,
      ease: "power4"
    });
  }

  /**
   * Called when player releases mouse dragging `card` over a valid `target`
   * - Assumed `card` is valid type for `target`
   * 
   * @param card card being dragged by player
   * @param target accepts `card` type
   */
  private _setCardInTarget(card: Card, target: CardTarget): void {
    // lock card into the target
    card.Unoutline();
    target.SetCard(card);

    // turn off input callbacks for CardTargets
    game.ui.GetTargetsByType(card.Type).forEach(validTarget => {
      validTarget.off("pointerover", this.DISPLAY_CARD_TARGET);
      validTarget.off("pointerout", this.CLEAR_CARD_TARGET);
      validTarget.off("pointerup", this.SET_CARD_TARGET);
      validTarget.DrawBorder(Palette.NavPoint.Normal);
    })

    // turn off input callbacks for card dragging
    game.stage.off("pointermove", this.DRAG_CARD);
    game.stage.off("pointerup", this.DRAG_END);
    game.stage.off("pointerupoutside", this.DRAG_CANCEL);
  }

  /**
   * Clears dragged card from current CardTarget
   */
  private _snapCardFromTarget(card: Card, target: CardTarget): void {
    card.Animate({
      angle: 0,
      cardScale: Card.ZoomScale,
      duration: 0.3,
      ease: "power4"
    });
  }
  /**
   * Begins drag card interaction
   * @param card clicked card
   * @param clickOffset event coordinates local to `card`
   */
  private startCardDrag(card: Card, clickOffset: PIXI.Point): void {
    this._selectedCard = card;
    this._selectedCard.interactive = false;

    this._pointerOffset = clickOffset;
    this._pointerOffset.x *= card.scale.x;
    this._pointerOffset.y *= card.scale.y;

    // add callbacks for drag mouse events
    game.stage.on("pointermove", this.DRAG_CARD);
    game.stage.on("pointerup", this.DRAG_END);
    game.stage.on("pointerupoutside", this.DRAG_CANCEL);

    // add callbacks for valid card targets
    game.ui.GetTargetsByType(card.Type).forEach(target => {
      if (target.Card === null) {
        target.on("pointerover", this.DISPLAY_CARD_TARGET);
        target.on("pointerout", this.CLEAR_CARD_TARGET);
        target.on("pointerup", this.SET_CARD_TARGET);
        target.DrawBorder(Palette.NavPoint.ValidTarget);
      }
    });
  }

  /**
   * Callback for mouse movement while a card is being dragged
   * @param data 
   */
  private _dragSelectedCard(data: PIXI.InteractionData): void {
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

  /**
   * Begins drag event on `card`
   * @param card dragged card
   * @param event interaction event data
   */
  public cardClicked(evt: PIXI.InteractionEvent): void {
    if (!(evt.currentTarget instanceof Card)) throw new InputError(evt.currentTarget);

    // determine interaction based on current input state
    switch (this._state) {
      case InteractionState.Drag:
        this.startCardDrag(evt.currentTarget, evt.data.getLocalPosition(evt.currentTarget));
        break;
    }
  }

  /**
   * Completes drag event successfully at point
   * @param event 
   */
  private _dragStop(): void {
    if (!this._selectedCard) throw new InputError("_selectedCard is null!");

    // clear callbacks to game stage
    game.stage.off("pointermove", this.DRAG_CARD);
    game.stage.off("pointerup", this.DRAG_END);
    game.stage.off("pointerupoutside", this.DRAG_CANCEL);

    // clear callbacks to card targets
    game.ui.GetTargetsByType(this._selectedCard.Type).forEach(targ => {
      targ.off("pointerover", this.DISPLAY_CARD_TARGET);
      targ.off("pointerout", this.CLEAR_CARD_TARGET);
      targ.off("pointerup", this.SET_CARD_TARGET);
      targ.DrawBorder(Palette.NavPoint.Normal);
    });

    // clear interaction references and restore card interaction
    this._selectedCard.interactive = true;
    this._selectedCard = null;
  }
}