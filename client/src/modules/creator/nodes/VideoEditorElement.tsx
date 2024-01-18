import { ScreenPosition } from "modules/core/Position";
import {
  MonitorState,
  VideoEditorNode,
} from "modules/state/project/ProjectTypes";
import { memo, useRef } from "react";
import { Position } from "modules/core/Position";
import { PIXELS_PER_SECOND } from "modules/core/constants";
import PauseIcon from "@mui/icons-material/PauseRounded";
import PlayIcon from "@mui/icons-material/PlayArrowRounded";
import RewindIcon from "@mui/icons-material/FastRewindRounded";
import FastForwardIcon from "@mui/icons-material/FastForwardRounded";
import clsx from "clsx";
import { showTime } from "../utils/VideoEditorUtils";
import AppStore from "modules/state/AppStore";

type VideoEditorRow = {
  name: string;
  width: number;
  height: number;
  component: (props: {
    node: VideoEditorNode;
    monitorTime: number;
    monitorState: MonitorState;
  }) => JSX.Element;
};

const getVideoElementRows = (
  tracks: {
    clips: { start: number; end: number; url?: string; text?: string }[];
    id?: string;
    highlightAbove?: boolean;
    highlightBelow?: boolean;
  }[],
  id?: string
) => {
  let duration =
    tracks
      .flatMap((t) => t.clips)
      .reduce((acc, clip) => {
        return Math.max(acc, clip.end);
      }, 0) * 1.2;
  let paddingX = 15 * 2;
  let paddingY = 0;
  let width = duration * PIXELS_PER_SECOND + paddingX;
  let clip = tracks[0].clips[0];
  let rows: VideoEditorRow[] = [
    {
      name: "previewer",
      height: 300,
      width: width,
      component: () => {
        console.log("rendering video editor element");
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
      component: ({ node, monitorState, monitorTime }) => {
        return (
          <div className="w-full h-full py-[5px]">
            <div className="flex items-center justify-center">
              <button className="mr-2">
                <RewindIcon style={{ height: "30px", width: "30px" }} />
              </button>
              {monitorState === "playing" ? (
                <button
                  className="mr-2"
                  onClick={() => AppStore.project.pauseMonitor(node.id)}
                >
                  <PauseIcon style={{ height: "40px", width: "40px" }} />
                </button>
              ) : (
                <button
                  className="mr-2"
                  onClick={() => AppStore.project.playMonitor(node.id)}
                >
                  <PlayIcon style={{ height: "40px", width: "40px" }} />
                </button>
              )}
              <button className="mr-2">
                <FastForwardIcon style={{ height: "30px", width: "30px" }} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      name: "timescale",
      width: width,
      height: 30,
      component: () => {
        let ticks = new Array(Math.ceil(duration)).fill(0);
        return (
          <div className="h-full w-full border-t border-t-slate-500 px-[15px]">
            <div className="h-full w-full relative">
              {ticks.map((tick, index) => {
                let left = index * PIXELS_PER_SECOND;
                return (
                  <div
                    key={index}
                    className="absolute top-[0px]"
                    style={{ left: `${left}px` }}
                  >
                    <div
                      className={clsx("w-[1px] h-[5px] bg-slate-700", {
                        "h-[10px]": index % 2 === 0,
                        "h-[5px]": index % 2 !== 0,
                      })}
                    ></div>
                    {index % 2 === 0 && (
                      <div className="text-slate-900 text-sm ml-[-4px]">
                        {showTime(index)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      },
    },
    {
      name: "tracks",
      width: width,
      height: Math.max(tracks.reduce((a, t) => a + 30 + 5, 0) + 5, 200),
      component: () => {
        return (
          <div
            className="w-full h-full flex flex-col"
            style={{
              padding: `0 ${paddingX / 2}px`,
            }}
          >
            <div
              id={`${id || ""}-pre`}
              data-action="add-track"
              data-index={0}
              className="flex-1 w-full"
            ></div>
            {tracks.map((track, index) => {
              return (
                <div key={index} className="w-full">
                  <div
                    id={`${track.id || ""}-pre`}
                    data-action="add-track"
                    data-index={index}
                    className={clsx("h-[5px] rounded-lg", {
                      "bg-secondary-400": track.highlightAbove,
                    })}
                  ></div>
                  <div
                    id={track.id || ""}
                    data-action="add-clip"
                    data-index="0"
                    className="h-[30px] bg-secondary-100 w-full relative rounded-sm"
                  >
                    {track.clips.map((clip, index) => {
                      if (clip.url) {
                        return (
                          <div
                            className="absolute bg-secondary-500 border-2 border-secondary-300 rounded-lg h-full"
                            key={index}
                            style={{
                              left: `${clip.start * PIXELS_PER_SECOND}px`,
                              right: `${
                                (duration - clip.end) * PIXELS_PER_SECOND
                              }px`,
                            }}
                          >
                            <div
                              key={index}
                              className="absolute right-[5px] top-[3px] bottom-[3px] w-[3px] bg-secondary-200 rounded cursor-col-resize"
                            ></div>
                            <div className="absolute left-[5px] top-[3px] bottom-[3px] w-[3px] bg-secondary-200 rounded cursor-col-resize"></div>
                            <div className="ml-[15px] text-white h-full flex items-center">
                              Video
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            className="absolute bg-tertiary-400 border-2 border-tertiary-300 rounded-lg h-full"
                            key={index}
                            style={{
                              left: `${clip.start * PIXELS_PER_SECOND}px`,
                              right: `${
                                (duration - clip.end) * PIXELS_PER_SECOND
                              }px`,
                            }}
                          >
                            <div
                              key={index}
                              className="absolute right-[5px] top-[3px] bottom-[3px] w-[3px] bg-tertiary-200 rounded cursor-col-resize"
                            ></div>
                            <div className="absolute left-[5px] top-[3px] bottom-[3px] w-[3px] bg-tertiary-200 rounded cursor-col-resize"></div>
                            <div className="ml-[15px] text-white h-full flex items-center">
                              Text
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                  {index === tracks.length - 1 ? (
                    <div
                      id={`${track.id || ""}-post`}
                      data-action="add-track"
                      data-index={index + 1}
                      className={clsx("h-[3px] my-[1px]", {
                        "bg-secondary-400": track.highlightBelow,
                      })}
                    ></div>
                  ) : null}
                </div>
              );
            })}
            <div
              id={`${id || ""}-post`}
              data-action="add-track"
              data-index={tracks.length}
              className="flex-1 w-full"
            ></div>
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
  let paddingX = 4;
  let paddingY = 4;
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
  monitorTime,
  monitorState,
}: {
  node: VideoEditorNode;
  screen: ScreenPosition;
  selected?: boolean;
  cacheKey: string;
  monitorState: MonitorState;
  monitorTime: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  let rows = getVideoElementRows(
    node.tracks.map((t) => ({
      clips: t.clips.map((c) => ({ start: c.start, end: c.end, url: c.url })),
      id: t.id,
      highlightAbove: t.highlightAbove,
      highlightBelow: t.highlightBelow,
    })),
    node.id
  );
  console.log("state is", monitorState, monitorTime);
  return (
    <Position screen={screen} {...node.position}>
      <div
        ref={ref}
        className="flex flex-col border-2 rounded-lg w-full h-full select-none z-10 bg-slate-100"
      >
        {rows.map((row) => {
          return (
            <div
              key={row.name}
              style={{
                width: row.width,
                height: row.height,
                overflow: "hidden",
              }}
            >
              {row.component({ node, monitorState, monitorTime })}
            </div>
          );
        })}
      </div>
    </Position>
  );
};

export default memo(VideoEditorElement);
