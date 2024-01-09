import useRenderLoop from "modules/core/RenderLoop";
import { memo } from "react";
import SourcePanel from "./SourcePanel";

export const Creator = () => {
  const frame = useRenderLoop();

  return (
    <div className="w-full h-full relative flex">
      <div className="w-[350px] border-right border-r-gray-700">
        <SourcePanel />
      </div>
      <div className="flex-1 bg-yellow-500 text-black"></div>
    </div>
  );
};

export default memo(Creator);
