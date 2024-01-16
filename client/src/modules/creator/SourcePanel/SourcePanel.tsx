import { memo, useRef } from "react";
import { getSourcePanelMouseEvents } from "./SourcePanelEvents";

const SourcePanelVideo = ({ name, url }: { name: string; url: string }) => {
  let videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div {...getSourcePanelMouseEvents(videoRef)}>
      <video src={url} ref={videoRef}></video>
      <div className="text-md text-primary-900">{name}</div>
    </div>
  );
};

export const SourcePanelText = () => {
  let styles = [
    {
      name: "Heading",
      text: "Plain Heading",
      size: 32,
      height: 100,
      width: 200,
    },
    {
      name: "Subheading",
      text: "Plain Subheading",
      size: 24,
      height: 100,
      width: 150,
    },
    {
      name: "Paragraph",
      text: "Paragraph",
      size: 24,
      height: 300,
      width: 150,
    },
  ];

  return (
    <div className="flex flex-wrap flex-row gap-5 pt-5">
      {styles.map((style, index) => (
        <div key={index}>
          <div
            className="text-md text-primary-900 pl-2 pr-5 border rounded border-slate-600 ml-[-10px]"
            style={{
              fontSize: style.size,
            }}
          >
            {style.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SourcePanel = () => {
  const videos = [
    {
      name: "Tech World",
      url: "https://www.shutterstock.com/shutterstock/videos/1080319025/preview/stock-footage-abstract-tech-earth-globalization-in-d-motion-graphic-concept-transmit-ai-networking-on-fiber.mp4",
    },

    {
      url: "https://www.shutterstock.com/shutterstock/videos/1076215751/preview/stock-footage-happy-diverse-business-people-office-workers-team-standing-in-row-looking-at-camera-multiethnic.mp4",
      name: "Coworkers",
    },
    {
      name: "Girl Typing",
      url: "https://www.shutterstock.com/shutterstock/videos/1103439217/preview/stock-footage-focused-business-woman-typing-at-modern-laptop-in-office-interior-close-up-attractive-young-girl.mp4",
    },
    {
      name: "Mountains",
      url: "https://www.shutterstock.com/shutterstock/videos/1064110957/preview/stock-footage-the-himalayas-everest-beautiful-mountain-range-winter-inspiring-landscape-snow-cold-sea-of-clouds.mp4",
    },
  ];

  return (
    <div className="w-full h-full p-5 bg-background overflow-auto">
      <h3 className="text-md font-bold text-primary-900">Add a Video</h3>
      <div className="flex flex-wrap flex-row gap-5 pt-5">
        {videos.map((video, index) => (
          <SourcePanelVideo name={video.name} url={video.url} key={index} />
        ))}
      </div>
      <h3 className="text-md font-bold text-primary-900 mt-10">Add Text</h3>
      <SourcePanelText />
    </div>
  );
};

export default memo(SourcePanel);
