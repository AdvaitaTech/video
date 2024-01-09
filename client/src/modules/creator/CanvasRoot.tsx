import useRenderLoop from "modules/core/RenderLoop";
import AppStore from "modules/state/AppStore";
import useSize from "@react-hook/size";
import { memo, useEffect, useRef } from "react";
import ProjectNode from "./nodes/ProjectNode";
import { generateId } from "modules/core/project-utils";
import { createVideoEditorNodeFromVideoClip } from "./utils/VideoEditorUtils";
import PreviewNode from "./nodes/PreviewNode";

const InfiniteCanvas = ({ frame }: { frame: number }) => {
  const scale = AppStore.canvas.scale;
  const screen = AppStore.canvas.screen;
  const nodes = AppStore.project.rootNodes;
  // const { selectedNode: selected } = getUiState();
  const container = AppStore.canvas.container;
  const { x, y } = AppStore.canvas.pointer;
  const dragPreview = AppStore.project.dragPreview;

  return (
    <div
      className="w-full h-full"
      style={{
        transform: `scale(${(scale.x, scale.y)})`,
        transformOrigin: "top left",
      }}
    >
      {nodes.map((node, index) => (
        <ProjectNode
          screen={screen}
          key={index}
          node={node}
          cacheKey={node.cacheKey}
          selected={false}
        ></ProjectNode>
      ))}
      <PreviewNode screen={screen} dragPreview={dragPreview} />
    </div>
  );
};

export const CanvasRoot = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(canvas);
  useEffect(() => {
    if (width === 0 || height === 0) return;
    AppStore.canvas.initialize(width, height);
    let node = createVideoEditorNodeFromVideoClip(
      generateId(),
      { top: 1400, left: 1400, width: 500, height: 500 },
      { url: "" }
    );
    AppStore.project.addTextbox(generateId(), {
      position: { top: 1200, left: 1200, width: 200, height: 100 },
      text: "Hello World",
    });
    AppStore.project.addVideoEditor(generateId(), node);
  }, [width, height]);
  const frame = useRenderLoop();

  return (
    <div className="w-full h-full relative flex flex-col">
      <div
        className="relative overflow-hidden overscroll-none bg-slate-100 flex-1"
        ref={canvas}
      >
        <InfiniteCanvas frame={frame}></InfiniteCanvas>
      </div>
    </div>
  );
};

export default memo(CanvasRoot);
