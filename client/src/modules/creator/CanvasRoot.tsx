import useRenderLoop from "modules/core/RenderLoop";
import AppStore from "modules/state/AppStore";
import useSize from "@react-hook/size";
import { RefObject, memo, useEffect, useRef } from "react";
import ProjectNode from "./nodes/ProjectNode";
import { generateId } from "modules/core/project-utils";
import { createVideoEditorNodeFromVideoClip } from "./utils/VideoEditorUtils";
import PreviewNode from "./nodes/PreviewNode";
import VideoEditorElement, {
  calculateVideoElementDimensions,
} from "./nodes/VideoEditorElement";
import TextboxElement from "./nodes/TextboxElement";

const CANVAS_TOP = 0;
const CANVAS_LEFT = 350;

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
      {nodes.map((node, index) => {
        if (node.type === "textbox") {
          return (
            <TextboxElement
              key={node.id}
              screen={screen}
              node={node}
              cacheKey={node.cacheKey}
            />
          );
        } else if (node.type === "video-editor") {
          let monitor = AppStore.project.getMonitorState(node.id);
          return (
            <VideoEditorElement
              key={node.id}
              screen={screen}
              node={node}
              cacheKey={node.cacheKey}
              monitorState={monitor.state}
              monitorTime={monitor.time}
            />
          );
        }
      })}
      <PreviewNode screen={screen} dragPreview={dragPreview} />
    </div>
  );
};

const wheelListener = (e: WheelEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const friction = 1;
  const event = e as WheelEvent;
  const deltaX = event.deltaX * friction;
  const deltaY = event.deltaY * friction;
  if (!event.ctrlKey) {
    AppStore.canvas.moveCamera(deltaX, deltaY);
  } else {
    AppStore.canvas.zoomCamera(deltaX, deltaY);
  }
};

const pointerMoveListener = (e: PointerEvent) => {
  const clientX = e.clientX - CANVAS_LEFT;
  const clientY = e.clientY - CANVAS_TOP;
  AppStore.canvas.movePointer(clientX, clientY);
};

export const CanvasRoot = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(canvas);
  useEffect(() => {
    if (width === 0 || height === 0) return;
    AppStore.canvas.initialize(width, height);
  }, [width, height]);
  const frame = useRenderLoop();

  useEffect(() => {
    if (!canvas.current) return;
    canvas.current.addEventListener("wheel", wheelListener, { passive: false });
    canvas.current.addEventListener("pointermove", pointerMoveListener);

    return () => {
      canvas.current?.removeEventListener("wheel", wheelListener);
      canvas.current?.removeEventListener("pointermove", pointerMoveListener);
    };
  }, [canvas]);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div
        className="relative overflow-hidden overscroll-none bg-background flex-1"
        ref={canvas}
      >
        <InfiniteCanvas frame={frame}></InfiniteCanvas>
      </div>
    </div>
  );
};

export default memo(CanvasRoot);
