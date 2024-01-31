import {
  BaseTexture,
  MIPMAP_MODES,
  Sprite,
  Texture,
  VideoResource,
} from "pixi.js";
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
  videoElement: HTMLVideoElement | null = null;

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
      const video = document.createElement("video");
      video.src = this.src;
      video.removeAttribute("autoplay");
      video.autoplay = false;
      video.currentTime = 1;
      video.pause();
      video.setAttribute("crossorigin", "anonymous");
      const texture = Texture.from(video, {
        resourceOptions: {
          autoPlay: false,
        },
      });
      video.addEventListener("seeked", () => {
        texture.update();
      });
      texture.update();

      // create a new Sprite using the video texture (yes it's that easy)
      this.videoSprite = new Sprite(texture);

      // Stetch the fullscreen
      this.videoSprite.width = this.width;
      this.videoSprite.height = this.height;

      canvas.addChild(this.videoSprite);
      this.videoElement = video;
    } else {
      const video = this.videoElement;
      if (!video) return;
      video.currentTime = this.time;
      this.videoSprite.x = this.origin[0];
      this.videoSprite.y = this.origin[1];
      this.videoSprite.width = this.width;
      this.videoSprite.height = this.height;
    }
  }

  destroyLeaf(canvas: RenderCanvas) {
    this.videoElement?.remove();
    if (this.videoSprite) canvas.removeChild(this.videoSprite);
    this.videoSprite?.destroy();
  }
}
