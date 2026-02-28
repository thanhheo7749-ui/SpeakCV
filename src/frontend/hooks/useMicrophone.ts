import { useState, useRef, useCallback, useEffect } from "react";

export const useMicrophone = (lang: string = "vi-VN") => {
  const [text, setText] = useState("");
  const [temp, setTemp] = useState(""); 
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null); 

  // Khởi tạo bộ nghe duy nhất của trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        // Xử lý khi có âm thanh vào
        recognition.onresult = (event: any) => {
          let finalTxt = "";
          let interimTxt = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            // Trình duyệt tự biết khi nào bạn nói xong 1 câu (ngắt hơi)
            if (event.results[i].isFinal) {
              finalTxt += event.results[i][0].transcript;
            } else {
              interimTxt += event.results[i][0].transcript;
            }
          }

          // Nếu chốt xong 1 câu -> Đẩy thẳng vào khung chat chính
          if (finalTxt) {
            setText((prev) => (prev + " " + finalTxt).trim());
          }
          // Chữ đang nói dở (chưa ngắt hơi) -> Cho làm chữ nháp
          setTemp(interimTxt); 
        };

        // Xử lý khi bạn bấm tắt Mic
        recognition.onend = () => {
          setIsListening(false);
          // Gom nốt chữ nháp còn sót lại đẩy vào khung chat
          setTemp((prevTemp) => {
            if (prevTemp) {
              setText((prevText) => (prevText + " " + prevTemp).trim());
            }
            return "";
          });
        };

        recognition.onerror = (event: any) => {
          console.error("Lỗi mic:", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTemp("");
      } catch (e) {
        console.log("Mic đang bật rồi");
      }
    } else {
      alert("Trình duyệt của bạn không hỗ trợ tính năng này (Hãy dùng Chrome hoặc Edge).");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // Không cần setText ở đây nữa, sự kiện 'onend' ở trên sẽ tự động lo việc dọn dẹp!
    }
  };

  const toggleMic = useCallback(() => {
    if (isListening) stopRecording(); else startRecording();
  }, [isListening]);

  const resetText = () => { setText(""); setTemp(""); };

  return { text, setText, temp, isListening, isProcessing: false, toggleMic, resetText };
};