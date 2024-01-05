import CanvasStore from "./canvas/CanvasStore";
import { DataStore } from "./data-store/DataStore";
import ProjectStore from "./project/ProjectStore";

export default class AppStore {
  private static _project: ProjectStore | null = null;
  private static _data: DataStore | null = null;
  static get canvas() {
    return CanvasStore;
  }

  static get project() {
    if (!this._project) this._project = new ProjectStore();
    return this._project;
  }

  static get data() {
    if (!this._data) this._data = new DataStore();
    return this._data;
  }
}

// @ts-ignore
window.AppStore = AppStore;
