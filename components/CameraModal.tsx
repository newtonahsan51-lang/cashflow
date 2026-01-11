
import React, { useState, useEffect, useRef } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (img: string) => void;
  title?: string;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture, title = "ছবি তুলুন" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("আপনার ব্রাউজার বা অ্যাপ ক্যামেরা সাপোর্ট করে না।");
        return;
      }

      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error("Camera access error:", err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে সেটিংস থেকে পারমিশন চেক করুন।");
          } else if (err.name === 'NotFoundError') {
            setError("আপনার ডিভাইসে কোনো ক্যামেরা খুঁজে পাওয়া যায়নি।");
          } else {
            setError("ক্যামেরা চালু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
          }
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const capture = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring if needed (optional for selfie)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        onCapture(canvas.toDataURL('image/jpeg', 0.8));
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-center items-center bg-slate-900/90 backdrop-blur-md p-6">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">{title}</h3>
        
        <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden mb-6 relative border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center">
          {error ? (
            <div className="p-8 text-center">
              <i className="fa-solid fa-circle-exclamation text-red-500 text-4xl mb-4"></i>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            ></video>
          )}
          {!error && !stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
               <i className="fa-solid fa-circle-notch fa-spin text-blue-500 text-2xl"></i>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl uppercase text-xs">বাতিল</button>
          {!error && (
            <button 
              onClick={capture} 
              disabled={!stream}
              className="flex-[2] py-4 gradient-bg text-white font-black rounded-2xl shadow-xl uppercase text-xs disabled:opacity-50"
            >
              ছবি তুলুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
