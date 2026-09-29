import { useCallback, useEffect, useRef, useState } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import * as ort from "onnxruntime-web";
import { useAuth } from "../context/AuthContext";

/*
 * ==========================================================
 * CONVERSATION WEBSOCKET URL
 * ==========================================================
 *
 * Local development:
 *   VITE_CONVERSATION_WS_URL=ws://127.0.0.1:8000/ws/realtime
 *
 * Production:
 *   VITE_CONVERSATION_WS_URL=wss://mindo-conversation.onrender.com/ws/realtime
 *
 * Vite exposes only variables prefixed with VITE_ to the browser.
 */

const WS_URL = import.meta.env.VITE_CONVERSATION_WS_URL;

if (!WS_URL) {
  throw new Error(
    "VITE_CONVERSATION_WS_URL is not configured."
  );
}

const MODEL_URL = "/models/emotion_model_best.onnx";

const EMOTIONS = [
  "angry",
  "disgust",
  "fear",
  "happy",
  "neutral",
  "sad",
  "surprise",
];

const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

const VAD_RMS_THRESHOLD = 0.018;
const VAD_START_CONFIRMATION_BLOCKS = 2;
const VAD_END_SILENCE_BLOCKS = 5;

const SMOOTHING_WINDOW = 8;
const INFERENCE_INTERVAL_MS = 200;
const EMOTION_SEND_INTERVAL_MS = 1000;

const MIC_SAMPLE_RATE = 16000;
const PLAYBACK_SAMPLE_RATE = 24000;

function convertFloat32ToPCM16(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  let offset = 0;

  for (
    let i = 0;
    i < float32Array.length;
    i++, offset += 2
  ) {
    let sample = Math.max(
      -1,
      Math.min(1, float32Array[i])
    );

    sample =
      sample < 0
        ? sample * 0x8000
        : sample * 0x7fff;

    view.setInt16(offset, sample, true);
  }

  return buffer;
}

function softmax(logits) {
  const maxLogit = Math.max(...logits);

  const exps = logits.map((value) =>
    Math.exp(value - maxLogit)
  );

  const sum = exps.reduce(
    (a, b) => a + b,
    0
  );

  if (!sum) {
    return logits.map(() => 0);
  }

  return exps.map(
    (value) => value / sum
  );
}

function appendTranscriptionChunk(existing, incoming) {
  const left = String(existing || "").trim();
  const right = String(incoming || "").trim();

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  if (right === left) {
    return left;
  }

  if (right.startsWith(left)) {
    return right;
  }

  if (left.endsWith(right)) {
    return left;
  }

  return `${left} ${right}`;
}

export default function useMindoSession() {
  const { currentUser } = useAuth();

  const [connectionState, setConnectionState] =
    useState("idle");

  const [error, setError] =
    useState(null);

  const [transcript, setTranscript] =
    useState([]);

  const [closingReflection, setClosingReflection] =
    useState("");

  const [interimTranscript, setInterimTranscript] =
    useState("");

  const [currentSpeaker, setCurrentSpeaker] =
    useState(null);

  const [micMuted, setMicMuted] =
    useState(false);

  const [cameraOff, setCameraOff] =
    useState(false);

  const [dominantEmotion, setDominantEmotion] =
    useState(null);

  const [emotionProbabilities, setEmotionProbabilities] =
    useState({});

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [ferReady, setFerReady] =
    useState(false);

  const [sessionId, setSessionId] =
    useState(null);

  const videoRef = useRef(null);

  const socketRef = useRef(null);

  const audioContextRef = useRef(null);
  const microphoneSourceRef = useRef(null);
  const processorRef = useRef(null);
  const microphoneStreamRef = useRef(null);

  const playbackContextRef = useRef(null);
  const nextPlaybackTimeRef = useRef(0);

  const cameraStreamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const ortSessionRef = useRef(null);

  const animationFrameRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);
  const lastInferenceTimeRef = useRef(0);
  const inferenceRunningRef = useRef(false);
  const lastEmotionSendTimeRef = useRef(0);

  const probabilityHistoryRef = useRef([]);

  const userSpeechActiveRef = useRef(false);
  const speechStartCandidateBlocksRef =
    useRef(0);
  const silenceBlocksRef =
    useRef(0);

  const sessionActiveRef =
    useRef(false);

  const intentionalCloseRef =
    useRef(false);

  const endingRequestedRef =
    useRef(false);

  const resetSessionState =
    useCallback(() => {
      setError(null);
      setTranscript([]);
      setClosingReflection("");
      setInterimTranscript("");
      setCurrentSpeaker(null);

      setMicMuted(false);
      setCameraOff(false);

      setDominantEmotion(null);
      setEmotionProbabilities({});
      setFaceDetected(false);
      setFerReady(false);

      setSessionId(null);

      probabilityHistoryRef.current = [];

      lastVideoTimeRef.current = -1;
      lastInferenceTimeRef.current = 0;
      lastEmotionSendTimeRef.current = 0;
      inferenceRunningRef.current = false;

      userSpeechActiveRef.current = false;
      speechStartCandidateBlocksRef.current = 0;
      silenceBlocksRef.current = 0;

      nextPlaybackTimeRef.current = 0;

      endingRequestedRef.current = false;
    }, []);

  const sendJSON =
    useCallback((payload) => {
      const socket =
        socketRef.current;

      if (
        !socket ||
        socket.readyState !==
          WebSocket.OPEN
      ) {
        return false;
      }

      try {
        socket.send(
          JSON.stringify(payload)
        );

        return true;
      } catch (sendError) {
        console.error(
          "MINDO WebSocket send error:",
          sendError
        );

        return false;
      }
    }, []);

  const sendSpeechEvent =
    useCallback(
      (eventType, timestamp) => {
        sendJSON({
          type: eventType,
          timestamp,
        });
      },
      [sendJSON]
    );

  const startUserSpeech =
    useCallback(() => {
      if (
        userSpeechActiveRef.current
      ) {
        return;
      }

      userSpeechActiveRef.current =
        true;

      speechStartCandidateBlocksRef.current =
        0;

      silenceBlocksRef.current =
        0;

      sendSpeechEvent(
        "speech_start",
        Date.now()
      );
    }, [sendSpeechEvent]);

  const finishUserSpeechIfActive =
    useCallback(() => {
      if (
        !userSpeechActiveRef.current
      ) {
        return;
      }

      userSpeechActiveRef.current =
        false;

      speechStartCandidateBlocksRef.current =
        0;

      silenceBlocksRef.current =
        0;

      sendSpeechEvent(
        "speech_end",
        Date.now()
      );
    }, [sendSpeechEvent]);

  const processVoiceActivity =
    useCallback(
      (inputData) => {
        if (
          !sessionActiveRef.current
        ) {
          return;
        }

        if (
          !inputData ||
          inputData.length === 0
        ) {
          return;
        }

        let sumSquares = 0;

        for (
          let i = 0;
          i < inputData.length;
          i++
        ) {
          const sample =
            inputData[i];

          sumSquares +=
            sample * sample;
        }

        const rms = Math.sqrt(
          sumSquares /
            inputData.length
        );

        const speechDetected =
          rms >=
          VAD_RMS_THRESHOLD;

        if (
          userSpeechActiveRef.current
        ) {
          if (speechDetected) {
            silenceBlocksRef.current =
              0;

            return;
          }

          silenceBlocksRef.current +=
            1;

          if (
            silenceBlocksRef.current >=
            VAD_END_SILENCE_BLOCKS
          ) {
            finishUserSpeechIfActive();
          }

          return;
        }

        if (speechDetected) {
          speechStartCandidateBlocksRef.current +=
            1;

          if (
            speechStartCandidateBlocksRef.current >=
            VAD_START_CONFIRMATION_BLOCKS
          ) {
            startUserSpeech();
          }

          return;
        }

        speechStartCandidateBlocksRef.current =
          0;
      },
      [
        finishUserSpeechIfActive,
        startUserSpeech,
      ]
    );

  /*
   * ==========================================================
   * GEMINI AUDIO PLAYBACK
   * ==========================================================
   */

  const playGeminiAudio =
    useCallback(
      (arrayBuffer) => {
        const playbackContext =
          playbackContextRef.current;

        if (!playbackContext) {
          return;
        }

        const int16Array =
          new Int16Array(
            arrayBuffer
          );

        if (!int16Array.length) {
          return;
        }

        const audioBuffer =
          playbackContext.createBuffer(
            1,
            int16Array.length,
            PLAYBACK_SAMPLE_RATE
          );

        const channelData =
          audioBuffer.getChannelData(0);

        for (
          let i = 0;
          i < int16Array.length;
          i++
        ) {
          channelData[i] =
            int16Array[i] /
            32768;
        }

        const source =
          playbackContext.createBufferSource();

        source.buffer =
          audioBuffer;

        source.connect(
          playbackContext.destination
        );

        const currentTime =
          playbackContext.currentTime;

        if (
          nextPlaybackTimeRef.current <
          currentTime
        ) {
          nextPlaybackTimeRef.current =
            currentTime;
        }

        source.start(
          nextPlaybackTimeRef.current
        );

        nextPlaybackTimeRef.current +=
          audioBuffer.duration;
      },
      []
    );

  /*
   * ==========================================================
   * WAIT FOR FINAL GEMINI AUDIO TO FINISH
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Gemini finishing its generation does not necessarily mean
   * that the browser has finished playing every audio chunk
   * that Gemini already sent.
   *
   * nextPlaybackTimeRef contains the end of the final scheduled
   * audio chunk in the Web Audio timeline.
   *
   * We wait for that timeline to drain before closing the
   * AudioContext.
   */

  const waitForPlaybackToFinish =
    useCallback(async () => {
      const playbackContext =
        playbackContextRef.current;

      if (!playbackContext) {
        return;
      }

      if (
        playbackContext.state ===
        "closed"
      ) {
        return;
      }

      const checkIntervalMs = 50;

      /*
       * Safety guard only.
       *
       * Normal reflections will finish based on the actual
       * queued audio duration. This prevents a broken audio
       * context from leaving the session permanently stuck.
       */

      const safetyTimeoutMs =
        120000;

      const startedWaitingAt =
        performance.now();

      while (true) {
        const currentContext =
          playbackContextRef.current;

        if (!currentContext) {
          return;
        }

        if (
          currentContext.state ===
          "closed"
        ) {
          return;
        }

        const remainingSeconds =
          nextPlaybackTimeRef.current -
          currentContext.currentTime;

        /*
         * A tiny tolerance prevents us from waiting forever
         * because of floating-point timing differences.
         */

        if (
          remainingSeconds <=
          0.02
        ) {
          return;
        }

        if (
          performance.now() -
            startedWaitingAt >=
          safetyTimeoutMs
        ) {
          console.warn(
            "[MINDO] Playback drain safety timeout reached. Closing audio playback."
          );

          return;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              checkIntervalMs
            )
        );
      }
    }, []);

  /*
   * ==========================================================
   * TRANSCRIPTION
   * ==========================================================
   */

  const handleTranscription =
    useCallback(
      (role, text) => {
        if (!text) {
          return;
        }

        const normalizedRole =
          role === "assistant"
            ? "assistant"
            : "user";

        setCurrentSpeaker(
          normalizedRole
        );

        setInterimTranscript("");

        /*
         * During the ending flow, assistant transcription belongs
         * to the automatic final closing reflection.
         *
         * It is deliberately kept separate from the normal
         * conversation transcript.
         */

        if (
          endingRequestedRef.current &&
          normalizedRole === "assistant"
        ) {
          setClosingReflection(
            (previous) =>
              appendTranscriptionChunk(
                previous,
                text
              )
          );

          return;
        }

        /*
         * Normal conversation transcript.
         */

        setTranscript(
          (previous) => {
            const last =
              previous[
                previous.length - 1
              ];

            if (
              last &&
              last.role ===
                normalizedRole
            ) {
              const updated = [
                ...previous,
              ];

              updated[
                updated.length - 1
              ] = {
                ...last,
                text:
                  appendTranscriptionChunk(
                    last.text,
                    text
                  ),
              };

              return updated;
            }

            return [
              ...previous,
              {
                id:
                  `${Date.now()}-${Math.random()}`,
                role:
                  normalizedRole,
                text,
              },
            ];
          }
        );
      },
      []
    );

  /*
   * ==========================================================
   * CAMERA / FER INITIALIZATION
   * ==========================================================
   */

  const initializeFaceDetector =
    useCallback(async () => {
      if (
        faceDetectorRef.current
      ) {
        return;
      }

      const vision =
        await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
        );

      faceDetectorRef.current =
        await FaceDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
              delegate: "CPU",
            },

            runningMode:
              "VIDEO",

            minDetectionConfidence:
              0.6,
          }
        );
    }, []);

  const initializeONNX =
    useCallback(async () => {
      if (
        ortSessionRef.current
      ) {
        return;
      }

      ort.env.wasm.wasmPaths =
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/";

      ortSessionRef.current =
        await ort.InferenceSession.create(
          MODEL_URL,
          {
            executionProviders: [
              "wasm",
            ],

            graphOptimizationLevel:
              "all",
          }
        );
    }, []);

  /*
   * ==========================================================
   * CREATE ONNX INPUT
   * ==========================================================
   */

  const createInputTensor =
    useCallback(
      (detection) => {
        const video =
          videoRef.current;

        if (!video) {
          throw new Error(
            "Camera video element is unavailable."
          );
        }

        const box =
          detection.boundingBox;

        if (!box) {
          throw new Error(
            "Face bounding box unavailable."
          );
        }

        const videoWidth =
          video.videoWidth;

        const videoHeight =
          video.videoHeight;

        let x = Math.max(
          0,
          box.originX
        );

        let y = Math.max(
          0,
          box.originY
        );

        let width = Math.min(
          box.width,
          videoWidth - x
        );

        let height = Math.min(
          box.height,
          videoHeight - y
        );

        if (
          width <= 1 ||
          height <= 1
        ) {
          throw new Error(
            "Invalid face bounding box."
          );
        }

        const inputCanvas =
          document.createElement(
            "canvas"
          );

        inputCanvas.width =
          224;

        inputCanvas.height =
          224;

        const ctx =
          inputCanvas.getContext(
            "2d",
            {
              willReadFrequently:
                true,
            }
          );

        if (!ctx) {
          throw new Error(
            "Could not create canvas context."
          );
        }

        ctx.drawImage(
          video,
          x,
          y,
          width,
          height,
          0,
          0,
          224,
          224
        );

        const imageData =
          ctx.getImageData(
            0,
            0,
            224,
            224
          );

        const data =
          imageData.data;

        const input =
          new Float32Array(
            3 * 224 * 224
          );

        const channelSize =
          224 * 224;

        for (
          let i = 0;
          i < channelSize;
          i++
        ) {
          const pixelIndex =
            i * 4;

          const r =
            data[pixelIndex] /
            255;

          const g =
            data[pixelIndex + 1] /
            255;

          const b =
            data[pixelIndex + 2] /
            255;

          input[i] =
            (r -
              IMAGENET_MEAN[0]) /
            IMAGENET_STD[0];

          input[
            channelSize + i
          ] =
            (g -
              IMAGENET_MEAN[1]) /
            IMAGENET_STD[1];

          input[
            channelSize * 2 + i
          ] =
            (b -
              IMAGENET_MEAN[2]) /
            IMAGENET_STD[2];
        }

        return new ort.Tensor(
          "float32",
          input,
          [
            1,
            3,
            224,
            224,
          ]
        );
      },
      []
    );

  /*
   * ==========================================================
   * TEMPORAL SMOOTHING
   * ==========================================================
   */

  const smoothProbabilities =
    useCallback(
      (probabilities) => {
        const history =
          probabilityHistoryRef.current;

        history.push(
          probabilities
        );

        if (
          history.length >
          SMOOTHING_WINDOW
        ) {
          history.shift();
        }

        const smoothed =
          new Array(
            EMOTIONS.length
          ).fill(0);

        for (
          const frame of history
        ) {
          for (
            let i = 0;
            i < frame.length;
            i++
          ) {
            smoothed[i] +=
              frame[i];
          }
        }

        for (
          let i = 0;
          i < smoothed.length;
          i++
        ) {
          smoothed[i] /=
            history.length;
        }

        return smoothed;
      },
      []
    );

  /*
   * ==========================================================
   * SEND FER SNAPSHOT
   * ==========================================================
   */

  const sendEmotionSnapshot =
    useCallback(
      (
        predictedEmotion,
        probabilities
      ) => {
        const now =
          Date.now();

        if (
          now -
            lastEmotionSendTimeRef.current <
          EMOTION_SEND_INTERVAL_MS
        ) {
          return;
        }

        lastEmotionSendTimeRef.current =
          now;

        const probabilityObject =
          {};

        for (
          let i = 0;
          i < EMOTIONS.length;
          i++
        ) {
          probabilityObject[
            EMOTIONS[i]
          ] = Number(
            probabilities[i].toFixed(
              6
            )
          );
        }

        sendJSON({
          type: "emotion",
          timestamp: now,
          dominant_emotion:
            predictedEmotion,
          probabilities:
            probabilityObject,
        });
      },
      [sendJSON]
    );

  /*
   * ==========================================================
   * EMOTION INFERENCE
   * ==========================================================
   */

  const runEmotionInference =
    useCallback(
      async (detection) => {
        if (
          inferenceRunningRef.current ||
          !ortSessionRef.current
        ) {
          return;
        }

        const now =
          performance.now();

        if (
          now -
            lastInferenceTimeRef.current <
          INFERENCE_INTERVAL_MS
        ) {
          return;
        }

        lastInferenceTimeRef.current =
          now;

        inferenceRunningRef.current =
          true;

        try {
          const inputTensor =
            createInputTensor(
              detection
            );

          const feeds = {};

          feeds[
            ortSessionRef.current
              .inputNames[0]
          ] = inputTensor;

          const output =
            await ortSessionRef.current.run(
              feeds
            );

          const outputTensor =
            output[
              ortSessionRef.current
                .outputNames[0]
            ];

          const logits =
            Array.from(
              outputTensor.data
            );

          const probabilities =
            softmax(logits);

          const smoothed =
            smoothProbabilities(
              probabilities
            );

          let maxIndex = 0;

          for (
            let i = 1;
            i < smoothed.length;
            i++
          ) {
            if (
              smoothed[i] >
              smoothed[maxIndex]
            ) {
              maxIndex = i;
            }
          }

          const predictedEmotion =
            EMOTIONS[maxIndex];

          setDominantEmotion(
            predictedEmotion
          );

          const probabilityObject =
            {};

          for (
            let i = 0;
            i < EMOTIONS.length;
            i++
          ) {
            probabilityObject[
              EMOTIONS[i]
            ] =
              smoothed[i];
          }

          setEmotionProbabilities(
            probabilityObject
          );

          sendEmotionSnapshot(
            predictedEmotion,
            smoothed
          );
        } catch (
          inferenceError
        ) {
          console.error(
            "MINDO emotion inference error:",
            inferenceError
          );
        } finally {
          inferenceRunningRef.current =
            false;
        }
      },
      [
        createInputTensor,
        sendEmotionSnapshot,
        smoothProbabilities,
      ]
    );

  /*
   * ==========================================================
   * FACE DETECTION LOOP
   * ==========================================================
   */

  const detectFaces =
    useCallback(() => {
      if (
        !sessionActiveRef.current
      ) {
        return;
      }

      const video =
        videoRef.current;

      const detector =
        faceDetectorRef.current;

      if (
        !video ||
        !detector ||
        cameraStreamRef.current
          ?.getVideoTracks()
          ?.some(
            (track) =>
              track.enabled
          ) !== true
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            detectFaces
          );

        return;
      }

      if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            detectFaces
          );

        return;
      }

      try {
        if (
          video.currentTime !==
          lastVideoTimeRef.current
        ) {
          lastVideoTimeRef.current =
            video.currentTime;

          const results =
            detector.detectForVideo(
              video,
              performance.now()
            );

          if (
            !results?.detections
              ?.length
          ) {
            setFaceDetected(
              false
            );
          } else {
            let selectedDetection =
              results.detections[0];

            let largestArea = 0;

            for (
              const detection of
                results.detections
            ) {
              const box =
                detection.boundingBox;

              if (!box) {
                continue;
              }

              const area =
                box.width *
                box.height;

              if (
                area >
                largestArea
              ) {
                largestArea =
                  area;

                selectedDetection =
                  detection;
              }
            }

            setFaceDetected(
              true
            );

            runEmotionInference(
              selectedDetection
            );
          }
        }
      } catch (
        detectionError
      ) {
        console.error(
          "MINDO face detection error:",
          detectionError
        );
      }

      animationFrameRef.current =
        requestAnimationFrame(
          detectFaces
        );
    }, [runEmotionInference]);

  /*
   * ==========================================================
   * START CAMERA
   * ==========================================================
   */

  const startCamera =
    useCallback(async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },
            audio: false,
          }
        );

      cameraStreamRef.current =
        stream;

      let video =
        videoRef.current;

      if (!video) {
        video =
          document.createElement(
            "video"
          );

        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        videoRef.current =
          video;
      }

      video.srcObject =
        stream;

      await video.play();

      await initializeFaceDetector();
      await initializeONNX();

      lastVideoTimeRef.current =
        -1;

      lastInferenceTimeRef.current =
        0;

      lastEmotionSendTimeRef.current =
        0;

      probabilityHistoryRef.current =
        [];

      setFerReady(true);

      detectFaces();
    }, [
      detectFaces,
      initializeFaceDetector,
      initializeONNX,
    ]);

  /*
   * ==========================================================
   * START MICROPHONE
   * ==========================================================
   */

  const startMicrophone =
    useCallback(async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              channelCount: 1,
              echoCancellation:
                true,
              noiseSuppression:
                true,
              autoGainControl:
                true,
            },
            video: false,
          }
        );

      microphoneStreamRef.current =
        stream;

      const audioContext =
        new AudioContext({
          sampleRate:
            MIC_SAMPLE_RATE,
        });

      audioContextRef.current =
        audioContext;

      if (
        audioContext.state ===
        "suspended"
      ) {
        await audioContext.resume();
      }

      const microphoneSource =
        audioContext.createMediaStreamSource(
          stream
        );

      microphoneSourceRef.current =
        microphoneSource;

      const processor =
        audioContext.createScriptProcessor(
          4096,
          1,
          1
        );

      processorRef.current =
        processor;

      processor.onaudioprocess =
        (event) => {
          if (
            !sessionActiveRef.current
          ) {
            return;
          }

          const inputData =
            event.inputBuffer.getChannelData(
              0
            );

          processVoiceActivity(
            inputData
          );

          const socket =
            socketRef.current;

          if (
            !socket ||
            socket.readyState !==
              WebSocket.OPEN
          ) {
            return;
          }

          if (
            stream
              .getAudioTracks()[0]
              ?.enabled === false
          ) {
            return;
          }

          const pcm16 =
            convertFloat32ToPCM16(
              inputData
            );

          try {
            socket.send(
              pcm16
            );
          } catch (
            sendError
          ) {
            console.error(
              "MINDO audio send error:",
              sendError
            );
          }
        };

      microphoneSource.connect(
        processor
      );

      processor.connect(
        audioContext.destination
      );
    }, [processVoiceActivity]);

  /*
   * ==========================================================
   * STOP CAMERA
   * ==========================================================
   */

  const stopCamera =
    useCallback(() => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }

      if (
        cameraStreamRef.current
      ) {
        cameraStreamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        cameraStreamRef.current =
          null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      lastVideoTimeRef.current =
        -1;

      lastInferenceTimeRef.current =
        0;

      lastEmotionSendTimeRef.current =
        0;

      inferenceRunningRef.current =
        false;

      probabilityHistoryRef.current =
        [];

      setFaceDetected(false);
      setFerReady(false);
      setDominantEmotion(null);
      setEmotionProbabilities({});
    }, []);

  /*
   * ==========================================================
   * STOP MICROPHONE
   * ==========================================================
   */

  const stopMicrophone =
    useCallback(() => {
      finishUserSpeechIfActive();

      if (
        processorRef.current
      ) {
        try {
          processorRef.current.disconnect();
        } catch (_) {}

        processorRef.current.onaudioprocess =
          null;

        processorRef.current =
          null;
      }

      if (
        microphoneSourceRef.current
      ) {
        try {
          microphoneSourceRef.current.disconnect();
        } catch (_) {}

        microphoneSourceRef.current =
          null;
      }

      if (
        microphoneStreamRef.current
      ) {
        microphoneStreamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        microphoneStreamRef.current =
          null;
      }

      if (
        audioContextRef.current
      ) {
        try {
          audioContextRef.current.close();
        } catch (_) {}

        audioContextRef.current =
          null;
      }

      userSpeechActiveRef.current =
        false;

      speechStartCandidateBlocksRef.current =
        0;

      silenceBlocksRef.current =
        0;
    }, [
      finishUserSpeechIfActive,
    ]);

  /*
   * ==========================================================
   * START SESSION
   * ==========================================================
   */

  const startSession =
    useCallback(async () => {
      if (
        sessionActiveRef.current
      ) {
        return false;
      }

      if (!currentUser) {
        setError(
          "You must be logged in to start a MINDO session."
        );

        setConnectionState(
          "error"
        );

        return false;
      }

      resetSessionState();

      intentionalCloseRef.current =
        false;

      sessionActiveRef.current =
        true;

      setConnectionState(
        "connecting"
      );

      try {
        /*
         * ------------------------------------------------------
         * CREATE PLAYBACK CONTEXT
         * ------------------------------------------------------
         */

        const playbackContext =
          new AudioContext({
            sampleRate:
              PLAYBACK_SAMPLE_RATE,
          });

        playbackContextRef.current =
          playbackContext;

        if (
          playbackContext.state ===
          "suspended"
        ) {
          await playbackContext.resume();
        }

        /*
         * ------------------------------------------------------
         * GET FIREBASE ID TOKEN
         * ------------------------------------------------------
         */

        const firebaseIdToken =
          await currentUser.getIdToken();

        if (!firebaseIdToken) {
          throw new Error(
            "Could not obtain Firebase authentication token."
          );
        }

        /*
         * ------------------------------------------------------
         * OPEN WEBSOCKET
         * ------------------------------------------------------
         */

        const socket =
          new WebSocket(
            WS_URL
          );

        socket.binaryType =
          "arraybuffer";

        socketRef.current =
          socket;

        /*
         * ------------------------------------------------------
         * WAIT FOR WEBSOCKET OPEN
         * ------------------------------------------------------
         */

        await new Promise(
          (
            resolve,
            reject
          ) => {
            const timeout =
              setTimeout(
                () => {
                  reject(
                    new Error(
                      "Timed out connecting to the MINDO conversation server."
                    )
                  );
                },
                10000
              );

            socket.onopen =
              () => {
                clearTimeout(
                  timeout
                );

                resolve();
              };

            socket.onerror =
              () => {
                clearTimeout(
                  timeout
                );

                reject(
                  new Error(
                    "Could not connect to the MINDO conversation server."
                  )
                );
              };
          }
        );

        /*
         * ------------------------------------------------------
         * RECEIVE BACKEND EVENTS
         * ------------------------------------------------------
         */

        socket.onmessage =
          async (event) => {
            /*
             * Gemini audio.
             */

            if (
              event.data instanceof
              ArrayBuffer
            ) {
              playGeminiAudio(
                event.data
              );

              setCurrentSpeaker(
                "assistant"
              );

              return;
            }

            /*
             * Binary WebSocket messages
             * can also arrive as Blob.
             */

            if (
              event.data instanceof
              Blob
            ) {
              const buffer =
                await event.data.arrayBuffer();

              playGeminiAudio(
                buffer
              );

              setCurrentSpeaker(
                "assistant"
              );

              return;
            }

            /*
             * Backend JSON.
             */

            if (
              typeof event.data !==
              "string"
            ) {
              return;
            }

            try {
              const data =
                JSON.parse(
                  event.data
                );

              /*
               * Firebase authentication success.
               */

              if (
                data.type ===
                "auth_ok"
              ) {
                return;
              }

              /*
               * Real backend session ID.
               */

              if (
                data.type ===
                "session_started"
              ) {
                if (
                  data.session_id
                ) {
                  setSessionId(
                    data.session_id
                  );

                  console.log(
                    "[MINDO] Session started:",
                    data.session_id
                  );
                }

                return;
              }

              /*
               * Final/normal transcription.
               */

              if (
                data.type ===
                "transcription"
              ) {
                handleTranscription(
                  data.role,
                  data.text || ""
                );

                return;
              }

              /*
               * Interim user transcription.
               */

              if (
                data.type ===
                "transcription_interim"
              ) {
                if (
                  data.role ===
                    "user" &&
                  data.text
                ) {
                  setInterimTranscript(
                    data.text
                  );
                }

                return;
              }

              /*
               * Backend error.
               */

              if (
                data.type ===
                "error"
              ) {
                setError(
                  data.message ||
                    "Backend error."
                );

                setConnectionState(
                  "error"
                );
              }
            } catch (
              parseError
            ) {
              console.error(
                "MINDO invalid WebSocket JSON:",
                parseError
              );
            }
          };

        /*
         * ------------------------------------------------------
         * WEBSOCKET ERROR
         * ------------------------------------------------------
         */

        socket.onerror =
          () => {
            setError(
              "The connection to the conversation server was interrupted."
            );

            setConnectionState(
              "error"
            );
          };

        /*
         * ------------------------------------------------------
         * WEBSOCKET CLOSE
         * ------------------------------------------------------
         */

        socket.onclose =
          async () => {
            socketRef.current =
              null;

            /*
             * Normal completion of the ending flow.
             *
             * The backend keeps the WebSocket alive until
             * Gemini finishes the automatic final reflection.
             *
             * IMPORTANT:
             *
             * Gemini finishing generation does NOT necessarily
             * mean the browser has finished playing all audio
             * chunks already scheduled in the Web Audio timeline.
             *
             * Therefore we wait for the queued audio to finish
             * before closing the playback context.
             */

            if (
              endingRequestedRef.current
            ) {
              sessionActiveRef.current =
                false;

              console.log(
                "[MINDO] Final Gemini reflection generated. Waiting for queued audio playback to finish..."
              );

              await waitForPlaybackToFinish();

              /*
               * If the component was unmounted while audio was
               * draining, cleanup already owns the lifecycle.
               */

              if (
                !endingRequestedRef.current
              ) {
                return;
              }

              endingRequestedRef.current =
                false;

              if (
                playbackContextRef.current
              ) {
                try {
                  await playbackContextRef.current.close();
                } catch (_) {}

                playbackContextRef.current =
                  null;
              }

              setCurrentSpeaker(null);

              setInterimTranscript("");

              setConnectionState(
                "ended"
              );

              console.log(
                "[MINDO] Final Gemini reflection audio finished and connection closed. Backend processing has started."
              );

              return;
            }

            /*
             * Preserve existing unexpected-disconnect behavior.
             */

            if (
              !intentionalCloseRef.current
            ) {
              sessionActiveRef.current =
                false;

              finishUserSpeechIfActive();

              stopMicrophone();
              stopCamera();

              setConnectionState(
                "disconnected"
              );
            }
          };

        /*
         * ------------------------------------------------------
         * AUTHENTICATE WEBSOCKET
         * ------------------------------------------------------
         *
         * This MUST be the first message sent after
         * the WebSocket opens.
         */

        await new Promise(
          (
            resolve,
            reject
          ) => {
            const authTimeout =
              setTimeout(
                () => {
                  socket.removeEventListener(
                    "message",
                    handleAuthMessage
                  );

                  reject(
                    new Error(
                      "Timed out waiting for backend authentication."
                    )
                  );
                },
                10000
              );

            const handleAuthMessage =
              (event) => {
                if (
                  typeof event.data !==
                  "string"
                ) {
                  return;
                }

                try {
                  const data =
                    JSON.parse(
                      event.data
                    );

                  if (
                    data.type ===
                    "auth_ok"
                  ) {
                    clearTimeout(
                      authTimeout
                    );

                    socket.removeEventListener(
                      "message",
                      handleAuthMessage
                    );

                    resolve();
                  }

                  if (
                    data.type ===
                    "error"
                  ) {
                    clearTimeout(
                      authTimeout
                    );

                    socket.removeEventListener(
                      "message",
                      handleAuthMessage
                    );

                    reject(
                      new Error(
                        data.message ||
                          "Backend authentication failed."
                      )
                    );
                  }
                } catch (_) {
                  /*
                   * Ignore non-JSON messages while waiting
                   * for authentication confirmation.
                   */
                }
              };

            socket.addEventListener(
              "message",
              handleAuthMessage
            );

            socket.send(
              JSON.stringify({
                type: "auth",
                token:
                  firebaseIdToken,
              })
            );
          }
        );

        /*
         * ------------------------------------------------------
         * AUTHENTICATION SUCCEEDED
         * ------------------------------------------------------
         */

        await startMicrophone();

        await startCamera();

        setConnectionState(
          "active"
        );

        return true;
      } catch (
        startupError
      ) {
        console.error(
          "MINDO session startup failed:",
          startupError
        );

        setError(
          startupError.message ||
            "Could not start the MINDO session."
        );

        sessionActiveRef.current =
          false;

        intentionalCloseRef.current =
          true;

        endingRequestedRef.current =
          false;

        stopMicrophone();
        stopCamera();

        const socket =
          socketRef.current;

        if (
          socket &&
          (
            socket.readyState ===
              WebSocket.OPEN ||
            socket.readyState ===
              WebSocket.CONNECTING
          )
        ) {
          try {
            socket.close();
          } catch (_) {}
        }

        socketRef.current =
          null;

        if (
          playbackContextRef.current
        ) {
          try {
            await playbackContextRef.current.close();
          } catch (_) {}

          playbackContextRef.current =
            null;
        }

        setConnectionState(
          "error"
        );

        return false;
      }
    }, [
      currentUser,
      finishUserSpeechIfActive,
      handleTranscription,
      playGeminiAudio,
      resetSessionState,
      startCamera,
      startMicrophone,
      stopCamera,
      stopMicrophone,
      waitForPlaybackToFinish,
    ]);

  /*
   * ==========================================================
   * STOP SESSION
   * ==========================================================
   */

  const stopSession =
    useCallback(async () => {
      /*
       * Do not send multiple end requests while the final
       * Gemini reflection is already being generated.
       */

      if (
        endingRequestedRef.current
      ) {
        return;
      }

      /*
       * If absolutely nothing is running,
       * there is nothing to stop.
       */

      if (
        !sessionActiveRef.current &&
        !socketRef.current
      ) {
        return;
      }

      console.log(
        "[MINDO] Ending session:",
        sessionId
      );

      /*
       * --------------------------------------------------------
       * ENTER ENDING STATE
       * --------------------------------------------------------
       *
       * User interaction stops now, but the SAME Gemini Live
       * connection stays alive for the automatic final reflection.
       */

      intentionalCloseRef.current =
        true;

      endingRequestedRef.current =
        true;

      sessionActiveRef.current =
        false;

      setClosingReflection("");

      setConnectionState(
        "ending"
      );

      /*
       * --------------------------------------------------------
       * STOP USER MEDIA
       * --------------------------------------------------------
       */

      finishUserSpeechIfActive();

      stopMicrophone();
      stopCamera();

      /*
       * --------------------------------------------------------
       * REQUEST FINAL GEMINI REFLECTION
       * --------------------------------------------------------
       *
       * IMPORTANT:
       * Do NOT close the WebSocket here.
       */

      const sent =
        sendJSON({
          type: "end_session",
        });

      if (!sent) {
        console.error(
          "[MINDO] Could not send end_session request."
        );

        endingRequestedRef.current =
          false;

        intentionalCloseRef.current =
          false;

        const socket =
          socketRef.current;

        if (
          socket &&
          (
            socket.readyState ===
              WebSocket.OPEN ||
            socket.readyState ===
              WebSocket.CONNECTING
          )
        ) {
          try {
            socket.close(
              1000,
              "Unable to request final reflection"
            );
          } catch (_) {}
        }

        socketRef.current =
          null;

        if (
          playbackContextRef.current
        ) {
          try {
            await playbackContextRef.current.close();
          } catch (_) {}

          playbackContextRef.current =
            null;
        }

        setCurrentSpeaker(null);

        setInterimTranscript("");

        setConnectionState(
          "ended"
        );

        return;
      }

      console.log(
        "[MINDO] Final Gemini reflection requested. Waiting for Gemini to finish..."
      );

      /*
       * DO NOT:
       *
       * - close the WebSocket
       * - null socketRef
       * - close playbackContext
       * - set connectionState to "ended"
       *
       * The existing onmessage handler remains active so
       * Gemini's final audio and transcription are displayed.
       *
       * The onclose handler waits for the browser audio queue
       * to finish before completing the ending flow.
       */
    }, [
      finishUserSpeechIfActive,
      sendJSON,
      sessionId,
      stopCamera,
      stopMicrophone,
    ]);

  /*
   * ==========================================================
   * MICROPHONE TOGGLE
   * ==========================================================
   */

  const toggleMicrophone =
    useCallback(() => {
      const stream =
        microphoneStreamRef.current;

      const track =
        stream
          ?.getAudioTracks()
          ?.[0];

      if (!track) {
        return;
      }

      track.enabled =
        !track.enabled;

      setMicMuted(
        !track.enabled
      );

      if (!track.enabled) {
        finishUserSpeechIfActive();
      }
    }, [
      finishUserSpeechIfActive,
    ]);

  /*
   * ==========================================================
   * CAMERA TOGGLE
   * ==========================================================
   */

  const toggleCamera =
    useCallback(() => {
      const stream =
        cameraStreamRef.current;

      const track =
        stream
          ?.getVideoTracks()
          ?.[0];

      if (!track) {
        return;
      }

      track.enabled =
        !track.enabled;

      setCameraOff(
        !track.enabled
      );

      if (!track.enabled) {
        setFaceDetected(
          false
        );

        setDominantEmotion(
          null
        );

        setEmotionProbabilities(
          {}
        );
      }
    }, []);

  /*
   * ==========================================================
   * CLEANUP ON UNMOUNT
   * ==========================================================
   */

  useEffect(() => {
    return () => {
      intentionalCloseRef.current =
        true;

      /*
       * Setting this false tells an in-progress playback-drain
       * operation that component cleanup has taken over.
       */

      endingRequestedRef.current =
        false;

      sessionActiveRef.current =
        false;

      finishUserSpeechIfActive();

      stopMicrophone();
      stopCamera();

      const socket =
        socketRef.current;

      if (
        socket &&
        (
          socket.readyState ===
            WebSocket.OPEN ||
          socket.readyState ===
            WebSocket.CONNECTING
        )
      ) {
        try {
          socket.close(
            1000,
            "Component unmounted"
          );
        } catch (_) {}
      }

      socketRef.current =
        null;

      if (
        playbackContextRef.current
      ) {
        try {
          playbackContextRef.current.close();
        } catch (_) {}

        playbackContextRef.current =
          null;
      }
    };
  }, [
    finishUserSpeechIfActive,
    stopCamera,
    stopMicrophone,
  ]);

  /*
   * ==========================================================
   * PUBLIC API
   * ==========================================================
   */

  return {
    /*
     * Backend-owned unique session ID.
     */

    sessionId,

    connectionState,

    error,

    isActive:
      connectionState ===
      "active",

    isConnecting:
      connectionState ===
      "connecting",

    isEnding:
      connectionState ===
      "ending",

    /*
     * Normal conversation transcript.
     */

    transcript,

    /*
     * Dedicated final Gemini closing reflection.
     */

    closingReflection,

    interimTranscript,

    currentSpeaker,

    micMuted,

    cameraOff,

    toggleMicrophone,

    toggleCamera,

    videoRef,

    faceDetected,

    ferReady,

    dominantEmotion,

    emotionProbabilities,

    startSession,

    stopSession,
  };
}