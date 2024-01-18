import { Application } from "pixi.js";
import { RefObject, memo, useEffect } from "react";

export const Monitor = ({
  containerRef,
}: {
  id: string;
  containerRef: RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    console.log("is container", containerRef.current);
    if (!containerRef.current) return;
    const app = new Application({
      background: "#ffffff",
      resizeTo: containerRef.current,
    });
    containerRef.current.appendChild(app.view as any);

    return () => {
      containerRef.current?.removeChild(app.view as any);
      app.destroy();
    };
  }, []);

  return null;
};

export default memo(Monitor);
