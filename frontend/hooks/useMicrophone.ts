import { useState, useEffect, useRef } from "react";

export const useMicrophone = (lang: string) => {
  const [text, setText] = useState(""); 
  const [temp, setTemp] = useState(""); 
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let final = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) setTemp(interim);
      if (final) {
        setTemp("");
        setText((prev) => (prev + " " + final).trim());
      }
    };

    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    
    return () => { if(recognitionRef.current) recognitionRef.current.stop(); }
  }, [lang]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch {}
    }
  };

  const resetText = () => { setText(""); setTemp(""); };

  return { text, setText, temp, setTemp, isListening, toggleMic, resetText, setIsListening };
};