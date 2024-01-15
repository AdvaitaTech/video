import AppStore from "modules/state/AppStore";
import {
  VideoClip,
  VideoDragPreview,
  VideoEditorNode,
  VideoTrack,
} from "modules/state/project/ProjectTypes";
import { RefObject } from "react";
import { createVideoEditorNodeFromVideoClip } from "../utils/VideoEditorUtils";
import { generateId } from "modules/core/project-utils";
import { calculateVideoElementDimensions } from "../nodes/VideoEditorElement";

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
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      AppStore.project.dragPreview.showPreviewNode = false;
      AppStore.canvas.shouldRender = true;
      return;
    } else {
      let screen = AppStore.canvas.screen;
      let scale = AppStore.canvas.scale;
      let deltaX = (x - rect.left) / scale.x;
      let deltaY = (y - rect.top) / scale.y;
      // set preview position
      AppStore.project.dragPreview = {
        ...(AppStore.project.dragPreview as VideoDragPreview),
        originX: screen.left + deltaX,
        originY: screen.top + deltaY,
        showPreviewNode: true,
      };
      AppStore.canvas.shouldRender = true;
      let left = screen.left + deltaX;
      let top = screen.top + deltaY;
      let overlappingNode = AppStore.project.rootNodes.find((node) => {
        return (
          node.position.top < top &&
          node.position.top + node.position.height > top &&
          node.position.left < left &&
          node.position.left + node.position.width > left
        );
      });
      AppStore.project.resetWithFork();
      if (!overlappingNode) {
        let { originX, originY, width, height } = AppStore.project
          .dragPreview as VideoDragPreview;

        // check if any nodes are overlapping
        let rectOverlap = AppStore.project.rootNodes.find((node) => {
          return (
            originX < node.position.left + node.position.width &&
            originX + width > node.position.left &&
            originY < node.position.top + node.position.height &&
            originY + height > node.position.top
          );
        });
        if (rectOverlap) {
          AppStore.project.dragPreview.showPreviewNode = false;
        }
        return;
      } else {
        AppStore.project.dragPreview.showPreviewNode = false;
      }
      let originNode = AppStore.project.getOriginNode(
        overlappingNode?.id || ""
      ) as VideoEditorNode;
      let elementIds = [
        originNode.id,
        ...originNode.tracks.map((t) => t.id),
      ].flatMap((id) => [id, `${id}-pre`, `${id}-post`]);
      elementIds.forEach((id) => {
        let element = document.getElementById(id);
        if (!element) return;
        let rect = element.getBoundingClientRect();
        // check if mouse is inside getBoundingClientRect
        if (
          x > rect.left &&
          x < rect.right &&
          y > rect.top &&
          y < rect.bottom
        ) {
          let action = element.getAttribute("data-action");
          let index = element.getAttribute("data-index")
            ? parseInt(element.getAttribute("data-index") || "")
            : null;
          if (!action || index === null) return;
          if (action === "add-track") {
            if (index === originNode.tracks.length) {
              AppStore.project.setNode(originNode.id, {
                tracks: [
                  ...originNode.tracks.slice(0, Math.max(0, index - 1)),
                  { ...originNode.tracks[index - 1], highlightBelow: true },
                ],
              });
            } else {
              AppStore.project.setNode(originNode.id, {
                tracks: [
                  ...originNode.tracks.slice(0, Math.max(0, index)),
                  { ...originNode.tracks[index], highlightAbove: true },
                  ...originNode.tracks.slice(index + 1),
                ],
              });
            }
          }
        }
      });
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
      if (!canvas) throw Error("Canvas is null");
      const rect = canvas.getBoundingClientRect();
      AppStore.project.resetWithFork();
      // check if mouse is inside rect
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        throw "Mouse is not inside canvas";
      } else {
        let dragPreview = AppStore.project.dragPreview;
        if (!dragPreview) throw Error("Drag preview is null");
        let screen = AppStore.canvas.screen;
        let scale = AppStore.canvas.scale;
        let deltaX = (x - rect.left) / scale.x;
        let deltaY = (y - rect.top) / scale.y;
        let left = screen.left + deltaX;
        let top = screen.top + deltaY;
        let overlappingNode = AppStore.project.rootNodes.find((node) => {
          return (
            node.position.top < top &&
            node.position.top + node.position.height > top &&
            node.position.left < left &&
            node.position.left + node.position.width > left
          );
        });
        if (!overlappingNode) {
          // add video to canvas as another editor
          let left = dragPreview.originX;
          let top = dragPreview.originY;
          let width = dragPreview.width;
          let height = dragPreview.height;

          // check if any nodes are overlapping
          let rectOverlap = AppStore.project.rootNodes.find((node) => {
            return (
              left < node.position.left + node.position.width &&
              left + width > node.position.left &&
              top > node.position.top + node.position.height &&
              top + height < node.position.top
            );
          });
          if (rectOverlap) throw Error("Rect overlaps with another node");
          let node = createVideoEditorNodeFromVideoClip(
            generateId(),
            { top, left, width, height },
            { url: dragPreview.url, duration: dragPreview.duration }
          );
          AppStore.project.addVideoEditor(node.id, node);
        } else {
          let originNode = AppStore.project.getOriginNode(
            overlappingNode?.id || ""
          ) as VideoEditorNode;
          if (!overlappingNode || !originNode) {
            return;
          }
          let elementIds = [
            originNode.id,
            ...originNode.tracks.map((t) => t.id),
          ].flatMap((id) => [id, `${id}-pre`, `${id}-post`]);
          elementIds.forEach((id) => {
            let element = document.getElementById(id);
            if (!element) return;
            let rect = element.getBoundingClientRect();
            // check if mouse is inside getBoundingClientRect
            if (
              x > rect.left &&
              x < rect.right &&
              y > rect.top &&
              y < rect.bottom
            ) {
              let action = element.getAttribute("data-action");
              let index = element.getAttribute("data-index")
                ? parseInt(element.getAttribute("data-index") || "")
                : null;
              if (!action || index === null) return;
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
          });
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
