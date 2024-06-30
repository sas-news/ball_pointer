import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [videoURL, setVideoURL] = useState("");
  const [imageURL, setImageURL] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameRate, setFrameRate] = useState(25);
  const [videoResolution, setVideoResolution] = useState({
    width: 0,
    height: 0,
  });
  const [originCoordinate, setOriginCoordinate] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [relativeCoordinates, setRelativeCoordinates] = useState<
    { x: number; y: number }[]
  >([]);
  const [secondCoordinate, setSecondCoordinate] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [distanceFromOrigin, setDistanceFromOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isLastFrame, setIsLastFrame] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
      setIsLastFrame(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        const video = videoRef.current;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        setImageURL(imageUrl);
      }
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", () => {
        const frameRate = 30;
        setFrameRate(frameRate);

        setVideoResolution({
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
        });

        videoElement.currentTime = 0;
      });

      videoElement.addEventListener("seeked", captureFrame);
    }
  }, [videoURL]);

  const goToNextFrame = () => {
    if (videoRef.current) {
      const nextFrameTime = videoRef.current.currentTime + 1 / frameRate;
      if (nextFrameTime >= videoRef.current.duration) {
        setIsLastFrame(true);
      } else {
        videoRef.current.currentTime = nextFrameTime;
        setIsLastFrame(false);
      }
    }
  };

  const handleImageClick = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!originCoordinate) {
      setOriginCoordinate({ x, y });
    } else if (!secondCoordinate) {
      setSecondCoordinate({ x, y });
      const distanceX = Math.abs(x - originCoordinate.x);
      const distanceY = Math.abs(y - originCoordinate.y);
      setDistanceFromOrigin({ x: distanceX, y: distanceY });
    } else {
      if (distanceFromOrigin) {
        const relativeX =
          ((x - originCoordinate.x) / distanceFromOrigin.x) * 25;
        const relativeY =
          ((y - originCoordinate.y) / distanceFromOrigin.y) * 25;
        setRelativeCoordinates([
          ...relativeCoordinates,
          { x: -relativeX, y: -relativeY },
        ]);
        goToNextFrame();
      }
    }
  };

  return (
    <>
      <h1>座標計算システム</h1>
      <input type="file" onChange={handleFileChange} />
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={videoResolution.width}
        height={videoResolution.height}
      ></canvas>
      <video
        ref={videoRef}
        src={videoURL}
        style={{ display: "none" }}
        controls
      />
      {imageURL && (
        <img
          src={imageURL}
          alt="Video frame"
          onClick={handleImageClick}
          style={{ width: "100vw", height: "auto" }}
        />
      )}
      {isLastFrame && <p>ビデオの最終フレームに達しました。</p>}
      {originCoordinate && (
        <table>
          <thead>
            <tr>
              <th>原点X座標</th>
              <th>原点Y座標</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{originCoordinate.x}</td>
              <td>{originCoordinate.y}</td>
            </tr>
          </tbody>
        </table>
      )}
      {secondCoordinate && (
        <table>
          <thead>
            <tr>
              <th>第2座標X</th>
              <th>第2座標Y</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{secondCoordinate.x}</td>
              <td>{secondCoordinate.y}</td>
            </tr>
          </tbody>
        </table>
      )}
      {distanceFromOrigin && (
        <div>
          <p>原点からのX距離: {distanceFromOrigin.x} メモリ</p>
          <p>原点からのY距離: {distanceFromOrigin.y} メモリ</p>
        </div>
      )}
      {relativeCoordinates.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>X座標</th>
              <th>Y座標</th>
            </tr>
          </thead>
          <tbody>
            {relativeCoordinates.map((coord, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{coord.x}</td>
                <td>{coord.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default App;
