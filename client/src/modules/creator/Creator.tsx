import useRenderLoop from "modules/core/RenderLoop";
import { memo, useEffect, useRef } from "react";
import SourcePanel from "./SourcePanel/SourcePanel";
import CanvasRoot from "./CanvasRoot";
import AppStore from "modules/state/AppStore";
import { calculateVideoElementDimensions } from "./nodes/VideoEditorElement";
import { createVideoEditorNodeFromVideoClip } from "./utils/VideoEditorUtils";
import { generateId } from "modules/core/project-utils";

export const Creator = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const frame = useRenderLoop();

  useEffect(() => {
    if (!canvas.current) return;
    AppStore.canvas.ref = canvas.current;
  }, [canvas]);

  useEffect(() => {
    if (AppStore.project.rootNodes.length > 0) return;
    let url =
      "https://www.shutterstock.com/shutterstock/videos/1080319025/preview/stock-footage-abstract-tech-earth-globalization-in-d-motion-graphic-concept-transmit-ai-networking-on-fiber.mp4";
    let { width: w, height: h } = calculateVideoElementDimensions([
      { clips: [{ start: 0, end: 20, url }] },
    ]);
    let node = createVideoEditorNodeFromVideoClip(
      generateId(),
      { top: 1200, left: 900, width: w, height: h },
      {
        url: url,
        duration: 20,
      }
    );
    AppStore.project.addVideoEditor(node.id, node);
  }, []);

  return (
    <div className="w-full h-full relative flex">
      <div className="w-[350px] border-r border-r-slate-600">
        <SourcePanel />
      </div>
      <div className="flex-1 text-black" ref={canvas}>
        <CanvasRoot />
      </div>
    </div>
  );
};

export default memo(Creator);
