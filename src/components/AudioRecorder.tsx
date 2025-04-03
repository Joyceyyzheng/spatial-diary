import React, { useState, useEffect, useRef } from "react";

interface AudioRecorderProps {
  onAudioReady: (audioUrl: string, audioName: string) => void;
  disabled?: boolean;
  existingAudio?: { url: string; name: string } | null;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  disabled = false,
  existingAudio = null,
}) => {
  // 音频上传状态
  const [audio, setAudio] = useState<string | null>(existingAudio?.url || null);
  const [audioName, setAudioName] = useState<string>(existingAudio?.name || "");

  // 录音相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // 当组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      // 确保停止任何正在进行的录音
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // 当外部音频变化时更新内部状态
  useEffect(() => {
    if (existingAudio) {
      setAudio(existingAudio.url);
      setAudioName(existingAudio.name);
    } else {
      setAudio(null);
      setAudioName("");
    }
  }, [existingAudio]);

  // 当内部音频状态变化时通知父组件
  useEffect(() => {
    if (audio && audioName) {
      onAudioReady(audio, audioName);
    }
  }, [audio, audioName, onAudioReady]);

  // 处理音频文件上传
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioUrl = e.target?.result as string;
        setAudio(audioUrl);
        setAudioName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // 修改计时器逻辑
  useEffect(() => {
    let intervalId: number | null = null;

    if (isRecording) {
      // 开始计时
      intervalId = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // 清理函数
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const reader = new FileReader();
        reader.onload = (e) => {
          const audioUrl = e.target?.result as string;
          setAudio(audioUrl);
          setAudioName(`Recording_${new Date().toLocaleTimeString()}.wav`);
        };
        reader.readAsDataURL(audioBlob);

        // 停止所有音轨
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      //   // 设置计时器
      //   timerRef.current = window.setInterval(() => {
      //     setRecordingTime((prev) => prev + 1);
      //   }, 1000);
    } catch (error) {
      console.error("Recording failed:", error);
      alert("Can't access microphone, check the setting");
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      //   // 清除计时器
      //   if (timerRef.current) {
      //     window.clearInterval(timerRef.current);
      //     timerRef.current = null;
      //   }
    }
  };

  // 清除音频
  const clearAudio = () => {
    setAudio(null);
    setAudioName("");
    onAudioReady("", "");
  };

  // 格式化录音时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="audio-recorder">
      <div className="upload-controls">
        <div className="upload-section">
          <label htmlFor="audio-upload" className="upload-label">
            Upload Audio File
          </label>
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="file-input"
            disabled={isRecording || disabled}
          />
        </div>
      </div>

      <div className="recording-section">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="record-button"
            disabled={!!audio || disabled}
          >
            Start Recording
          </button>
        ) : (
          <div className="recording-controls">
            <span className="recording-indicator">
              Recording {formatRecordingTime(recordingTime)}
            </span>
            <button onClick={stopRecording} className="stop-button">
              Stop Recording
            </button>
          </div>
        )}
      </div>

      {audio && (
        <div className="audio-preview">
          <p>File Chosen: {audioName}</p>
          <div className="audio-controls">
            <audio controls src={audio} />
            <button onClick={clearAudio} className="clear-audio-button">
              Delete the File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
