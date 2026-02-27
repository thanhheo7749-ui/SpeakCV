import { useState, useEffect } from "react";

interface UseInterviewTimerProps {
  interviewType: string;
  timeLimit: number;
  questionLimit: number;
  hasStarted: boolean;
  status: string;
  onTimeUp: () => void;
}

export function useInterviewTimer({
  interviewType,
  timeLimit,
  questionLimit,
  hasStarted,
  status,
  onTimeUp,
}: UseInterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    let interval: any;
    // Timer runs when the AI is not speaking/processing (so "Sẵn sàng" or "Đang nghe")
    const isUserTurn = status === "Sẵn sàng" || status === "Đang nghe";
    
    if (interviewType === "timed" && hasStarted && isUserTurn && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isUserTurn) {
      onTimeUp();
    }
    return () => clearInterval(interval);
  }, [status, timeLeft, interviewType, hasStarted, onTimeUp]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  const resetTimer = () => {
    setTimeLeft(timeLimit);
    setQuestionCount(0);
  };

  const advanceQuestion = () => {
    setQuestionCount((prev) => prev + 1);
    setTimeLeft(timeLimit);
  };

  return {
    timeLeft,
    setTimeLeft,
    questionCount,
    setQuestionCount,
    resetTimer,
    advanceQuestion,
  };
}
