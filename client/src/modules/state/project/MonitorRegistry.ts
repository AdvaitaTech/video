import AppStore from "../AppStore";
import { MonitorState, VideoEditorNode } from "./ProjectTypes";

export type MonitorNode = {
  id: string;
  time: number;
  fps: number;
  state: MonitorState;
  timerId?: number;
  _lastFrameTime?: number;
};

export class MonitorRegistry {
  monitors = new Map<string, MonitorNode>();

  addMonitor(id: string, time: number) {
    this.monitors.set(id, { id, time, fps: 30, state: "paused" });
  }

  private onTick(id: string) {
    let node = AppStore.project.getNode(id) as VideoEditorNode | null;
    let monitor = this.monitors.get(id);
    if (!node || !monitor || !monitor._lastFrameTime) return;
    let delta = (performance.now() - monitor._lastFrameTime) / 1000;
    let max = node.tracks
      .flatMap((track) => track.clips)
      .reduce((acc, clip) => {
        return Math.max(clip.end, acc);
      }, 0);
    if (monitor.time + delta < max) {
      monitor._lastFrameTime = performance.now();
      monitor.time += delta;
      console.log("playing", monitor.time);
      monitor.timerId = requestAnimationFrame(this.onTick.bind(this, id));
    } else {
      monitor.state = "paused";
    }
  }

  playMonitor(id: string) {
    let monitor = this.monitors.get(id);
    if (!monitor) return;
    monitor.state = "playing";
    monitor._lastFrameTime = performance.now();
    monitor.timerId = requestAnimationFrame(this.onTick.bind(this, id));
  }

  seekMonitor(id: string, time: number) {}

  pauseMonitor(id: string) {}
}
