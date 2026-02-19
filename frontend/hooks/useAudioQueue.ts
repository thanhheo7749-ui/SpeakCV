import { useState, useRef, useEffect, useCallback } from "react";

export const useAudioQueue = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Khởi tạo Audio khi mount
  useEffect(() => {
    audioRef.current = new Audio();
    // Cleanup khi unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Hàm phát âm thanh từ Blob
  const playAudio = useCallback((blob: Blob) => {
    if (!audioRef.current) return;

    // Dừng âm thanh cũ nếu đang phát
    stopAudio();

    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    audioRef.current.play().catch(err => console.error("Audio play error:", err));
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url); // Dọn dẹp bộ nhớ
    };
  }, []);

  // Hàm dừng âm thanh khẩn cấp
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playAudio, stopAudio };
};