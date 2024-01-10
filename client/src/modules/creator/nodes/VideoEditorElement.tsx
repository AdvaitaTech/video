import { ScreenPosition } from "modules/core/Position";
import { VideoEditorNode } from "modules/state/project/ProjectTypes";
import { memo, useRef } from "react";
import { Position } from "modules/core/Position";
import { PIXELS_PER_SECOND } from "modules/core/constants";
import PlayIcon from "@mui/icons-material/PlayArrowRounded";
import RewindIcon from "@mui/icons-material/FastRewindRounded";
import FastForwardIcon from "@mui/icons-material/FastForwardRounded";

const getVideoElementRows = (
  tracks: { clips: { start: number; end: number; url: string }[] }[]
) => {
  let width = tracks
    .flatMap((t) => t.clips)
    .reduce((acc, clip) => {
      return Math.max(acc, clip.end * PIXELS_PER_SECOND);
    }, 0);
  let clip = tracks[0].clips[0];
  let rows = [
    {
      name: "previewer",
      height: 300,
      width: width,
      component: () => {
        return (
          <div className="w-full h-full flex items-center py-[5px]">
            <video src={clip?.url} className="w-full h-full"></video>
          </div>
        );
      },
    },
    {
      name: "controls",
      width: width,
      height: 50,
      component: () => {
        return (
          <div className="w-full h-full py-[5px]">
            <div className="flex items-center justify-center">
              <button className="mr-2">
                <RewindIcon style={{ height: "30px", width: "30px" }} />
              </button>
              <button className="mr-2">
                <PlayIcon style={{ height: "40px", width: "40px" }} />
              </button>
              <button className="mr-2">
                <FastForwardIcon style={{ height: "30px", width: "30px" }} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      name: "tracks",
      width: width,
      height: tracks.reduce((a, t) => a + 50, 0),
      component: () => {
        return (
          <div className="w-full h-full">
            {tracks.map((track, index) => {
              return (
                <div key={index}>
                  <div className="h-[5px] border-[1px]"></div>
                  <div className="h-[40px] bg-blue-500 rounded"></div>
                  <div className="h-[5px] border-[1px]"></div>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];
  return rows;
};

export const calculateVideoElementDimensions = (
  tracks: { clips: { start: number; end: number; url: string }[] }[]
) => {
  let rows = getVideoElementRows(tracks);
  let paddingX = 5 * 2 + 4;
  let paddingY = 5 * 2 + 4;
  return rows.reduce(
    (acc, row) => ({
      height: acc.height + row.height,
      width: Math.max(acc.width, row.width + paddingX),
    }),
    { height: paddingY, width: 0 }
  );
};

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
  let rows = getVideoElementRows(
    node.tracks.map((t) => ({
      clips: t.clips.map((c) => ({ start: c.start, end: c.end, url: c.url })),
    }))
  );
  return (
    <Position screen={screen} {...node.position}>
      <div
        ref={ref}
        id={node.id}
        data-id={node.id}
        className="flex flex-col border-2 rounded-lg w-full h-full select-none p-[5px] z-10 bg-white"
      >
        {rows.map((row) => {
          return (
            <div
              key={row.name}
              style={{ width: row.width, height: row.height }}
            >
              {row.component()}
            </div>
          );
        })}
      </div>
    </Position>
  );
};

export default memo(VideoEditorElement);
