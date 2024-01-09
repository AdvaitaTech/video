import useRenderLoop from "modules/core/RenderLoop";
import { memo } from "react";
import SourcePanel from "./SourcePanel";
import CanvasRoot from "./CanvasRoot";

export const Creator = () => {
  const frame = useRenderLoop();

  return (
    <div className="w-full h-full relative flex">
      <div className="w-[350px] border-r border-r-gray-500">
        <SourcePanel />
      </div>
      <div className="flex-1 text-black">
        <CanvasRoot />
      </div>
    </div>
  );
};

export default memo(Creator);
