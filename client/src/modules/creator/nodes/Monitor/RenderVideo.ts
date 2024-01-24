import { VideoClip } from "modules/state/project/ProjectTypes";
import { Assets, Container, Sprite, Texture } from "pixi.js";

export const renderVideo = (clip: VideoClip, time: number) => {
  let asset = Assets.load<Texture>(clip.url);
  let vid = Assets.cache.get(clip.url);
  // console.log("has vid?", vid);
  let container = new Container();
  // let sprite = new Sprite(asset.texture);
  return container;
};
