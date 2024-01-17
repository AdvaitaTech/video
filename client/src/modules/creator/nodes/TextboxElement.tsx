import { ScreenPosition } from "modules/core/Position";
import { TextboxNode } from "modules/state/project/ProjectTypes";
import { memo, useRef } from "react";
import { Position } from "modules/core/Position";

const TextElement = ({
  node,
  cacheKey,
}: {
  node: TextboxNode;
  cacheKey: string;
}) => {
  return (
    <div className="h-full w-full">
      <div className="text-md text-black">{node.text}</div>
    </div>
  );
};

const TextboxElement = ({
  node,
  selected,
  cacheKey,
  screen,
}: {
  node: TextboxNode;
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
      >
        <div>
          <TextElement node={node} cacheKey={cacheKey} />
        </div>
      </div>
    </Position>
  );
};

export default memo(TextboxElement);
