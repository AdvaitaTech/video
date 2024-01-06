import { describe, expect, it } from "vitest";
import CanvasStore from "./CanvasStore";
import { CAMERA_ANGLE, RECT_H, RECT_W } from "modules/core/constants";
import { cameraToScreenCoordinates } from "modules/core/camera-utils";

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
    expect(canvas.scale).toBe(1);
  });
});
