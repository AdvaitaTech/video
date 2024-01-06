import { describe, expect } from "vitest";
import {
  cameraToScreenCoordinates,
  convertScreenPositionToCamera,
  scaleWithAnchorPoint,
} from "./camera-utils";
import { CAMERA_ANGLE } from "modules/core/constants";

describe("camera-utils", (test) => {
  test("camera and screen should be interoperable", () => {
    let angle = CAMERA_ANGLE;
    let position = { left: 50, top: 50, width: 1000, height: 1000 };
    let camera = convertScreenPositionToCamera(position, angle);
    console.log("camera", camera);
    const result = cameraToScreenCoordinates(
      camera.x,
      camera.y,
      camera.z,
      angle,
      1
    );
    expect(result).toEqual(position);
  });

  test("scaleWithAnchorPoint should work", () => {
    let resolution = { x: 1000, y: 1000 };
    let delta = -100;
    let position1 = { left: 50, top: 50, width: 1000, height: 1000 };
    let camera1 = convertScreenPositionToCamera(position1, CAMERA_ANGLE);
    let { width, height } = cameraToScreenCoordinates(
      camera1.x,
      camera1.y,
      camera1.z + delta,
      CAMERA_ANGLE,
      1
    );
    let scale1 = {
      x: resolution.x / position1.width,
      y: resolution.y / position1.height,
    };
    let scale2 = { x: resolution.x / width, y: resolution.y / height };
    let anchorPoint = { x: 100, y: 100 };
    let { x, y } = scaleWithAnchorPoint(
      anchorPoint.x,
      anchorPoint.y,
      camera1.x,
      camera1.y,
      scale1.x,
      scale1.y,
      scale2.x,
      scale2.y
    );
    let newScreen = cameraToScreenCoordinates(
      x,
      y,
      camera1.z + delta,
      CAMERA_ANGLE,
      1
    );
    let newScale = {
      x: resolution.x / newScreen.width,
      y: resolution.y / newScreen.height,
    };
    expect((anchorPoint.x - newScreen.left) * newScale.x).toBeCloseTo(
      (anchorPoint.x - position1.left) * scale1.x
    );
    expect((anchorPoint.y - newScreen.top) * newScale.y).toBeCloseTo(
      (anchorPoint.y - position1.top) * scale1.y
    );
  });
});
