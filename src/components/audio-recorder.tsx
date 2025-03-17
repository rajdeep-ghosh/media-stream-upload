"use client";

import { useState, useEffect } from "react";

export default function AudioRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "inactive" | "recording"
  >("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!recorder) return;

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) {
        console.log(ev.data);
        setAudioChunks((prev) => [...prev, ev.data]);
      }
    };

    recorder.addEventListener("start", () => {
      console.log("recording started");
      setRecordingStatus("recording");
    });

    recorder.onstop = () => {
      console.log("recording stopped");
      setRecordingStatus("inactive");
    };

    return () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [recorder]);

  async function handleStartRecording() {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(audioStream);

      setStream(audioStream);
      setRecorder(mediaRecorder);

      mediaRecorder.start(5000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  function handleStopRecording() {
    if (recorder && recorder.state === "recording") {
      recorder.stop();

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }

  return (
    <div>
      <p>Recording Status: {recordingStatus}</p>
      <button
        onClick={handleStartRecording}
        disabled={recordingStatus === "recording"}
      >
        Start Recording
      </button>
      <button
        onClick={handleStopRecording}
        disabled={recordingStatus !== "recording"}
      >
        Stop Recording
      </button>

      <br />
      <br />

      <div>
        <p>Audio chunks</p>
        {audioChunks.map((chunk, idx) => (
          <audio key={idx} src={URL.createObjectURL(chunk)} controls />
        ))}
      </div>

      <br />
      <br />

      <div>
        <p>Full audio</p>
        {audioUrl && <audio src={audioUrl} controls />}
      </div>
    </div>
  );
}
