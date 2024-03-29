import { CanvasPosition } from "modules/core/Position";
import {
  cameraToScreenCoordinates,
  convertScreenPositionToCamera,
  scaleWithAnchorPoint,
} from "../../core/camera-utils";
import { CAMERA_ANGLE, RECT_H, RECT_W } from "modules/core/constants";
import { radians } from "../../core/math-utils";
import AppStore from "../AppStore";

export interface CanvasState {
  shouldRender: boolean;
  pixelRatio: number; // our resolution for dip calculations
  container: {
    //holds information related to our screen container
    width: number;
    height: number;
  };
  pointer: {
    x: number;
    y: number;
  };
  camera: {
    //holds camera state
    x: number;
    y: number;
    z: number;
  };
}
const getInitialCanvasState = (): CanvasState => {
  return {
    shouldRender: true,
    pixelRatio: window.devicePixelRatio || 1,
    container: {
      width: 0,
      height: 0,
    },
    pointer: {
      x: 0,
      y: 0,
    },
    camera: {
      x: 0,
      y: 0,
      z: 0,
    },
  };
};

export default class CanvasStore {
  data: CanvasState = getInitialCanvasState();
  private _ref: HTMLDivElement | null = null;
  initialize(width: number, height: number) {
    const containerWidth = width;
    const containerHeight = height;
    this.data = {
      ...getInitialCanvasState(),
      pixelRatio: window.devicePixelRatio || 1,
      container: {
        width: containerWidth,
        height: containerHeight,
      },
      camera: {
        x: 1.5 * RECT_W,
        y: 1.5 * RECT_H,
        z: containerWidth / (2 * Math.tan(CAMERA_ANGLE)),
      },
    };
  }

  public get ref() {
    if (!this._ref) throw new Error("Canvas ref is not set");
    return this._ref;
  }

  public set ref(ref: HTMLDivElement) {
    this._ref = ref;
  }

  public get screen() {
    const { x, y, z } = this.camera;
    const aspect = this.aspect;
    const angle = CAMERA_ANGLE;
    return cameraToScreenCoordinates(x, y, z, angle, aspect);
  }

  public get camera() {
    return this.data.camera;
  }
  public get scale() {
    const { width: w, height: h } = this.screen;
    const { width: cw, height: ch } = this.container;
    return { x: cw / w, y: ch / h };
  }
  public get shouldRender() {
    return this.data.shouldRender;
  }
  public set shouldRender(value: boolean) {
    this.data.shouldRender = value;
  }

  public get container() {
    return this.data.container;
  }

  public get pointer() {
    return this.data.pointer;
  }

  private get aspect() {
    return this.data.container.width / this.data.container.height;
  }

  private isCameraInBounds(cameraX: number, cameraY: number, cameraZ: number) {
    return true;
    // const angle = radians(30);
    // const { x, y, width, height } = cameraToScreenCoordinates(
    //   cameraX,
    //   cameraY,
    //   cameraZ,
    //   angle,
    //   this.aspect
    // );
    // const isXInBounds = x >= 0 && x <= this.data.canvas.width;
    // const isYInBounds = y >= 0 && y <= this.data.canvas.height;
    // return isXInBounds && isYInBounds;
  }

  public moveCamera(mx: number, my: number) {
    const scrollFactor = 1.5;
    const deltaX = mx * scrollFactor,
      deltaY = my * scrollFactor;
    const { x, y, z } = this.camera;
    if (this.isCameraInBounds(x + deltaX, y + deltaY, z)) {
      this.data.camera.x += deltaX;
      this.data.camera.y += deltaY;
      // move pointer by the same amount
      this.shouldRender = true;
      this.movePointer(deltaY, deltaY);
    }
  }

  public zoomCamera(deltaX: number, deltaY: number) {
    // Normal zoom is quite slow, we want to scale the amount quite a bit
    const zoomScaleFactor = 10;
    const deltaAmount = zoomScaleFactor * Math.max(deltaY);
    const { x: oldX, y: oldY, z: oldZ } = this.camera;
    const oldScale = { ...this.scale };

    const { width: containerWidth, height: containerHeight } = this.container;
    const { width, height } = cameraToScreenCoordinates(
      oldX,
      oldY,
      oldZ + deltaAmount,
      CAMERA_ANGLE,
      this.aspect
    );
    const newScaleX = containerWidth / width;
    const newScaleY = containerHeight / height;
    const { x: newX, y: newY } = scaleWithAnchorPoint(
      this.pointer.x,
      this.pointer.y,
      oldX,
      oldY,
      oldScale.x,
      oldScale.y,
      newScaleX,
      newScaleY
    );
    const newZ = oldZ + deltaAmount;
    if (this.isCameraInBounds(oldX, oldY, newZ)) {
      this.data.camera = {
        x: newX,
        y: newY,
        z: newZ,
      };
    }
    this.shouldRender = true;
  }

  // pointer position from top left of the screen
  public movePointer(deltaX: number, deltaY: number) {
    const scale = this.scale;
    const { left, top } = this.screen;
    this.data.pointer.x = left + deltaX / scale.x;
    this.data.pointer.y = top + deltaY / scale.y;
  }

  public centerNodeOnScreen(id: string) {
    const node = AppStore.project.getNode(id);
    if (!node) return;
    const { width, height } = this.screen;
    const nodePosition = node.position;
    const screenPosition: CanvasPosition = {
      width,
      height,
      left: nodePosition.left - (width - nodePosition.width) / 2,
      top: nodePosition.top - (height - nodePosition.height) / 2,
    };
    this.data.camera = convertScreenPositionToCamera(
      screenPosition,
      CAMERA_ANGLE
    );
  }

  public centerMultipleNodesOnScreen(ids: string[], padding: number = 50) {
    const boundingBox = ids.reduce<{
      left: number;
      top: number;
      right: number;
      bottom: number;
    }>(
      (acc, nodeId) => {
        const node = AppStore.project.getNode(nodeId);
        if (!node) return acc;
        const right = node.position.left + node.position.width;
        const bottom = node.position.top + node.position.height;
        if (acc.left >= node.position.left) acc.left = node.position.left;
        if (acc.top >= node.position.top) acc.top = node.position.top;
        if (acc.right <= right) acc.right = right;
        if (acc.bottom <= bottom) acc.bottom = bottom;
        return acc;
      },
      { left: Infinity, top: Infinity, right: 0, bottom: 0 }
    );
    const boundingPosition: CanvasPosition = {
      left: boundingBox.left,
      top: boundingBox.top,
      width: boundingBox.right - boundingBox.left,
      height: boundingBox.bottom - boundingBox.top,
    };
    let screenPosition: CanvasPosition;
    if (boundingPosition.width > boundingPosition.height) {
      const newWidth = boundingPosition.width + 2 * padding;
      const newHeight = newWidth / this.aspect;
      screenPosition = {
        left: boundingPosition.left - padding,
        width: newWidth,
        height: newHeight,
        top: boundingPosition.top - (newHeight - boundingPosition.height) / 2,
      };
    } else {
      const newHeight = boundingPosition.height + 2 * padding;
      const newWidth = this.aspect * newHeight;
      screenPosition = {
        top: boundingPosition.top - padding,
        height: newHeight,
        width: newWidth,
        left: boundingPosition.left - (newWidth - boundingPosition.width) / 2,
      };
    }
    const { x, y, z } = convertScreenPositionToCamera(
      screenPosition,
      CAMERA_ANGLE
    );
    this.data.camera = { x, y, z };
  }
}
