import { ScrollArea } from '@/components/ui/scroll-area';
import useAppStore from '@/store';
import Image from 'next/image';
import { useState } from 'react';

export default function Replicate() {
  const {
    webcamImageSrc,
    setWebcamImageSrc,
    credentials,
    setIsCapturedWindowOpen,
    webcamVideo,
  } = useAppStore();

  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <ScrollArea className="h-full w-full">
        {webcamImageSrc && (
          <Image
            src={webcamImageSrc}
            width={window.innerWidth / 2}
            height={window.innerHeight / 2}
            alt=""
          />
        )}
        {webcamVideo && (
          <div>
            <video
              src={webcamVideo.url}
              width={window.innerWidth / 2}
              controls
            />
            <div>{webcamVideo.name}</div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
