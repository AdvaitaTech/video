import { TrackClip } from "modules/state/project/ProjectTypes";
import { Assets, Resource, Texture } from "pixi.js";

export type GenericAsset = {
  state: "loading" | "loaded" | "error";
};

export type VideoAsset = {
  type: "video";
};

type Asset = VideoAsset;

export class AssetManager {
  static assets: Map<string, Asset> = new Map<string, Asset>();

  static haveAssetsLoaded(clips: TrackClip[]) {
    for (let i = 0; i < clips.length; i++) {
      let clip = clips[i];
      if (clip.type === "video-clip") {
        let a = this.assets.has(clip.url);
        if (!a) return false;
      }
    }
    return true;
  }
}
