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
import {
  PreviewAction,
  isMouseInsideCanvas,
  getOverlappingTrackIdOfNode,
  getMouseOverlappingNode,
  getMousePositionOnCanvas,
  getPreviewOverlappingNode,
  addHighlightToTrack,
  addTrackToNode,
} from "./SourcePanelEventHelpers";

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
              addTrackToNode(originNode.id, index, action, track);
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
