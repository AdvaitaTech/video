import { Text, TextStyle } from "pixi.js";
import {
  BuildContext,
  LeafWidget,
  RenderCanvas,
  RenderLeaf,
} from "../Foundation";

export class TextWidget extends LeafWidget {
  constructor(
    key: string,
    private text: string,
    private origin: [number, number]
  ) {
    super(key);
  }

  createRenderObject(context: BuildContext): TextRenderObject {
    return new TextRenderObject(this.text, this.origin);
  }

  updateRenderObject(render: TextRenderObject, context: BuildContext) {
    if (render.text !== this.text) {
      render.text = this.text;
      render.markNeedsPaint();
    }
  }
}

export class TextRenderObject extends RenderLeaf {
  textSprite: Text | null = null;
  textStyle = new TextStyle({
    fontFamily: "Arial",
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: "0x111111",
    dropShadowDistance: 10,
    fill: ["#ffffff"],
    stroke: "#004620",
    fontSize: 60,
    fontWeight: "lighter",
    lineJoin: "round",
    strokeThickness: 12,
  });
  constructor(public text: string, public origin: [number, number]) {
    super();
  }

  paintLeaf(canvas: RenderCanvas, context: BuildContext) {
    if (!this.textSprite) {
      const text = new Text(this.text);
      text.x = this.origin[0];
      text.y = this.origin[1];
      text.style = this.textStyle;
      text.anchor.set(0.5);
      canvas.addChild(text);
      this.textSprite = text;
    } else {
      const text = this.textSprite;
      text.text = this.text;
      text.x = this.origin[0];
      text.y = this.origin[1];
      text.style = this.textStyle;
      text.anchor.set(0.5);
    }
  }

  destroyLeaf(canvas: RenderCanvas): void {
    if (this.textSprite) canvas.removeChild(this.textSprite!);
  }
}
