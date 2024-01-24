export type BuildContext = {};

export abstract class Widget {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
  abstract build(context: BuildContext): Widget[];
  abstract createElement(context: BuildContext): WidgetElement;
}

export abstract class WidgetElement {
  widget: Widget;
  constructor(key: string, widget: Widget) {
    this.widget = widget;
  }

  abstract mount(parent: WidgetElement, context: BuildContext): void;
  abstract unmount(): void;
}

export abstract class RenderObject {
  abstract paint(context: BuildContext): void;
  abstract destroy(context: BuildContext): void;
}

export abstract class Box extends Widget {
  constructor(key: string) {
    super(key);
  }
  abstract createRenderObject(context: BuildContext): RenderObject;
}

export abstract class StatelessWidget extends Widget {
  createElement(context: BuildContext): WidgetElement {
    return new StatelessElement(this.key, this);
  }
}

class StatelessElement extends WidgetElement {
  _children: Map<string, WidgetElement> = new Map();
  constructor(key: string, widget: Widget) {
    super(key, widget);
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
    });
    for (let [key, el] of this._children) {
      if (!allowedKeys.has(key)) {
        el.unmount();
        this._children.delete(key);
      }
    }
  }

  unmount() {
    for (let [_, el] of this._children) {
      el.unmount();
    }
  }
}
