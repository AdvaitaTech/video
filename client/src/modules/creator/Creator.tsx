import useRenderLoop from "modules/core/RenderLoop";
import { memo, useEffect, useRef } from "react";
import SourcePanel from "./SourcePanel/SourcePanel";
import CanvasRoot from "./CanvasRoot";
import AppStore from "modules/state/AppStore";

export const Creator = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const frame = useRenderLoop();

  useEffect(() => {
    if (!canvas.current) return;
    AppStore.canvas.ref = canvas.current;
  }, [canvas]);

  return (
    <div className="w-full h-full relative flex">
      <div className="w-[350px] border-r border-r-slate-600">
        <SourcePanel />
      </div>
      <div className="flex-1 text-black" ref={canvas}>
        <CanvasRoot />
      </div>
    </div>
  );
};

export default memo(Creator);
