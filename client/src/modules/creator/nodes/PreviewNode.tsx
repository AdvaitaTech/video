import { ScreenPosition } from "modules/core/Position";
import { VideoDragPreview } from "modules/state/project/ProjectTypes";
import { memo } from "react";

const PreviewNode = ({
  dragPreview,
  screen,
}: {
  dragPreview: VideoDragPreview | null;
  screen: ScreenPosition;
}) => {
  console.log("dragPreview", dragPreview);
  if (!dragPreview || !dragPreview.showPreviewNode) return null;

  if (dragPreview.type === "video") {
    let width = 400;
    let height = 300;
    console.log(
      "left top",
      dragPreview.originX,
      dragPreview.originY,
      dragPreview.originX - width / 2,
      dragPreview.originY - height / 2
    );
    return (
      <div
        className="absolute rounded border-2 border-dashed bg-white"
        style={{
          left: `${dragPreview.originX - width / 2 - screen.left}px`,
          top: `${dragPreview.originY - height / 2 - screen.top}px`,
          width,
          height,
        }}
      ></div>
    );
  } else return null;
};

export default memo(PreviewNode);
