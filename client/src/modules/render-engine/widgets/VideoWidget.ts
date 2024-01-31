import { Sprite, Texture, VideoResource } from "pixi.js";
import {
  BuildContext,
  LeafWidget,
  RenderCanvas,
  RenderLeaf,
  RenderObject,
} from "../Foundation";

export class VideoWidget extends LeafWidget {
  constructor(
    key: string,
    private src: string,
    private origin: [number, number],
    private height: number,
    private width: number,
    private time: number
  ) {
    super(key);
  }

  createRenderObject(context: BuildContext): VideoRenderObject {
    return new VideoRenderObject(
      this.src,
      this.origin,
      this.height,
      this.width,
      this.time
    );
  }

  updateRenderObject(render: VideoRenderObject, context: BuildContext) {
    if (
      render.origin[0] !== this.origin[0] ||
      render.origin[1] !== this.origin[1] ||
      render.height !== this.height ||
      render.width !== this.width ||
      render.time !== this.time
    ) {
      render.origin = this.origin;
      render.height = this.height;
      render.width = this.width;
      render.time = this.time;
      render.markNeedsPaint();
    }
  }
}

export class VideoRenderObject extends RenderLeaf {
  videoSprite: Sprite | null = null;

  constructor(
    public src: string,
    public origin: [number, number],
    public height: number,
    public width: number,
    public time: number
  ) {
    super();
  }

  paintLeaf(canvas: RenderCanvas, context: BuildContext) {
    if (!this.videoSprite) {
      const texture = Texture.from<VideoResource>(this.src);
      const video = texture.baseTexture.resource.source;
      video.autoplay = false;
      video.loop = false;
      video.currentTime = 1;
      video.pause();
      video.addEventListener("seeked", () => {
        texture.update();
      });

      // create a new Sprite using the video texture (yes it's that easy)
      this.videoSprite = new Sprite(texture);

      // Stetch the fullscreen
      this.videoSprite.width = this.width;
      this.videoSprite.height = this.height;

      canvas.addChild(this.videoSprite);
    } else {
      const video = (
        this.videoSprite.texture.baseTexture.resource as VideoResource
      ).source;
      video.currentTime = this.time;
      this.videoSprite.x = this.origin[0];
      this.videoSprite.y = this.origin[1];
      this.videoSprite.width = this.width;
      this.videoSprite.height = this.height;
    }
  }

  destroyLeaf(canvas: RenderCanvas) {
    if (this.videoSprite) canvas.removeChild(this.videoSprite);
    this.videoSprite?.destroy();
  }
}
