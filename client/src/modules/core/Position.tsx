import { PropsWithChildren } from "react";
import { inBounds } from "./math-utils";

export interface CanvasPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ScreenPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PositionProps extends CanvasPosition {
  screen: ScreenPosition;
}

export const Position = ({
  left,
  top,
  width,
  height,
  screen,
  children,
}: PropsWithChildren<PositionProps>) => {
  if (
    inBounds(
      { left, top, height, width },
      {
        left: screen.left,
        top: screen.top,
        width: screen.width,
        height: screen.height,
      }
    )
  ) {
    return (
      <div
        className="absolute inline-block z-10"
        style={{
          left: `${left - screen.left}px`,
          top: `${top - screen.top}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {children}
      </div>
    );
  } else return null;
};
