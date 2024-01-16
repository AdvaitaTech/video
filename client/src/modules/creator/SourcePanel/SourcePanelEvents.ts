import AppStore from "modules/state/AppStore";
import {
  DragPreview,
  VideoClip,
  VideoDragPreview,
  VideoEditorNode,
  VideoTrack,
} from "modules/state/project/ProjectTypes";
import { RefObject } from "react";
import { createVideoEditorNodeFromVideoClip } from "../utils/VideoEditorUtils";
import { generateId } from "modules/core/project-utils";
import { calculateVideoElementDimensions } from "../nodes/VideoEditorElement";

type PreviewAction = "add-track" | "add-clip";

const isMouseInsideCanvas = (
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect
) => {
  return (
    mouseX > canvasRect.left &&
    mouseX < canvasRect.right &&
    mouseY > canvasRect.top &&
    mouseY < canvasRect.bottom
  );
};

const getMousePositionOnCanvas = (
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect
) => {
  let screen = AppStore.canvas.screen;
  let scale = AppStore.canvas.scale;
  let deltaX = (mouseX - canvasRect.left) / scale.x;
  let deltaY = (mouseY - canvasRect.top) / scale.y;
  let left = screen.left + deltaX;
  let top = screen.top + deltaY;

  return {
    x: left,
    y: top,
  };
};

const getMouseOverlappingNode = (
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect
) => {
  let { x: left, y: top } = getMousePositionOnCanvas(
    mouseX,
    mouseY,
    canvasRect
  );

  let overlappingNode = AppStore.project.rootNodes.find((node) => {
    return (
      node.position.top < top &&
      node.position.top + node.position.height > top &&
      node.position.left < left &&
      node.position.left + node.position.width > left
    );
  });
  return overlappingNode;
};

const getPreviewOverlappingNode = (dragPreview: DragPreview) => {
  const { originX, originY, width, height } = dragPreview;

  return AppStore.project.rootNodes.find((node) => {
    return (
      originX < node.position.left + node.position.width &&
      originX + width > node.position.left &&
      originY < node.position.top + node.position.height &&
      originY + height > node.position.top
    );
  });
};

const getOverlappingTrackIdOfNode = (
  mouseX: number,
  mouseY: number,
  nodeId: string
) => {
  let originNode = AppStore.project.getOriginNode(nodeId) as VideoEditorNode;
  if (!originNode) return;
  let elementIds = [
    originNode.id,
    ...originNode.tracks.map((t) => t.id),
  ].flatMap((id) => [id, `${id}-pre`, `${id}-post`]);
  return elementIds.find((id) => {
    let element = document.getElementById(id);
    if (!element) return;
    let rect = element.getBoundingClientRect();
    return (
      mouseX > rect.left &&
      mouseX < rect.right &&
      mouseY > rect.top &&
      mouseY < rect.bottom
    );
    // check if mouse is inside getBoundingClientRect
  });
};

const addHighlightToTrack = (
  nodeId: string,
  trackIndex: number,
  previewAction: PreviewAction
) => {
  let originNode = AppStore.project.getOriginNode(
    nodeId
  ) as VideoEditorNode | null;
  if (!originNode) return;

  if (previewAction === "add-track") {
    if (trackIndex === originNode.tracks.length) {
      AppStore.project.setNode(originNode.id, {
        tracks: [
          ...originNode.tracks.slice(0, Math.max(0, trackIndex - 1)),
          { ...originNode.tracks[trackIndex - 1], highlightBelow: true },
        ],
      });
    } else {
      AppStore.project.setNode(originNode.id, {
        tracks: [
          ...originNode.tracks.slice(0, Math.max(0, trackIndex)),
          { ...originNode.tracks[trackIndex], highlightAbove: true },
          ...originNode.tracks.slice(trackIndex + 1),
        ],
      });
    }
  }
};

export const getSourcePanelMouseEvents = (
  videoRef: RefObject<HTMLVideoElement>
) => {
  const onDocumentMouseMove = (e: MouseEvent) => {
    e.stopPropagation();
    // calculate position of mouse on canvasRef
    let x = e.clientX;
    let y = e.clientY;
    const canvas = AppStore.canvas.ref;
    if (!canvas || !AppStore.project.dragPreview) return;
    const rect = canvas.getBoundingClientRect();
    // check if mouse is inside rect
    AppStore.project.dragPreview.showPreviewNode = false;
    AppStore.project.resetWithFork();
    AppStore.canvas.shouldRender = true;
    let { x: left, y: top } = getMousePositionOnCanvas(x, y, rect);
    let overlappingNode = getMouseOverlappingNode(x, y, rect);
    let previewOverlap = getPreviewOverlappingNode({
      ...AppStore.project.dragPreview,
      originX: left,
      originY: top,
    });
    console.log("previewOverlap", previewOverlap, overlappingNode);
    if (isMouseInsideCanvas(x, y, rect)) {
      // set preview position
      console.log("in canvas");
      if (previewOverlap && overlappingNode) {
        // show track preview
        console.log("getting track");
        let trackId = getOverlappingTrackIdOfNode(x, y, overlappingNode.id);
        console.log("trackId", trackId);
        if (trackId) {
          let element = document.getElementById(trackId);
          if (!element) return;
          let action = element.getAttribute("data-action");
          let index = element.getAttribute("data-index")
            ? parseInt(element.getAttribute("data-index") || "")
            : null;
          console.log("action", element, action, index);
          if (!action || index === null) return;
          addHighlightToTrack(
            overlappingNode.id,
            index,
            action as PreviewAction
          );
        }
      } else {
        // show preview
        AppStore.project.dragPreview = {
          ...(AppStore.project.dragPreview as VideoDragPreview),
          originX: left,
          originY: top,
          showPreviewNode: true,
        };
      }
    }
  };

  const onDocumentMouseUp = (e: MouseEvent) => {
    console.log("onMouseUp triggered");
    e.stopPropagation();
    try {
      // set dragging to false
      // disable preview
      let x = e.clientX;
      let y = e.clientY;
      const canvas = AppStore.canvas.ref;
      if (!canvas || !AppStore.project.dragPreview)
        throw Error("Canvas is null or no drag preview");
      const rect = canvas.getBoundingClientRect();
      AppStore.project.resetWithFork();
      AppStore.canvas.shouldRender = true;
      let { x: left, y: top } = getMousePositionOnCanvas(x, y, rect);
      let overlappingNode = getMouseOverlappingNode(x, y, rect);
      let previewOverlap = getPreviewOverlappingNode({
        ...AppStore.project.dragPreview,
        originX: left,
        originY: top,
      });

      if (isMouseInsideCanvas(x, y, rect)) {
        if (previewOverlap && overlappingNode) {
          let trackId = getOverlappingTrackIdOfNode(x, y, overlappingNode.id);
          if (trackId) {
            let element = document.getElementById(trackId);
            if (!element) return;
            let action = element.getAttribute("data-action");
            let index = element.getAttribute("data-index")
              ? parseInt(element.getAttribute("data-index") || "")
              : null;
            if (!action || index === null) return;
            let originNode = AppStore.project.getOriginNode(
              overlappingNode.id
            ) as VideoEditorNode;
            if (!originNode) return;

            if (action === "add-track") {
              let { url, duration } = AppStore.project
                .dragPreview as VideoDragPreview;

              let videoClip: VideoClip = {
                id: generateId(),
                cacheKey: "",
                type: "video-clip",
                url: url,
                start: 0,
                end: duration,
                clipStart: 0,
                clipEnd: duration,
              };
              let track: VideoTrack = {
                id: generateId(),
                type: "video",
                index: 1,
                cacheKey: "",
                clips: [videoClip],
              };
              if (index === originNode.tracks.length) {
                AppStore.project.setNode(originNode.id, {
                  tracks: [...originNode.tracks, track],
                });
              } else {
                AppStore.project.setNode(originNode.id, {
                  tracks: [
                    ...originNode.tracks.slice(0, Math.max(0, index)),
                    track,
                    ...originNode.tracks.slice(index),
                  ],
                });
              }
            }
          }
        } else {
          let { url, duration, width, height } = AppStore.project.dragPreview;
          let node = createVideoEditorNodeFromVideoClip(
            generateId(),
            { top, left, width, height },
            { url: url, duration: duration }
          );
          AppStore.project.addVideoEditor(node.id, node);
        }
      }
    } catch (e) {
    } finally {
      AppStore.project.dragPreview = null;
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
    }
  };

  return {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // set dragging to true
      let duration = videoRef.current?.duration || 0;
      let url = videoRef.current?.src || "";
      console.log("onMouseDown triggered", videoRef.current?.duration);
      let { height, width } = calculateVideoElementDimensions([
        { clips: [{ start: 0, end: duration, url }] },
      ]);
      AppStore.project.dragPreview = {
        showPreviewNode: false,
        type: "video",
        url: videoRef.current?.src || "",
        duration: videoRef.current?.duration || 0,
        originX: 0,
        originY: 0,
        height,
        width,
      };
      AppStore.project.fork();
      document.addEventListener("mousemove", onDocumentMouseMove);
      document.addEventListener("mouseup", onDocumentMouseUp);
      e.stopPropagation();
    },
  };
};

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, beforeAll } = import.meta.vitest;

  const generateFakeVideoNode = (
    left: number,
    top: number,
    trackCount: number
  ): VideoEditorNode => {
    let url =
      "https://www.shutterstock.com/shutterstock/videos/1080319025/preview/stock-footage-abstract-tech-earth-globalization-in-d-motion-graphic-concept-transmit-ai-networking-on-fiber.mp4";
    let { width: w, height: h } = calculateVideoElementDimensions([
      { clips: [{ start: 0, end: 20, url }] },
    ]);

    let duration = 10 + Math.random() * 20;
    let videoClip: VideoClip = {
      id: generateId(),
      cacheKey: "",
      type: "video-clip",
      url: url,
      start: 0,
      end: duration,
      clipStart: 0,
      clipEnd: duration,
    };
    let tracks: VideoTrack[] = new Array(trackCount).fill(0).map((_, i) => ({
      id: generateId(),
      type: "video",
      index: 1,
      cacheKey: "",
      clips: [videoClip],
    }));

    return {
      id: generateId(),
      position: { top, left, width: w, height: h },
      type: "video-editor",
      children: [],
      cacheKey: "",
      author: "",
      tracks,
    };
  };

  describe("getSourcePanelMouseEvents", () => {
    beforeAll(() => {
      AppStore.project.fork();
    });
    beforeEach(() => {
      AppStore.canvas.initialize(1000, 1000);
      AppStore.project.resetWithFork();
    });
    describe("getMouseOverlappingNode", () => {
      let node: VideoEditorNode | null;
      beforeEach(() => {
        node = generateFakeVideoNode(1200, 800, 1);
        AppStore.project.addVideoEditor(node.id, node);
      });
      it("should return null if no nodes are overlapping", () => {
        let rect = new DOMRect(100, 100, 100, 100);
        let res = getMouseOverlappingNode(0, 0, rect);
        expect(res).toBeFalsy();
      });

      it("should return the node that is overlapping", () => {
        let rect = new DOMRect(100, 0, 1000, 1000);
        let res = getMouseOverlappingNode(301, 1, rect);
        expect(res).toStrictEqual(node);
      });
    });

    describe("getPreviewOverlappingNode", () => {
      let node: VideoEditorNode | null;
      beforeEach(() => {
        node = generateFakeVideoNode(1200, 800, 1);
        AppStore.project.addVideoEditor(node.id, node);
      });
      it("should return null if no nodes are overlapping", () => {
        let res = getPreviewOverlappingNode({
          originX: 200,
          originY: 200,
          width: 100,
          height: 100,
          duration: 20,
          showPreviewNode: false,
        });
        expect(res).toBeFalsy();
      });

      it("should return the node that is overlapping", () => {
        let overlaps = [
          [1101, 701],
          [1401, 701],
        ];
        overlaps.forEach(([x, y]) => {
          let res = getPreviewOverlappingNode({
            originX: x,
            originY: y,
            width: 100,
            height: 100,
            duration: 20,
            showPreviewNode: false,
          });
          expect(res).toStrictEqual(node);
        });
      });
    });

    describe("addHighlightToTrack", () => {
      let node: VideoEditorNode | null;
      beforeEach(() => {
        node = generateFakeVideoNode(1200, 800, 3);
        AppStore.project.addVideoEditor(node.id, node);
        AppStore.project.fork();
      });
      it("should set highlight above for all indices", () => {
        [0, 1, 2].forEach((index) => {
          let check = AppStore.project.getNode(node!.id) as VideoEditorNode;
          expect(check.tracks[index].highlightAbove).toBeFalsy();
          addHighlightToTrack(node!.id, index, "add-track");
          check = AppStore.project.getNode(node!.id) as VideoEditorNode;
          expect(check.tracks[index].highlightAbove).toBe(true);
        });
      });

      it("should set highlight below for last track", () => {
        let check = AppStore.project.getNode(node!.id) as VideoEditorNode;
        expect(check.tracks[2].highlightBelow).toBeFalsy();
        addHighlightToTrack(node!.id, 3, "add-track");
        check = AppStore.project.getNode(node!.id) as VideoEditorNode;
        expect(check.tracks[2].highlightBelow).toBe(true);
      });
    });
  });
}