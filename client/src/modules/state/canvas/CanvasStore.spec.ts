import { describe, expect, it } from "vitest";
import CanvasStore from "./CanvasStore";
import { CAMERA_ANGLE, RECT_H, RECT_W } from "modules/core/constants";
import {
  cameraToScreenCoordinates,
  scaleWithAnchorPoint,
} from "modules/core/camera-utils";

describe("CanvasStore", () => {
  it("should initialize the store", () => {
    let canvas = new CanvasStore();
    canvas.initialize(1000, 1000);
    expect(canvas.data.container).toEqual({ width: 1000, height: 1000 });
    expect(canvas.data.camera.z).toBe(
      1000 / (2 * Math.tan((30 * Math.PI) / 180))
    );
  });

  it("should calculate camera and screen coordinates", () => {
    let x = 1.5 * RECT_W;
    let y = 1.5 * RECT_H;
    let canvas = new CanvasStore();
    canvas.initialize(1000, 1000);
    expect(canvas.camera).toEqual({
      x,
      y,
      z: 1000 / (2 * Math.tan((30 * Math.PI) / 180)),
    });
    let screen = cameraToScreenCoordinates(
      canvas.camera.x,
      canvas.camera.y,
      canvas.camera.z,
      CAMERA_ANGLE,
      1
    );
    expect(canvas.screen).toEqual(screen);
  });

  it("should calculate scale", () => {
    let canvas = new CanvasStore();
    canvas.initialize(1000, 1000);
    expect(canvas.scale.x).toBe(1);
    expect(canvas.scale.y).toBe(1);
    canvas.zoomCamera(-10, -10);
    expect(canvas.scale.x).not.toBe(1);
    expect(canvas.scale.y).not.toBe(1);
  });

  it("should move camera", () => {
    let canvas = new CanvasStore();
    canvas.initialize(1000, 1000);
    let x = 1.5 * RECT_W;
    let y = 1.5 * RECT_H;
    expect(canvas.camera.x).toEqual(x);
    expect(canvas.camera.y).toEqual(y);
    canvas.moveCamera(10, 10);
    let scrollFactor = 1.5;
    expect(canvas.camera.x).toBe(x + 10 * scrollFactor);
    expect(canvas.camera.y).toBe(y + 10 * scrollFactor);
  });

  it("should zoom camera", () => {
    let canvas = new CanvasStore();
    canvas.initialize(1000, 1000);
    canvas.movePointer(100, 100);
    let z = 1000 / (2 * Math.tan((30 * Math.PI) / 180));
    expect(canvas.camera.z).toEqual(z);
    let oldScale = { ...canvas.scale };
    canvas.zoomCamera(-10, -10);
    let newW = 2 * (z - 100) * Math.tan(CAMERA_ANGLE);
    let newH = 1 * newW;
    let { x, y } = scaleWithAnchorPoint(
      1100,
      1100,
      1.5 * RECT_W,
      1.5 * RECT_H,
      oldScale.x,
      oldScale.y,
      1000 / newW,
      1000 / newH
    );
    expect(canvas.camera.x).toBe(x);
    expect(canvas.camera.y).toBe(y);
    expect(canvas.camera.z).toBe(z - 100);
  });
});
