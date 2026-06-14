import React, { useState } from "react";

interface FlagProps {
  emoji: string;
  name: string;
  className?: string;
}

export default function Flag({ emoji, name, className = "w-6 h-6" }: FlagProps) {
  const [error, setError] = useState(false);

  if (!emoji) return null;

  // Generate Twemoji URL by extracting code points
  const codePoints: string[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp) {
      codePoints.push(cp.toString(16));
    }
  }
  const fileName = codePoints.join("-").toLowerCase();
  
  // High quality vector SVG flags from official Twemoji
  const twemojiUrl = `https://fastly.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${fileName}.svg`;

  if (error) {
    // Fallback to native text emoji if any asset loading issue arises
    return (
      <span className={`${className} inline-flex items-center justify-center font-normal select-none`} role="img" aria-label={name}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={twemojiUrl}
      alt={`${name} flag`}
      className={`${className} inline-block select-none pointer-events-none filter drop-shadow-sm`}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
