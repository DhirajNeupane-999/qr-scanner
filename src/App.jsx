import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const App = () => {
  const videoRef = useRef(null);
  const [qrData, setQrData] = useState('');
  const [track, setTrack] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    codeReader.current
      .decodeFromVideoDevice(null, videoRef.current, (result, err, controls) => {
        if (result) {
          setQrData(result.getText());
        } else if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      })
      .then((controls) => {
        if (controls?.stream) {
          const videoTrack = controls.stream.getVideoTracks()[0];
          setTrack(videoTrack);
        }
      });

    return () => {
      codeReader.current.reset();
    };
  }, []);

  const toggleFlash = async () => {
    if (!track) return;

    try {
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
        setFlashOn((prev) => !prev);
      } else {
        alert('Flashlight not supported on this device.');
      }
    } catch (error) {
      console.error('Failed to toggle flash:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const image = new Image();
    image.onload = async () => {
      try {
        const result = await codeReader.current.decodeFromImageElement(image);
        setQrData(result.getText());
      } catch (err) {
        alert('Failed to decode QR code from image.');
        console.error(err);
      }
    };

    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Fullscreen Video */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
        autoPlay
        muted
        playsInline
      />

      {/* Overlay Content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', textShadow: '0 0 10px black' }}>
          Scan QR Code to Pay
        </h1>

        {/* Scanner Box */}
        <div
          style={{
            width: '200px',
            height: '200px',
            border: '1px solid black',
            borderRadius: '12px',
            marginBottom: '30px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        ></div>

        {/* Flash Toggle */}
        <button
          onClick={toggleFlash}
          style={{
            border:"1px solid yellow",
            color: 'white', 
            background:'none',
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: '9999px',
            border: 'none',
            marginBottom: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          {flashOn ? 'Turn Flash Off' : 'Turn Flash On'}
        </button>

        {/* Upload Button */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{
            padding: '10px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            
            color: 'white',
            border: '1px solid black',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        />

        {/* QR Data Display */}
        {qrData && (
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#111827',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '80%',
              wordBreak: 'break-word',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontWeight: '600', marginBottom: '8px' }}>Scanned Data:</h2>
            <p>{qrData}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
