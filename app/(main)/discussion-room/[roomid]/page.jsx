"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { AIModel, AIModelFeedback } from "@/services/GlobalServices";
import Image from "next/image";
import axios from "axios";

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });

  const [expert, setExpert] = useState();
  const [enableMicrophone, setEnableMicrophone] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const [enableFeedback, setEnableFeedback] = useState(false);

  const recognitionRef = useRef(null);
  const isManuallyDisconnected = useRef(false);
  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const UpdateSummery = useMutation(api.DiscussionRoom.UpdateSummery);


  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData.expertName);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const cleanText = (text) => {
    return text.replace(/<\｜begin▁of▁sentence\｜>/g, "").trim();
  };

  // 🧠 Speak text using TTS API route
  const speakText = async (text) => {
    try {
      const response = await axios.post("/api/speech", { text }, { responseType: "arraybuffer" });
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
    }
  };

  // Process AI message queue
  useEffect(() => {
    if (messageQueue.length === 0) return;

    const processQueue = async () => {
      const nextMessage = messageQueue[0];
      try {
        const completion = await AIModel(nextMessage.topic, nextMessage.coachingOption, nextMessage.msg);
        let aiReply = completion?.choices?.[0]?.message?.content || "No response from AI.";
        aiReply = cleanText(aiReply);

        setChatHistory(prev => [...prev, { sender: "ai", text: aiReply }]);
        await speakText(aiReply); // 🔊 Play AI reply
      } catch (err) {
        setChatHistory(prev => [...prev, { sender: "ai", text: "⚠️ Error getting AI response." }]);
      } finally {
        setMessageQueue(prev => prev.slice(1));
      }
    };

    processQueue();
  }, [messageQueue]);

  const sendToAI = (message) => {
    if (!DiscussionRoomData) return;
    const topic = DiscussionRoomData?.topic || "General discussion";
    const coachingOption = DiscussionRoomData?.coachingOptions;
    setMessageQueue(prev => [...prev, { topic, coachingOption, msg: message }]);
  };

  const connectToServer = () => {
    setEnableMicrophone(true);
    isManuallyDisconnected.current = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support speech recognition.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const message = event.results[i][0].transcript.trim();
          setChatHistory(prev => [...prev, { sender: "user", text: message }]);
          sendToAI(message);
          setTranscript(prev => prev + " " + message);
        }
      }
    };

    recognition.onend = () => {
      if (!isManuallyDisconnected.current) {
        recognition.start();
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const disconnectToServer = async () => {
    if (recognitionRef.current) {
      isManuallyDisconnected.current = true;
      recognitionRef.current.stop();
    }

    setEnableMicrophone(false);

    if (DiscussionRoomData) {
      try {
        await UpdateConversation({
          id: DiscussionRoomData._id,
          conversation: chatHistory
        });
        console.log("Conversation uploaded successfully.");
      } catch (err) {
        console.error("Failed to upload conversation:", err);
      }
    }

    setEnableFeedback(true); // show feedback button
  };

const sendFeedback = async () => {
  if (!DiscussionRoomData) return;

  try {
    // Call AIModelFeedback to generate the summary
    const feedbackResponse = await AIModelFeedback(
      DiscussionRoomData.coachingOptions,
      chatHistory
    );

    // Extract the text from the AI response
    const summaryText = feedbackResponse?.choices?.[0]?.message?.content || "No feedback generated.";

    // Save summary to database using Convex mutation
    await UpdateSummery({
      id: DiscussionRoomData._id,
      summery: summaryText
    });

    console.log("Feedback summary saved to DB:", summaryText);
    alert("Feedback processed and saved successfully!");
    setEnableFeedback(false); // hide button after sending
  } catch (err) {
    console.error("Failed to process and save feedback:", err);
    alert("Failed to process feedback.");
  }
};

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">{DiscussionRoomData?.coachingOptions}</h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <Image
              src={expert?.avatar}
              alt="Avatar"
              width={200}
              height={100}
              className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
            />
            <h2 className="text-gray-500">{expert?.name}</h2>
            {enableMicrophone && (
              <div className="absolute bottom-32 p-2 bg-white rounded-lg max-w-[90%]">
                <h3 className="text-sm font-medium">Live Transcript:</h3>
                <p>{transcript}</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-center">
            {!enableMicrophone
              ? <button onClick={connectToServer} className="btn-primary">Connect</button>
              : <button onClick={disconnectToServer} className="btn-secondary">Disconnect</button>}
          </div>
        </div>

        <div>
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col p-4 overflow-y-auto">
            {chatHistory.length === 0
              ? <p className="text-gray-400 text-center mt-5">Start speaking to begin chat...</p>
              : chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`my-2 p-2 rounded-lg max-w-[80%] ${msg.sender === "user"
                      ? "self-end bg-blue-500 text-white text-right ml-auto"
                      : "self-start bg-gray-100 text-gray-800 text-left mr-auto"
                    }`}
                  >
                    <p><strong>{msg.sender === "user" ? "You" : expert?.name || "AI"}:</strong> {msg.text}</p>
                  </div>
                ))}
          </div>
          <h2 className="mt-4 text-gray-400 text-sm text-center">
            At end of conversation we will automatically generate feedback
          </h2>

          {enableFeedback && (
            <div className="flex justify-center mt-4">
              <button onClick={sendFeedback} className="btn-primary">
                Send Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
