import React from "react";

interface OverlayProps {
  status: "idle" | "loading" | "success";
  message: string;
}

export default function ActionStatusOverlay({ status, message }: OverlayProps) {
  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/45 backdrop-blur-md transition-all duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {status === "loading" && (
          <>
            {/* Lingkaran Pemuat Bergerak (Spinning Loader) */}
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium text-xs">Sila tunggu sebentar...</p>
          </>
        )}

        {status === "success" && (
          <>
            {/* Tanda Tik Hijau Beranimasi */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Berjaya!</h3>
            <p className="text-gray-600 text-xs">{message}</p>
          </>
        )}

      </div>
    </div>
  );
}
