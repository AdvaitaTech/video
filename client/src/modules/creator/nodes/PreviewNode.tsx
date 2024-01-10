import useSize from "@react-hook/size";
import { ScreenPosition } from "modules/core/Position";
import { PIXELS_PER_SECOND } from "modules/core/constants";
import AppStore from "modules/state/AppStore";
import { VideoDragPreview } from "modules/state/project/ProjectTypes";
import { memo, useRef } from "react";

const VideoPreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: VideoDragPreview;
  screen: ScreenPosition;
}) => {
  let containerRef = useRef<HTMLDivElement>(null);
  let [width, height] = useSize(containerRef);
  console.log("preview dimensions", height, width);
  AppStore.project.dragPreview = {
    ...dragPreview,
    width,
    height,
  };

  return (
    <div
      ref={containerRef}
      className="absolute rounded border-2 border-dashed bg-white"
      style={{
        left: `${dragPreview.originX - screen.left}px`,
        top: `${dragPreview.originY - screen.top}px`,
      }}
    >
      <div style={{ height: `300px`, width: `800px` }}>Video</div>
    </div>
  );
};

const PreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: VideoDragPreview | null;
  screen: ScreenPosition;
}) => {
  if (!dragPreview || !dragPreview.showPreviewNode) return null;

  if (dragPreview.type === "video") {
    return <VideoPreviewNode dragPreview={dragPreview} screen={screen} />;
  } else return null;
};

export default memo(PreviewNode);
