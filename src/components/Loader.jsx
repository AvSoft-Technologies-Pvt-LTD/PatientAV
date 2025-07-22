import { useEffect, useState } from "react";

const PageWithLoader = ({ children }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setProgress(p => +(p + 0.02).toFixed(2) >= 1 ? 1 : +(p + 0.02).toFixed(2)), 40);
    return () => clearInterval(interval);
  }, []);
  const showLoader = progress < 1;

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#ffffff]">
      {showLoader && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="capsule-spin mb-6" />
          <div className="ecg-line mb-4" />
          <div className="text-[#00796b] text-base md:text-lg font-semibold animate-pulse tracking-wide">
           Running comprehensive health analysis... {Math.floor(progress * 100)}%
          </div>
        </div>
      )}
      <div className="transition-all duration-1000 ease-in-out" style={{opacity: progress, filter: `blur(${(1 - progress) * 6}px)`, transform: `scale(${0.97 + progress * 0.03})`}}>
        {children}
      </div>
      <style>{`
        .capsule-spin {
          width: 60px; height: 30px; border-radius: 15px;
          // background: linear-gradient(to right, #0e1630 50%, #fff 50%);/
          background-size: 200% 100%; background-position: right bottom;
          animation: rotateCapsule 1s linear infinite, pulseGlow 1s infinite;
          box-shadow: 0 0 8px rgba(0,188,212,0.4);
        }
        @keyframes rotateCapsule {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 8px rgba(0,188,212,0.3); }
          50% { box-shadow: 0 0 15px rgba(0,188,212,0.7); }
        }
        .ecg-line {
          width: 250px; height: 40px;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='0,20 30,20 40,5 50,35 60,20 90,20 100,10 110,30 120,20 300,20' fill='none' stroke='%2300bcd4' stroke-width='2' /%3E%3C/svg%3E");
          background-repeat: repeat-x;
          animation: ecgMove 1s linear infinite;
        }
        @keyframes ecgMove {
          0% { background-position-x: 0; }
          100% { background-position-x: -100px; }
        }
      `}</style>
    </div>
  );
};

export default PageWithLoader;
