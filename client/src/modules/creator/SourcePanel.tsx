import { PIXELS_PER_SECOND } from "modules/core/constants";
import AppStore from "modules/state/AppStore";
import { RefObject, memo, useRef } from "react";
import { createVideoEditorNodeFromVideoClip } from "./utils/VideoEditorUtils";
import { generateId } from "modules/core/project-utils";
import { calculateVideoElementDimensions } from "./nodes/VideoEditorElement";
import { VideoDragPreview } from "modules/state/project/ProjectTypes";

const getSourcePanelMouseEvents = (videoRef: RefObject<HTMLVideoElement>) => {
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
      // check if mouse is inside rect
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      } else {
        let dragPreview = AppStore.project.dragPreview;
        if (!dragPreview) throw Error("Drag preview is null");
        let left = dragPreview.originX;
        let top = dragPreview.originY;
        let width = dragPreview.width;
        let height = dragPreview.height;
        let node = createVideoEditorNodeFromVideoClip(
          generateId(),
          { top, left, width, height },
          { url: dragPreview.url, duration: dragPreview.duration }
        );
        AppStore.project.addVideoEditor(node.id, node);
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
      document.addEventListener("mousemove", onDocumentMouseMove);
      document.addEventListener("mouseup", onDocumentMouseUp);
      e.stopPropagation();
    },
  };
};

const SourcePanelVideo = ({ name, url }: { name: string; url: string }) => {
  let videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div {...getSourcePanelMouseEvents(videoRef)}>
      <video src={url} ref={videoRef}></video>
      <div className="text-md text-primary-900">{name}</div>
    </div>
  );
};

export const SourcePanel = () => {
  const videos = [
    {
      name: "Tech World",
      url: "https://www.shutterstock.com/shutterstock/videos/1080319025/preview/stock-footage-abstract-tech-earth-globalization-in-d-motion-graphic-concept-transmit-ai-networking-on-fiber.mp4",
    },

    {
      url: "https://www.shutterstock.com/shutterstock/videos/1076215751/preview/stock-footage-happy-diverse-business-people-office-workers-team-standing-in-row-looking-at-camera-multiethnic.mp4",
      name: "Coworkers",
    },
    {
      name: "Girl Typing",
      url: "https://www.shutterstock.com/shutterstock/videos/1103439217/preview/stock-footage-focused-business-woman-typing-at-modern-laptop-in-office-interior-close-up-attractive-young-girl.mp4",
    },
    {
      name: "Mountains",
      url: "https://www.shutterstock.com/shutterstock/videos/1064110957/preview/stock-footage-the-himalayas-everest-beautiful-mountain-range-winter-inspiring-landscape-snow-cold-sea-of-clouds.mp4",
    },
  ];

  return (
    <div className="w-full h-full p-5 bg-background">
      <h3 className="text-md font-bold text-primary-900">Add a Video</h3>
      <div className="flex flex-wrap flex-row gap-5 pt-5">
        {videos.map((video, index) => (
          <SourcePanelVideo name={video.name} url={video.url} key={index} />
        ))}
      </div>
    </div>
  );
};

export default memo(SourcePanel);
