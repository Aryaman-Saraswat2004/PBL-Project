"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { AIModel } from "@/services/GlobalServices";
import Image from "next/image";

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });

  const [expert, setExpert] = useState();
  const [enableMicrophone, setEnableMicrophone] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData.expertName);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  // Queue processor to prevent multiple simultaneous requests
  useEffect(() => {
    if (messageQueue.length === 0) return;

    const processQueue = async () => {
      const nextMessage = messageQueue[0];
      try {
        const completion = await AIModel(nextMessage.topic, nextMessage.coachingOption, nextMessage.msg);
        const aiReply = completion?.choices?.[0]?.message?.content || "No response from AI.";
        setChatHistory(prev => [...prev, { sender: "ai", text: aiReply }]);
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

    recognition.start();
    recognitionRef.current = recognition;
  };

  const disconnectToServer = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setEnableMicrophone(false);
  };

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">{DiscussionRoomData?.coachingOptions}</h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <Image 
              src={expert?.avatar} 
              alt='Avatar' 
              width={200} 
              height={100} 
              className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
            />
            <h2 className="text-gray-500">{expert?.name}</h2>
            {enableMicrophone && (
              <div className="absolute bottom-32 p-2 bg-white rounded-lg">
                <h3 className="text-sm font-medium">Live Transcript:</h3>
                <p>{transcript}</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-center">
            {!enableMicrophone
              ? <button onClick={connectToServer}>Connect</button>
              : <button onClick={disconnectToServer}>Disconnect</button>}
          </div>
        </div>

        <div>
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col p-4 overflow-y-auto">
            {chatHistory.length === 0
              ? <p className="text-gray-400 text-center mt-5">Start speaking to begin chat...</p>
              : chatHistory.map((msg, index) => (
                  <div key={index} className={`my-2 p-2 rounded-lg max-w-[80%] ${msg.sender === "user" ? "self-end bg-blue-500 text-white text-right ml-auto" : "self-start bg-gray-100 text-gray-800 text-left mr-auto"}`}>
                    <p><strong>{msg.sender === "user" ? "You" : expert?.name || "AI"}:</strong> {msg.text}</p>
                  </div>
                ))
            }
          </div>
          <h2 className="mt-4 text-gray-400 text-sm text-center">
            At end of conversation we will automatically generate feedback
          </h2>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
