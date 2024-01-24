import { CanvasPosition } from "modules/core/Position";
import { Node, NodeType, TextboxNode, VideoEditorNode } from "./ProjectTypes";
import { Doc, Map } from "yjs";

const doc = new Doc();
export interface ProjectRoot {
  textboxes: {
    [id: string]: TextboxNode;
  };
  vEditors: {
    [id: string]: VideoEditorNode;
  };
}

export class ProjectRegistry {
  private id: string | null = null;
  private _shadowRoot: Map<Map<TextboxNode> | Map<VideoEditorNode>> =
    doc.getMap("testing");
  private _origin: ProjectRoot | null = null;

  private get textboxes() {
    let textboxes = this.root.get("textboxes");
    if (!textboxes) this.root.set("textboxes", new Map<TextboxNode>());
    return this.root.get("textboxes") as Map<TextboxNode>;
  }

  private get videoEditors() {
    let videoEditors = this.root.get("vEditors");
    if (!videoEditors) this.root.set("vEditors", new Map<VideoEditorNode>());
    return this.root.get("vEditors") as Map<VideoEditorNode>;
  }

  public addNode(node: Node) {
    if (node.type === "textbox") this.textboxes.set(node.id, node);
    if (node.type === "video-editor") this.videoEditors.set(node.id, node);
    return node;
  }

  public get root() {
    return this._shadowRoot;
  }

  public get origin() {
    return this._origin;
  }

  public patchNodePosition(id: string, position: CanvasPosition) {
    const node = this.getNode(id) as TextboxNode | null;
    if (node && "position" in node) {
      this.textboxes.set(id, { ...node, position });
      this.touch(id);
    }
  }

  private touch(id: string) {
    const node = this.getNode(id);
    const tNow = performance.now();
    if (!node) return;
    node.cacheKey = `${tNow}-${node.id}`;
    if (node.parent) {
      this.touch(node.parent);
    }
  }

  removeNode(id: string) {
    this.textboxes.delete(id);
    this.videoEditors.delete(id);
  }

  patchNode(id: string, node: Partial<Node>) {
    const original = this.getNode(id);
    if (!original) return;
    const newNode = Object.assign({}, original, node);
    if (original.type === "textbox")
      this.textboxes.set(id, newNode as TextboxNode);
    if (original.type === "video-editor")
      this.videoEditors.set(id, newNode as VideoEditorNode);
    this.touch(id);
  }

  public getNode(id: string): Node | undefined {
    return this.textboxes?.get(id) || this.videoEditors?.get(id);
  }

  public getTextboxNode(id: string): TextboxNode | undefined {
    return this.textboxes?.get(id);
  }

  public getVideoEditorNode(id: string): VideoEditorNode | undefined {
    return this.videoEditors?.get(id);
  }

  public getOriginNode(id: string): Node | undefined {
    if (this.origin)
      return this.origin.textboxes[id] || this.origin.vEditors[id];
  }

  public fork() {
    this._origin = this.___fetchRoot();
  }

  private _convertProjectRootToShadow(project: ProjectRoot) {
    if (!project) return;
    const newTextboxes = new Map<TextboxNode>();
    const newVideoEditors = new Map<VideoEditorNode>();
    Object.values(project.textboxes).map((node) =>
      newTextboxes.set(node.id, node)
    );
    Object.values(project.vEditors).map((node) =>
      newVideoEditors.set(node.id, node)
    );
    this.root.set("textboxes", newTextboxes);
    this.root.set("vEditors", newVideoEditors);
  }

  public resetWithFork() {
    if (this.origin) this._convertProjectRootToShadow(this.origin);
  }

  public commit() {
    this._origin = this.___fetchRoot();
  }

  public ___loadRegistry(id: string, root: ProjectRoot) {
    this.id = id;
    this._shadowRoot = doc.getMap<Map<TextboxNode> | Map<VideoEditorNode>>(
      `board-${id}`
    );
    this._convertProjectRootToShadow(root);
  }

  public ___fetchRoot(): ProjectRoot {
    return ["textboxes", "vEditors"].reduce(
      (result, field) => {
        this.root.get(field)?.forEach((value: Node) => {
          result[field][value.id] = value;
        });
        return result;
      },
      { textboxes: {}, vEditors: {} } as any
    );
  }

  public get boardId() {
    return this.id;
  }

  get allTextboxes() {
    let boxes: TextboxNode[] = [];
    const it = this.textboxes?.values();
    if (!it) return [];
    let result = it.next();
    while (!result.done) {
      boxes.push(result.value);
      result = it.next();
    }
    return boxes;
  }

  get allVideoEditors() {
    let boxes: VideoEditorNode[] = [];
    const it = this.videoEditors?.values();
    if (!it) return [];
    let result = it.next();
    while (!result.done) {
      boxes.push(result.value);
      result = it.next();
    }
    return boxes;
  }
}
