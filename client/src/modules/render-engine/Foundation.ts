export type BuildContext = {};
export type WidgetCreator = (context: BuildContext) => Widget[];

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

  abstract render(context: BuildContext): void;
  abstract mount(parent: WidgetElement, context: BuildContext): void;
  abstract unmount(): void;
}

export abstract class RenderObject {
  abstract paint(context: BuildContext): void;
  abstract destroy(): void;
}

// A wrapper that optimizes the amount of paint calls
export abstract class RenderLeaf extends RenderObject {
  needsPaint = true;
  abstract paintLeaf(context: BuildContext): void;
  abstract destroyLeaf(): void;

  protected markNeedsPaint() {
    this.needsPaint = true;
  }

  paint(context: BuildContext) {
    if (this.needsPaint) {
      this.paintLeaf(context);
    }
  }

  destroy() {
    this.destroyLeaf();
  }
}

export abstract class LeafWidget extends Widget {
  constructor(key: string) {
    super(key);
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

  render(context: BuildContext) {
    if (this.renderObject) {
      this.widget.updateRenderObject(this.renderObject, context);
    } else {
      this.renderObject = this.widget.createRenderObject(context);
    }
    this.renderObject.paint(context);
  }

  unmount() {
    this.renderObject?.destroy();
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
  constructor(key: string, widget: MultiChildWidget) {
    super(key, widget);
    this.widget = widget;
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
        el.unmount();
        this._children.delete(key);
      }
    }
  }

  render(context: BuildContext) {
    for (let [_, el] of this._children) {
      el.render(context);
    }
  }

  unmount() {
    for (let [key, el] of this._children) {
      el.unmount();
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
  constructor(key: string, widget: RootWidget) {
    super(key, widget);
  }

  renderWidgets(context: BuildContext, creator: WidgetCreator) {
    // this sets up the render tree and the widget tree
    this.mount(context, creator);
    this.render(context);
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
        el.unmount();
        this._children.delete(key);
      }
    }
  }

  render(context: BuildContext) {
    for (let [key, el] of this._children) {
      el.render(context);
    }
  }

  unmount() {}
}
