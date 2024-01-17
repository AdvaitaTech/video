import { ScreenPosition } from "modules/core/Position";
import {
  TextDragPreview,
  VideoDragPreview,
} from "modules/state/project/ProjectTypes";
import { memo } from "react";

const VideoPreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: VideoDragPreview;
  screen: ScreenPosition;
}) => {
  return (
    <div
      className="absolute rounded border-2 border-dashed bg-white"
      style={{
        left: `${dragPreview.originX - screen.left}px`,
        top: `${dragPreview.originY - screen.top}px`,
      }}
    >
      <div
        style={{
          height: `${dragPreview.height}px`,
          width: `${dragPreview.width}px`,
        }}
      ></div>
    </div>
  );
};

const TextPreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: TextDragPreview;
  screen: ScreenPosition;
}) => {
  return (
    <div
      className="absolute rounded border-2 border-dashed bg-white"
      style={{
        left: `${dragPreview.originX - screen.left}px`,
        top: `${dragPreview.originY - screen.top}px`,
      }}
    >
      <div
        style={{
          height: `${dragPreview.height}px`,
          width: `${dragPreview.width}px`,
        }}
      ></div>
    </div>
  );
};

const PreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: VideoDragPreview | TextDragPreview | null;
  screen: ScreenPosition;
}) => {
  if (!dragPreview || !dragPreview.showPreviewNode) return null;

  if (dragPreview.type === "video") {
    return <VideoPreviewNode dragPreview={dragPreview} screen={screen} />;
  } else if (dragPreview.type === "text") {
    return <TextPreviewNode dragPreview={dragPreview} screen={screen} />;
  } else return null;
};

export default memo(PreviewNode);
