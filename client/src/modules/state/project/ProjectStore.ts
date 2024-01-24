import { CanvasPosition } from "modules/core/Position";
import { generateId } from "modules/core/project-utils";
import AppStore from "../AppStore";
import { ProjectRegistry, ProjectRoot } from "./ProjectRegistry";
import {
  Node,
  RootNode,
  TextDragPreview,
  VideoDragPreview,
  VideoEditorNode,
} from "./ProjectTypes";
import { Board, User } from "modules/core/NetworkTypes";
import { MonitorRegistry } from "./MonitorRegistry";

export default class ProjectStore {
  public board: Board | null = null;
  private author: User | null = null;
  private _drag: VideoDragPreview | TextDragPreview | null = null;
  private _registry = new ProjectRegistry();
  private _monitors = new MonitorRegistry();

  public get registry() {
    return this._registry;
  }

  private get monitors() {
    return this._monitors;
  }

  public getNode(id: string) {
    return this.registry.getNode(id);
  }

  public getTextboxNode(id: string) {
    return this.registry.getTextboxNode(id);
  }

  public getVideoEditorNode(id: string) {
    return this.registry.getVideoEditorNode(id);
  }

  public moveBox(id: string, position: Partial<CanvasPosition>) {
    const node = this.registry.getNode(id);
    if (!node || !("position" in node)) return;
    this.registry.patchNodePosition(id, { ...node.position, ...position });
    AppStore.canvas.shouldRender = true;
  }

  public addVideoEditor(id: string, node: VideoEditorNode) {
    this.registry.addNode({
      ...node,
    });
    this.monitors.addMonitor(id, 0);
    AppStore.canvas.shouldRender = true;
  }

  public addTextbox(
    id: string,
    { position, text }: { position: CanvasPosition; text?: string }
  ) {
    if (this.registry.getNode(id)) {
      this.registry.patchNodePosition(id, position);
    } else {
      console.log("adding", {
        id,
        position,
        title: generateId(),
        type: "textbox",
        children: [],
        cacheKey: "",
        align: "center",
        vertical: "center",
        author: this.author?.uuid || "",
        text: text || "",
      });
      this.registry.addNode({
        id,
        position,
        title: generateId(),
        type: "textbox",
        children: [],
        cacheKey: "",
        align: "center",
        vertical: "center",
        author: this.author?.uuid || "",
        text: text || "",
      });
    }
    AppStore.canvas.shouldRender = true;
  }

  public setNode(id: string, node: Partial<Node>) {
    this.registry.patchNode(id, node);
    AppStore.canvas.shouldRender = true;
  }

  public getMonitorState(id: string) {
    return this.monitors.getMonitorState(id);
  }

  public playMonitor(id: string) {
    this.monitors.playMonitor(id);
  }

  public pauseMonitor(id: string) {
    this.monitors.pauseMonitor(id);
  }

  public seekMonitor(id: string, time: number) {
    this.monitors.seekMonitor(id, time);
  }

  public loadProject(nodes: Node[]) {
    nodes.map((node) => this.registry.addNode(node));
    AppStore.canvas.shouldRender = true;
  }

  public ___loadState(id: string, root: any) {
    return this.registry.___loadRegistry(id, root as ProjectRoot);
  }

  public ___fetchState() {
    return this.registry.___fetchRoot();
  }

  public removeNode(id: string) {
    this.registry.removeNode(id);
  }

  public fork() {
    this.registry.fork();
  }

  public resetWithFork() {
    this.registry.resetWithFork();
  }

  public commit() {
    this.registry.commit();
  }

  public getOriginNode(id: string) {
    return this.registry.getOriginNode(id);
  }

  public get user() {
    return this.author as User;
  }

  public set user(u: User) {
    this.author = u;
  }

  public get boardId() {
    return this.registry.boardId;
  }

  public get rootNodes(): RootNode[] {
    return ([] as RootNode[])
      .concat(this.registry.allTextboxes)
      .concat(this.registry.allVideoEditors);
  }

  public get dragPreview() {
    return this._drag;
  }

  public set dragPreview(preview: VideoDragPreview | TextDragPreview | null) {
    this._drag = preview;
  }
}
