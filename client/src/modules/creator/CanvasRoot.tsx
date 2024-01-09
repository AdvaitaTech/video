import useRenderLoop from "modules/core/RenderLoop";
import AppStore from "modules/state/AppStore";
import useSize from "@react-hook/size";
import { getUiState } from "modules/state/ui/UiStore";
import { memo, useEffect, useRef } from "react";
import ProjectNode from "./nodes/ProjectNode";

const InfiniteCanvas = ({ frame }: { frame: string }) => {
  const scale = AppStore.canvas.scale;
  const screen = AppStore.canvas.screen;
  const nodes = AppStore.project.rootNodes;
  const { selectedNode: selected } = getUiState();
  const container = AppStore.canvas.container;
  const { x, y } = AppStore.canvas.pointer;

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
          selected={node.id === selected}
        ></ProjectNode>
      ))}
      {/* }<PreviewNode frame={frame} pointerX={x} pointerY={y} /> {*/}
    </div>
  );
};

export const CanvasRoot = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(canvas);
  useEffect(() => {
    if (width === 0 || height === 0) return;
    AppStore.canvas.initialize(width, height);
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
