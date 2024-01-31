import AppStore from "modules/state/AppStore";
import { TrackClip, VideoClip } from "modules/state/project/ProjectTypes";
import { Application, Container, Graphics } from "pixi.js";
import { RefObject, memo, useEffect } from "react";
import { renderVideo } from "./RenderVideo";
import { AssetManager } from "./AssetManager";
import { RenderCanvas, RootWidget } from "modules/render-engine/Foundation";
import { VideoWidget } from "modules/render-engine/widgets/VideoWidget";

const renderClips = (
  container: Container,
  clips: TrackClip[],
  time: number
) => {
  for (let i = 0; i < clips.length; i++) {
    let clip = clips[i];
    if (clip.type === "video-clip") {
      let child = renderVideo(clip, time);
      container.addChild(child);
    }
  }
};

const renderLoader = (container: Container, height: number, width: number) => {
  const child = new Container();

  child.position = { x: width / 2 - 50, y: height / 2 - 50 };

  const halfCircle = new Graphics();

  halfCircle.beginFill(0xff0000);
  halfCircle.lineStyle(2, 0x000000);
  halfCircle.arc(0, 0, 100, 0, Math.PI);
  halfCircle.endFill();
  halfCircle.position.set(50, 50);

  const rectangle = new Graphics();

  rectangle.lineStyle(2, 0x000000, 1);
  rectangle.drawCircle(50, 50, 50);
  rectangle.endFill();
  rectangle.mask = halfCircle;
  // let now = Math.floor(performance.now() / 90);
  // let arc = 2 * Math.PI;
  // // console.log('arc', now, arc, now % arc)
  halfCircle.rotation = 0;

  child.addChild(rectangle);
  child.addChild(halfCircle);

  let phase = 0;
  return {
    spinLoader: (delta: number) => {
      phase += delta / 6;
      phase %= Math.PI * 2;

      halfCircle.rotation = phase;
    },
    showLoader: () => {
      container.addChild(child);
    },
    hideLoader: () => {
      container.removeChild(child);
    },
  };
};

export const Monitor = ({
  id,
  containerRef,
}: {
  id: string;
  containerRef: RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new Application({
      background: "#ffffff",
      resizeTo: containerRef.current,
      antialias: true,
    });
    let context = { width: 300, height: 553 };
    containerRef.current.appendChild(app.view as any);
    let root = new RootWidget(id);
    let rootElement = root.createElement(context);
    let rootCanvas = new RenderCanvas(app.stage);

    let counter = 0;
    app.ticker.add((delta) => {
      counter++;
      if (counter % 5 !== 0) {
        return;
      }
      rootElement.renderWidgets(rootCanvas, context, (c) => {
        const node = AppStore.project.getVideoEditorNode(id);
        const monitor = AppStore.project.getMonitorState(id);
        if (!node || !monitor) return [];

        let nodes = node.tracks
          .sort((a, b) => b.index - a.index)
          .flatMap((track) => track.clips)
          .filter(
            (clip) => clip.start <= monitor.time && clip.end >= monitor.time
          )
          .filter((clip) => clip.type === "video-clip")
          .map((clip) => {
            if (clip.type !== "video-clip")
              throw new Error("Invalid clip type");

            return new VideoWidget(
              clip.id,
              clip.url,
              [0, 0],
              300,
              533,
              monitor.time
            );
          });
        return nodes;
      });
    });

    // let { spinLoader, showLoader, hideLoader } = renderLoader(
    //   app.stage,
    //   300,
    //   553
    // );
    // app.ticker.add((delta) => {
    //   const node = AppStore.project.getVideoEditorNode(id);
    //   const monitor = AppStore.project.getMonitorState(id);
    //   if (!node || !monitor) return;
    //
    //   let nodes = node.tracks
    //     .sort((a, b) => b.index - a.index)
    //     .flatMap((track) => track.clips)
    //     .filter(
    //       (clip) => clip.start <= monitor.time && clip.end >= monitor.time
    //     );
    //
    //   let hasLoaded = AssetManager.haveAssetsLoaded(nodes);
    //   if (!hasLoaded) {
    //     showLoader();
    //     spinLoader(delta);
    //   } else {
    //     hideLoader();
    //     // renderClips(app.stage, nodes, monitor.time);
    //   }
    // });

    return () => {
      containerRef.current?.removeChild(app.view as any);
      app.destroy();
    };
  }, []);

  return null;
};

export default memo(Monitor);
