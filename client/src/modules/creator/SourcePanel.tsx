import { memo } from "react";

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
    <div className="w-full h-full p-5">
      <h3 className="text-md font-bold">Add a Video</h3>
      <div className="flex flex-wrap flex-row gap-5 pt-5">
        {videos.map((video) => (
          <div>
            <video src={video.url}></video>
            <div className="text-md ">{video.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(SourcePanel);
