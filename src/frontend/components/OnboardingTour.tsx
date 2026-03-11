"use client";

import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export const OnboardingTour = () => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const storageKey = user ? `hasSeenTour_${user}` : "hasSeenTour_guest";

  useEffect(() => {
    // We only want this to run on client side to avoid hydration mismatches
    const hasSeenTour = localStorage.getItem(storageKey);
    if (!hasSeenTour) {
      setRun(true);
    }
  }, [storageKey]);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div className="text-left font-sans">
          <p className="font-bold text-lg mb-2">
            Chào mừng bạn đến với SpeakCV!
          </p>
          <p className="text-sm">
            Hãy dành 1 phút để xem cách hệ thống giúp bạn chinh phục nhà tuyển
            dụng nhé.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "#tour-step-cv",
      content: (
        <div className="text-left font-sans">
          <p className="font-bold mb-1">Bước 1: Tải CV của bạn lên đây.</p>
          <p className="text-sm">
            💡 Ví dụ: Dán mô tả công việc (JD) thực tế vào để AI phân tích độ
            phù hợp.
          </p>
        </div>
      ),
    },
    {
      target: "#tour-step-start",
      content: (
        <div className="text-left font-sans">
          <p className="font-bold mb-1">
            Bước 2: Vào phòng phỏng vấn thực chiến.
          </p>
          <p className="text-sm">
            💡 Ví dụ: Điền vị trí và JD, sau đó bấm nút này để bắt đầu. Tiếp
            theo bật micro và nói 'Tôi đã sẵn sàng' để AI bắt đầu đặt câu hỏi
            cho bạn.
          </p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action, index } = data;

    if (type === "step:after" || type === "error:target_not_found") {
      setStepIndex(index + (action === "prev" ? -1 : 1));
    } else if (action === "close" || action === "skip") {
      const confirmSkip = window.confirm(
        "Bạn có chắc chắn muốn bỏ qua hướng dẫn không?",
      );
      if (confirmSkip) {
        setRun(false);
        localStorage.setItem(storageKey, "true");
        toast.success(
          "🎉 Chúc mừng bạn đã nắm rõ hệ thống. Hy vọng SpeakCV sẽ mang lại cho bạn trải nghiệm tuyệt vời và giúp bạn tự tin trúng tuyển nhé!",
          { duration: 5000, position: "top-center" },
        );
      } else {
        // Did not skip, restore run and index
        setRun(true);
      }
    } else if (status === STATUS.FINISHED) {
      setRun(false);
      localStorage.setItem(storageKey, "true");
      toast.success(
        "🎉 Chúc mừng bạn đã nắm rõ hệ thống. Hy vọng SpeakCV sẽ mang lại cho bạn trải nghiệm tuyệt vời và giúp bạn tự tin trúng tuyển nhé!",
        { duration: 5000, position: "top-center" },
      );
    }
  };

  // Do not render Joyride on server side
  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      disableOverlayClose={true}
      spotlightPadding={4}
      locale={{
        back: "Quay lại",
        close: "Đóng",
        last: "Hoàn thành",
        next: "Tiếp tục",
        skip: "Bỏ qua",
      }}
      styles={{
        options: {
          primaryColor: "#3b82f6", // tailwind blue-500
          textColor: "#334155", // tailwind slate-700
          backgroundColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: "8px",
        },
        buttonBack: {
          color: "#64748b",
        },
        buttonSkip: {
          color: "#ef4444",
        },
      }}
    />
  );
};
