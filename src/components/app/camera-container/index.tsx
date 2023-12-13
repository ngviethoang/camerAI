'use client';

import { Button } from '@/components/ui/button';
import { APP_MODES } from '@/const';
import useAppStore from '@/store';
import {
  AppWindowIcon,
  FileVideoIcon,
  FlipHorizontalIcon,
  ImageIcon,
  ImagePlusIcon,
  SwitchCameraIcon,
  VideoIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import CaptureButton from '../capture-result';
import { Settings } from '../settings';
import './index.css';
import CaptureResult from '../capture-result';

export default function CameraContainer() {
  const {
    mode,
    setMode,
    cameraMode,
    setCameraMode,
    setWebcamImageSrc,
    setWebcamVideo,
    setIsCapturedWindowOpen,
  } = useAppStore();

  const webcamRef = useRef<Webcam>(null);

  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({
      width: window.innerWidth,
      height: window.innerHeight,
      facingMode: 'environment',
    });
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [mirrored, setMirrored] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder>();
  const [capturing, setCapturing] = useState(false);

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput')),
    [setDevices]
  );

  useEffect(() => {
    return () => {
      setIsCapturedWindowOpen(false);
    };
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('enumerateDevices() not supported.');
      return;
    }
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setVideoConstraints({ ...videoConstraints, width, height });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoConstraints]);

  const selectFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    if (cameraMode === 'photo') {
      input.accept = 'image/*';
    } else {
      input.accept = 'video/*';
    }
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || !files.length) return;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (cameraMode === 'photo') {
          setWebcamImageSrc(reader.result as string);
        } else {
          setWebcamVideo({
            url: reader.result as string,
            name: file.name,
          });
        }
        setIsCapturedWindowOpen(true);
      };
    };
    input.click();
  }, [setWebcamImageSrc, setIsCapturedWindowOpen]);

  const handleDataAvailable = useCallback(
    ({ data }: any) => {
      if (data.size > 0) {
        const newVideo = {
          url: URL.createObjectURL(
            new Blob([data], {
              type: 'video/webm',
            })
          ),
          name: `capture_${new Date().getTime()}.webm`,
        };
        setWebcamVideo(newVideo);
        setIsCapturedWindowOpen(true);
      }
    },
    [setWebcamVideo, setIsCapturedWindowOpen]
  );

  const handleStartCaptureVideo = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.stream) {
      console.error('webcamRef.current.stream is null', webcamRef.current);
      return;
    }
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    if (!mediaRecorderRef.current) {
      console.error('mediaRecorderRef.current is null');
      return;
    }
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const capture = useCallback(() => {
    if (cameraMode === 'photo') {
      const imageSrc = webcamRef.current?.getScreenshot();
      setWebcamImageSrc(imageSrc);
      setIsCapturedWindowOpen(true);
    } else {
      if (capturing) {
        handleStopCaptureClick();
      } else {
        handleStartCaptureVideo();
      }
    }
  }, [
    webcamRef,
    cameraMode,
    capturing,
    setWebcamImageSrc,
    setIsCapturedWindowOpen,
    handleStopCaptureClick,
    handleStartCaptureVideo,
  ]);

  return (
    <div className="w-full h-full grid overlap-grid">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        audio={true}
        muted={true}
        disablePictureInPicture={true}
        mirrored={mirrored}
        videoConstraints={videoConstraints}
      />
      <div className="w-screen h-screen flex flex-col justify-between z-10">
        <div className="flex justify-end py-3 text-white">
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => setMirrored(!mirrored)}
          >
            <FlipHorizontalIcon />
          </Button>
          {!!devices.length && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => {
                setDeviceIndex((deviceIndex + 1) % devices.length);
                setVideoConstraints({
                  ...videoConstraints,
                  deviceId: devices[deviceIndex].deviceId,
                });
              }}
            >
              <SwitchCameraIcon />
            </Button>
          )}
          {cameraMode === 'photo' && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => setCameraMode('video')}
            >
              <VideoIcon />
            </Button>
          )}
          {cameraMode === 'video' && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => setCameraMode('photo')}
            >
              <ImageIcon />
            </Button>
          )}
          <Settings />
        </div>
        <div className="flex flex-col justify-center gap-3 py-4">
          <div className="flex justify-center gap-1 overflow-hidden">
            {APP_MODES.map(({ label, value }) => (
              <Button
                key={value}
                variant={'ghost'}
                size={'sm'}
                className={`hover:bg-transparent hover:text-yellow-400 ${
                  mode === value ? 'text-yellow-400' : 'text-white'
                }`}
                onClick={() => setMode(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex justify-around items-center gap-4 text-white">
            <Button
              size={'icon'}
              variant={'ghost'}
              className="rounded-full "
              onClick={selectFile}
            >
              {cameraMode === 'photo' ? <ImagePlusIcon /> : <FileVideoIcon />}
            </Button>
            <Button
              className={`w-14 h-14 rounded-full border-4 border-solid ${
                cameraMode === 'photo'
                  ? 'bg-white border-slate-400'
                  : capturing
                  ? 'bg-white border-white '
                  : 'bg-red-500 border-white'
              }`}
              onClick={capture}
            >
              {cameraMode === 'video' && capturing && (
                <span className="w-4 h-4 rounded bg-red-500"></span>
              )}
            </Button>
            <Button
              size={'icon'}
              variant={'ghost'}
              className="rounded-full"
              onClick={() => setIsCapturedWindowOpen(true)}
            >
              <AppWindowIcon />
            </Button>
          </div>
        </div>
      </div>
      <CaptureResult />
    </div>
  );
}
