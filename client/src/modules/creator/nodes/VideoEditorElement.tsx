import { ScreenPosition } from "modules/core/Position";
import { VideoEditorNode } from "modules/state/project/ProjectTypes";
import { memo, useRef } from "react";
import { Position } from "modules/core/Position";

const VideoEditorElement = ({
  node,
  selected,
  cacheKey,
  screen,
}: {
  node: VideoEditorNode;
  screen: ScreenPosition;
  selected?: boolean;
  cacheKey: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Position screen={screen} {...node.position}>
      <div
        ref={ref}
        id={node.id}
        data-id={node.id}
        className="flex flex-col border-2 rounded-lg w-full h-full select-none p-2 z-10 bg-white"
      ></div>
    </Position>
  );
};

export default memo(VideoEditorElement);
