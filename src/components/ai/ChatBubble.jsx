// src/components/ai/ChatBubble.jsx — Section 10 spec
import React from 'react';

export function UserBubble({ text, timestamp }) {
  return (
    <div className="flex justify-end mb-3 animate-slide-in-right" style={{ animationDuration: '250ms' }}>
      <div className="max-w-[75%] bg-primary-800 text-white rounded-[18px_18px_4px_18px] px-4 py-3 shadow-[0_2px_8px_rgba(46,125,50,0.2)]">
        <p className="text-[15px] leading-relaxed">{text}</p>
        {timestamp && (
          <p className="text-[11px] text-white/70 text-right mt-1">
            {new Date(timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

export function AIBubble({ text, timestamp, onListen, onSave }) {
  return (
    <div className="flex justify-start mb-3 animate-slide-in-left" style={{ animationDuration: '250ms' }}>
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
        <span className="text-base">🤖</span>
      </div>
      <div className="max-w-[85%]">
        <div className="bg-white text-[#1A1A1A] rounded-[18px_18px_18px_4px] px-4 py-3.5 shadow-card">
          <p className="text-[15px] whitespace-pre-wrap" style={{ lineHeight: 1.75 }}>{text}</p>
          {timestamp && (
            <p className="text-[11px] text-[#BDBDBD] text-right mt-1">
              {new Date(timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          {onListen && (
            <button
              onClick={onListen}
              className="px-3.5 py-2 bg-primary-50 text-primary-800 rounded-lg text-[13px] font-medium tap-feedback"
            >
              🔊 सुनें
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="px-3.5 py-2 bg-primary-50 text-primary-800 rounded-lg text-[13px] font-medium tap-feedback"
            >
              ⭐ सेव करें
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
        <span className="text-base">🤖</span>
      </div>
      <div className="bg-white rounded-[18px_18px_18px_4px] px-5 py-4 shadow-card flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#BDBDBD]"
            style={{ animation: `typingBounce 600ms infinite ease-in-out`, animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
