import { CanvasPosition } from "modules/core/Position";
import { FocusEvent, KeyboardEvent, MouseEvent } from "react";

export type NodeType = "textbox" | "video-editor";

export interface GenericNode {
  type: NodeType;
  title?: string;
  id: string;
  cacheKey: string;
  parent?: string;
  author: string;
  connections?: { id: string }[];
  children?: { id: string; type: NodeType }[];
}

export type Align = "left" | "center" | "right";
export type VerticalAlign = "top" | "center";

export type TextStyles =
  | "none"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4";

export interface TextboxNode extends GenericNode {
  type: "textbox";
  position: CanvasPosition;
  align: Align;
  vertical: VerticalAlign;
  text: string;
  selection?: [number, number];
  preText?: string;
  postText?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
  comments?: Comment[];
}

export interface GenericTrack {
  title?: string;
  id: string;
  cacheKey: string;
  parent?: string;
  index: number;
  tracks?: [];
  highlightAbove?: boolean;
  highlightBelow?: boolean;
}

export interface VideoTrack extends GenericTrack {
  type: "video";
  id: string;
  cacheKey: string;
  clips: (VideoClip | TextClip)[];
}

export interface GenericClip {
  start: number;
  end: number;
  hidden?: boolean;
  locked?: boolean;
  parent?: string;
  id: string;
  cacheKey: string;
}

export interface VideoClip extends GenericClip {
  type: "video-clip";
  url: string;
  clipStart: number;
  clipEnd: number;
}

export interface TextClip extends GenericClip {
  type: "text-clip";
  size: number;
  color: string;
  text: string;
}

export type TrackClip = VideoClip | TextClip;

export interface VideoEditorNode extends GenericNode {
  type: "video-editor";
  position: CanvasPosition;
  tracks: VideoTrack[];
}

export interface PreviewNode {
  type: "preview";
  id: string;
}

export type RootNode = TextboxNode | VideoEditorNode;
export type Node = RootNode;

export type AllEventTypes =
  | FocusEvent<HTMLDivElement>
  | KeyboardEvent<HTMLDivElement>
  | MouseEvent<HTMLDivElement>;

export type DragPreview = {
  showPreviewNode: boolean;
  duration: number;
  originX: number;
  originY: number;
  // rendered values set by the preview node
  height: number;
  width: number;
};

export type VideoDragPreview = {
  type: "video";
  url: string;
} & DragPreview;

export type TextDragPreview = {
  type: "text";
  size: number;
  text: string;
} & DragPreview;

export type MonitorState = "playing" | "paused";
