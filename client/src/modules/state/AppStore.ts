import CanvasStore from "./canvas/CanvasStore";
import ProjectStore from "./project/ProjectStore";

export default class AppStore {
  private static _project: ProjectStore | null = null;
  private static _canvas: CanvasStore | null = null;
  static get canvas() {
    if (!this._canvas) this._canvas = new CanvasStore();
    return this._canvas;
  }

  static get project() {
    if (!this._project) this._project = new ProjectStore();
    return this._project;
  }
}

// @ts-ignore
window.AppStore = AppStore;
