import { ScreenPosition } from "modules/core/Position";
import { Node } from "modules/state/project/ProjectTypes";
import { memo } from "react";
import TextboxElement from "./TextboxElement";
import VideoEditorElement from "./VideoEditorElement";

const ProjectNode = ({
  node,
  selected,
  cacheKey,
  screen,
}: {
  node: Node;
  selected: boolean;
  cacheKey: string;
  screen: ScreenPosition;
}) => {
  if (node.type === "textbox") {
    return <TextboxElement screen={screen} node={node} cacheKey={cacheKey} />;
  } else if (node.type === "video-editor") {
    return (
      <VideoEditorElement screen={screen} node={node} cacheKey={cacheKey} />
    );
  }
  return null;
};

export default memo(ProjectNode);
