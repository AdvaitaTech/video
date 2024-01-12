import { CanvasPosition } from "modules/core/Position";
import { generateId } from "modules/core/project-utils";
import {
  VideoClip,
  VideoEditorNode,
  VideoTrack,
} from "modules/state/project/ProjectTypes";

export function createVideoEditorNodeFromVideoClip(
  id: string,
  position: CanvasPosition,
  clip: {
    url: string;
    duration: number;
  }
): VideoEditorNode {
  let videoClip: VideoClip = {
    id: generateId(),
    cacheKey: "",
    type: "video-clip",
    url: clip.url,
    start: 0,
    end: clip.duration,
    clipStart: 0,
    clipEnd: clip.duration,
  };
  let track: VideoTrack = {
    id: generateId(),
    type: "video",
    index: 1,
    cacheKey: "",
    clips: [videoClip],
  };

  return {
    id,
    position,
    type: "video-editor",
    children: [],
    cacheKey: "",
    author: "",
    tracks: [track],
  };
}

export function showTime(time: number): string {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}
