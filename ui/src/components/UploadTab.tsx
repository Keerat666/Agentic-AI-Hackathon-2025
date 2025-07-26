import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, ShoppingBag, Gift, Coffee, X, Loader2, CheckCircle } from "lucide-react";

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getDocs } from 'firebase/firestore';
// --- MOCK DATA & COMPONENTS (for standalone functionality) ---
import { collection, doc, setDoc } from "firebase/firestore"; 


// Mock for shadcn/ui Button if not available in environment
const MockButton = ({ className, children, ...props }) => (
  <button className={`${className} inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`} {...props}>
    {children}
  </button>
);

// Mock for shadcn/ui Card if not available in environment
const MockCard = ({ className, children, ...props }) => (
  <div className={`${className} rounded-lg border bg-card text-card-foreground shadow-sm`} {...props}>
    {children}
  </div>
);

// Use actual components if they exist, otherwise fall back to mocks
const FinalButton = typeof Button !== 'undefined' ? Button : MockButton;
const FinalCard = typeof Card !== 'undefined' ? Card : MockCard;


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

// --- MAIN COMPONENT ---
import db  from '../config';

export default function UploadTab() {
  // Camera and UI State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  // --- CAMERA CONTROLS ---

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions and try again.");
        setIsCameraOpen(false);
      }
    } else {
        setError("Your browser does not support camera access.");
        setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleTakePhotoClick = () => {
    if (!isAuthReady) {
        setError("Please wait for services to connect.");
        return;
    }
    setError('');
    setCapturedImage(null);
    setIsCameraOpen(true);
    startCamera();
  };

  const handleCloseCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedImage(null);
    setUploadSuccess(false);
    setIsUploading(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // --- FIREBASE UPLOAD ---

  const handleUpload = async () => {
    //trigger upload flow
  };

  // Effect to clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // --- RENDER ---
  const renderCameraModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <FinalButton variant="outline" onClick={handleCloseCamera} className="absolute top-4 right-4 bg-gray-800/50 text-white border-white/50 hover:bg-gray-700/70 hover:text-white rounded-full p-2 h-auto">
            <X className="h-6 w-6" />
        </FinalButton>

        <div className="w-full max-w-lg aspect-[3/4] bg-black rounded-2xl overflow-hidden relative flex items-center justify-center">
            {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="object-contain h-full w-full" />
            ) : (
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover"></video>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        <div className="mt-6 w-full max-w-lg text-center">
            {isUploading ? (
                <div className="flex flex-col items-center text-white space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Uploading...</p>
                </div>
            ) : uploadSuccess ? (
                <div className="flex flex-col items-center text-green-400 space-y-2">
                    <CheckCircle className="h-8 w-8" />
                    <p>Upload Complete!</p>
                </div>
            ) : (
                <div className="flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <FinalButton onClick={handleRetake} className="flex-1 h-14 bg-gray-600 hover:bg-gray-500 text-white rounded-xl text-base">Retake</FinalButton>
                            <FinalButton onClick={handleUpload} className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-base">Upload</FinalButton>
                        </>
                    ) : (
                        <FinalButton onClick={handleCapture} className="h-20 w-20 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center">
                            <div className="h-16 w-16 rounded-full bg-white"></div>
                        </FinalButton>
                    )}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20 pb-24 px-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-4">
            <FinalButton onClick={handleTakePhotoClick} className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex-col gap-2 shadow-md" style={{backgroundColor: '#1d4ed8', color: 'white'}}>
              <Camera className="h-6 w-6" />
              <span className="text-sm font-medium">Take Photo</span>
            </FinalButton>
            <FinalButton variant="outline" className="h-16 border-2 border-primary/20 hover:bg-primary/5 rounded-2xl flex-col gap-2">
              <Upload className="h-6 w-6 text-primary" style={{color: '#1d4ed8'}}/>
              <span className="text-sm font-medium text-primary" style={{color: '#1d4ed8'}}>Import Gallery</span>
            </FinalButton>
          </div>

          {/* Error Display */}
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">{error}</div>}

          {/* Recent transactions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            
            {recentTransactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <FinalCard key={transaction.id} className="p-4 border-0 shadow-sm bg-card rounded-2xl bg-white">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${transaction.color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{transaction.vendor}</h3>
                        <span className="font-bold text-lg">{transaction.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{transaction.date}</span>
                    </div>
                  </div>
                </FinalCard>
              );
            })}
          </div>
        </div>
      </div>
      {isCameraOpen && renderCameraModal()}
    </div>
  );
}
