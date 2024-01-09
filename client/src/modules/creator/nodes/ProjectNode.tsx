import { ScreenPosition } from "modules/core/Position";
import { Node } from "modules/state/project/ProjectTypes";
import { memo } from "react";

const ProjectNode = ({
  node,
  selected,
  cacheKey,
  screen,
  viewOnly,
}: {
  node: Node;
  selected: boolean;
  cacheKey: string;
  screen: ScreenPosition;
  viewOnly?: boolean;
}) => {
  if (node.type === "textbox") {
    return <div></div>;
  } else if (node.type === "mergebox") {
    return <div></div>;
  }
  return null;
};

export default memo(ProjectNode);
