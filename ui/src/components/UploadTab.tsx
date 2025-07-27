import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ShoppingBag, Gift, Coffee, X, Loader2, CheckCircle } from "lucide-react";

// Mock Button and Card if not available
const MockButton = ({ className, children, ...props }) => (
  <button
    className={`${className} inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
    {...props}
  >
    {children}
  </button>
);

const MockCard = ({ className, children, ...props }) => (
  <div className={`${className} rounded-lg border bg-card text-card-foreground shadow-sm`} {...props}>
    {children}
  </div>
);

const FinalButton = MockButton;
const FinalCard = MockCard;

const recentTransactions = [
  {
    id: 1,
    vendor: "Whole Foods Market",
    date: "Today, 2:30 PM",
    amount: "$42.68",
    category: "Groceries",
    icon: ShoppingBag,
    color: "bg-green-500",
    paymentMethod: "••••1234"
  },
  {
    id: 2,
    vendor: "Starbucks Coffee",
    date: "Today, 8:45 AM",
    amount: "$5.75",
    category: "Coffee & Dining",
    icon: Coffee,
    color: "bg-pink-500",
    paymentMethod: "••••1234"
  },
  {
    id: 3,
    vendor: "Amazon Purchase",
    date: "Yesterday, 6:20 PM",
    amount: "$28.99",
    category: "Online Shopping",
    icon: Gift,
    color: "bg-purple-500",
    paymentMethod: "••••5678"
  }
];

interface User {
  name: string;
  email: string;
  picture: string;
}

interface UserProps {
  user : User
}

export default function UploadTab({user }: UserProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  console.log(Date.now())
  const startCamera = async () => {
    setError('');
    setUploadSuccess(false);
    setCapturedImage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera access.");
      setIsCameraOpen(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access denied. Please allow camera permissions.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera found.");
      } else {
        setError("Could not access the camera.");
      }
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      setError("Camera not ready for capture.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setIsCameraOpen(false);
    setCapturedImage(dataUrl);
    setIsUploading(true);

    try {
      const payload = {
        image: dataUrl,
        timestamp: new Date().toISOString(),
        userId: "userId",
      };

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      setUploadSuccess(true);
      setError('');
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload image: ${err.message || 'Unknown error'}`);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhotoButtonClick = () => {
    setIsCameraOpen(true);
    startCamera();
  };

  const handleCloseCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedImage(null);
    setUploadSuccess(false);
    setIsUploading(false);
    setError('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);


  const handleImportGallery =()=>{
    alert("This feature is in development!")
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="pt-20 pb-24 px-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FinalButton
              onClick={handleTakePhotoButtonClick}
              className="h-16 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl flex-col gap-2 shadow-md"
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm font-medium">Take Photo</span>
            </FinalButton>

            <FinalButton               
            onClick={handleImportGallery}
            variant="outline" 
            className="h-16 border-2 border-blue-200 hover:bg-blue-50 rounded-2xl flex-col gap-2">
              <Upload className="h-6 w-6 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">Import Gallery</span>
            </FinalButton>
          </div>

          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center text-xs break-words">
            Your Mail ID: <span className="font-mono font-semibold">{user.email}</span>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm flex items-center justify-center gap-2">
              <X className="h-5 w-5" /> {error}
            </div>
          )}

          {isUploading && (
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg text-center text-sm flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Uploading image...
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" /> Image uploaded successfully!
            </div>
          )}

          {capturedImage && !isUploading && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Captured Image Preview:</h3>
              <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-lg object-contain border border-gray-300" />
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            {recentTransactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <FinalCard key={transaction.id} className="p-4 border-0 shadow-sm bg-white rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${transaction.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{transaction.vendor}</h3>
                        <span className="font-bold text-lg text-gray-900 ml-auto">{transaction.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap">
                        <span className="truncate">{transaction.category}</span>
                        <span className="ml-auto">{transaction.paymentMethod}</span>
                      </div>
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                    </div>
                  </div>
                </FinalCard>
              );
            })}
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={handleCloseCamera}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-gray-800 bg-opacity-50"
              aria-label="Close camera"
            >
              <X className="h-6 w-6" />
            </button>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain rounded-lg"
              />
            {!isUploading && stream && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <FinalButton
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg"
                >
                  Capture Photo
                </FinalButton>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
