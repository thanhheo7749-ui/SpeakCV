import { useState, useRef, useEffect, useCallback } from "react";

export const useAudioQueue = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playAudio = useCallback((blob: Blob) => {
    if (!audioRef.current) return;

    stopAudio();

    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    audioRef.current.play().catch(err => console.error("Audio play error:", err));
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url); 
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playAudio, stopAudio };
};