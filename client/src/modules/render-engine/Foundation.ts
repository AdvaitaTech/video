import { Container, DisplayObject } from "pixi.js";

export type BuildContext = {};
export type WidgetCreator = (context: BuildContext) => Widget[];
class RenderCanvas {
  constructor(public container: Container) {}

  getContainer() {
    return this.container;
  }

  addChild(child: DisplayObject) {
    this.container.addChild(child);
  }

  removeChild(child: DisplayObject | Container) {
    this.container.removeChild(child);
  }

  addContainer(child: Container) {
    this.container.addChild(child);
  }

  clear() {
    this.container.removeChildren();
  }
}

export abstract class Widget {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
  abstract createElement(context: BuildContext): WidgetElement;
}

export abstract class WidgetElement {
  widget: Widget;
  constructor(key: string, widget: Widget) {
    this.widget = widget;
  }

  abstract render(canvas: RenderCanvas, context: BuildContext): void;
  abstract mount(parent: WidgetElement, context: BuildContext): void;
  abstract unmount(canvas: RenderCanvas): void;
}

export abstract class RenderObject {
  abstract paint(canvas: RenderCanvas, context: BuildContext): void;
  abstract destroy(canvas: RenderCanvas): void;
}

// A wrapper that optimizes the amount of paint calls
export abstract class RenderLeaf extends RenderObject {
  needsPaint = true;
  canvas: RenderCanvas | null = null;
  abstract paintLeaf(canvas: RenderCanvas, context: BuildContext): void;
  abstract destroyLeaf(canvas: RenderCanvas): void;

  protected markNeedsPaint() {
    this.needsPaint = true;
  }

  paint(canvas: RenderCanvas, context: BuildContext) {
    // if canvas is changed, we must atleast be aware of it
    this.canvas = canvas;
    if (this.needsPaint) {
      this.paintLeaf(canvas, context);
    }
  }

  destroy(canvas: RenderCanvas) {
    this.destroyLeaf(canvas);
  }
}

export abstract class LeafWidget extends Widget {
  constructor(key: string) {
    super(key);
  }
  createElement(context: BuildContext): WidgetElement {
    return new LeafWidgetElement(this.key, this);
  }
  abstract createRenderObject(context: BuildContext): RenderObject;
  abstract updateRenderObject(
    renderObject: RenderObject,
    context: BuildContext
  ): void;
}

export class LeafWidgetElement extends WidgetElement {
  widget: LeafWidget;
  renderObject: RenderObject | null = null;
  constructor(key: string, widget: LeafWidget) {
    super(key, widget);
    this.widget = widget;
  }

  mount(parent: WidgetElement, context: BuildContext) {
    const renderObject = this.widget.createRenderObject(context);
    this.renderObject = renderObject;
  }

  render(canvas: RenderCanvas, context: BuildContext) {
    if (this.renderObject) {
      this.widget.updateRenderObject(this.renderObject, context);
    } else {
      this.renderObject = this.widget.createRenderObject(context);
    }
    this.renderObject.paint(canvas, context);
  }

  unmount(canvas: RenderCanvas) {
    if (this.renderObject && canvas) {
      this.renderObject?.destroy(canvas!);
    } else if (this.renderObject && !canvas) {
      throw new Error("RenderObject exists but canvas does not");
    }
    this.renderObject = null;
  }
}

export abstract class MultiChildWidget extends Widget {
  abstract build(context: BuildContext): Widget[];

  createElement(context: BuildContext): WidgetElement {
    return new MultiChildElement(this.key, this);
  }
}

class MultiChildElement extends WidgetElement {
  _children: Map<string, WidgetElement> = new Map();
  widget: MultiChildWidget;
  mounted = false;
  container: RenderCanvas;
  constructor(key: string, widget: MultiChildWidget) {
    super(key, widget);
    this.widget = widget;
    this.container = new RenderCanvas(new Container());
  }

  mount(parent: WidgetElement, context: BuildContext) {
    const widgets = this.widget.build(context);
    let allowedKeys = new Set<string>();
    widgets.forEach((child) => {
      let nodeKey = child.key;
      allowedKeys.add(nodeKey);
      if (this._children.has(nodeKey)) {
        return;
      }
      let el = child.createElement(context);
      this._children.set(nodeKey, el);
      el.mount(this, context);
    });
    for (let [key, el] of this._children) {
      if (!allowedKeys.has(key)) {
        el.unmount(this.container);
        this._children.delete(key);
      }
    }
  }

  render(canvas: RenderCanvas, context: BuildContext) {
    if (!this.mounted) {
      canvas.addChild(this.container.getContainer());
      this.mounted = true;
    }
    for (let [_, el] of this._children) {
      el.render(canvas, context);
    }
  }

  unmount(canvas: RenderCanvas) {
    for (let [key, el] of this._children) {
      el.unmount(canvas);
      this._children.delete(key);
    }
  }
}

class RootWidget extends Widget {
  createElement(context: BuildContext): WidgetElement {
    return new RootElement(this.key, this);
  }
}

class RootElement extends WidgetElement {
  _children: Map<string, WidgetElement> = new Map();
  canvas: RenderCanvas | null = null;
  mounted = false;
  container: RenderCanvas;
  constructor(key: string, widget: RootWidget) {
    super(key, widget);
    this.container = new RenderCanvas(new Container());
  }

  renderWidgets(
    canvas: RenderCanvas,
    context: BuildContext,
    creator: WidgetCreator
  ) {
    // this sets up the render tree and the widget tree
    this.canvas = canvas;
    this.mount(context, creator);
    this.render(canvas, context);
  }

  mount(context: BuildContext, creator: WidgetCreator) {
    const widgets = creator(context);
    let allowedKeys = new Set<string>();
    widgets.forEach((child) => {
      let nodeKey = child.key;
      allowedKeys.add(nodeKey);
      if (this._children.has(nodeKey)) {
        return;
      }
      let el = child.createElement(context);
      this._children.set(nodeKey, el);
      el.mount(this, context);
    });
    for (let [key, el] of this._children) {
      if (!allowedKeys.has(key)) {
        el.unmount(this.container);
        this._children.delete(key);
      }
    }
  }

  render(canvas: RenderCanvas, context: BuildContext) {
    if (!this.mounted) {
      canvas.addChild(this.container.getContainer());
      this.mounted = true;
    }
    for (let [key, el] of this._children) {
      el.render(this.container, context);
    }
  }

  unmount(canvas: RenderCanvas) {
    for (let [key, el] of this._children) {
      el.unmount(this.container);
      this._children.delete(key);
    }
    canvas.removeChild(this.container.getContainer());
  }
}
