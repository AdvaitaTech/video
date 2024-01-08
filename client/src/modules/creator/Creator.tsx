import useRenderLoop from "modules/core/RenderLoop";
import { memo } from "react";
import SourcePanel from "./SourcePanel";

export const Creator = () => {
  const frame = useRenderLoop();

  return (
    <div className="w-full h-full relative flex">
      <div className="w-[30%] bg-green-500">
        <SourcePanel />
      </div>
      <div className="flex-1 bg-yellow-500 text-black">Canvas Root</div>
    </div>
  );
};

export default memo(Creator);
