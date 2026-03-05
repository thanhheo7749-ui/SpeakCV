/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState, useRef, useCallback, useEffect } from "react";

export const useMicrophone = (lang: string = "vi-VN") => {
  const [text, setText] = useState("");
  const [temp, setTemp] = useState(""); 
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null); 

  // Initialize the browser's speech recognition instance
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
          let finalTxt = "";
          let interimTxt = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTxt += event.results[i][0].transcript;
            } else {
              interimTxt += event.results[i][0].transcript;
            }
          }

          // Finalized sentence -> append to main chat text
          if (finalTxt) {
            setText((prev) => (prev + " " + finalTxt).trim());
          }
          // Interim text (still speaking) -> show as draft
          setTemp(interimTxt); 
        };

        recognition.onend = () => {
          setIsListening(false);
          // Flush remaining interim text into the main chat
          setTemp((prevTemp) => {
            if (prevTemp) {
              setText((prevText) => (prevText + " " + prevTemp).trim());
            }
            return "";
          });
        };

        recognition.onerror = (event: any) => {
          console.error("Mic error:", event.error);
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
        console.log("Mic is already active");
      }
    } else {
      alert("Your browser does not support this feature (please use Chrome or Edge).");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = useCallback(() => {
    if (isListening) stopRecording(); else startRecording();
  }, [isListening]);

  const resetText = () => { setText(""); setTemp(""); };

  return { text, setText, temp, isListening, isProcessing: false, toggleMic, resetText };
};