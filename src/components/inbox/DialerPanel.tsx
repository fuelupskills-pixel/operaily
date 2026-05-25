"use client";

import { useState } from "react";
import { Phone, Delete, X } from "lucide-react";

interface DialerPanelProps {
  onClose: () => void;
  onCall: (phoneNumber: string) => Promise<void>;
  initialNumber?: string;
}

export function DialerPanel({ onClose, onCall, initialNumber = "" }: DialerPanelProps) {
  const [number, setNumber] = useState(initialNumber);
  const [calling, setCalling] = useState(false);

  const handleKeyPress = (digit: string) => {
    setNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!number || calling) return;
    setCalling(true);
    try {
      await onCall(number);
    } finally {
      setCalling(false);
      onClose();
    }
  };

  const dialPad = [
    ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
    ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
    ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
    ['*', ''], ['0', '+'], ['#', '']
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[340px] bg-[#111113] border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Area */}
        <div className="px-8 pb-6 text-center">
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full bg-transparent text-4xl text-white text-center tracking-wider outline-none font-light placeholder-gray-600"
            placeholder="Enter number"
            autoFocus
          />
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 px-10 pb-8">
          {dialPad.map(([digit, letters]) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors border border-white/5 group"
            >
              <span className="text-2xl text-white font-normal group-active:scale-95 transition-transform">{digit}</span>
              {letters && <span className="text-[10px] text-gray-500 font-medium tracking-widest">{letters}</span>}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-10 pb-10">
          <div className="w-16"></div> {/* Spacer for centering call button */}
          
          <button
            onClick={handleCall}
            disabled={!number || calling}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all ${
              !number || calling 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none' 
                : 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95'
            }`}
          >
            <Phone className="w-7 h-7 fill-current" />
          </button>

          <div className="w-16 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={!number}
              className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
