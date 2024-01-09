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
}

export interface VideoTrack extends GenericTrack {
  type: "video" | "image";
  id: string;
  cacheKey: string;
  clips: VideoClip[];
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

export interface VideoEditorNode extends GenericNode {
  type: "video-editor";
  position: CanvasPosition;
  tracks: GenericTrack[];
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
