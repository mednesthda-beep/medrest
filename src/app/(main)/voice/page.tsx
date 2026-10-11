"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2, Info } from "lucide-react";
import { useSensorStore } from "@/lib/sensors";

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("Click the microphone to start speaking...");
  const [response, setResponse] = useState("");
  const { currentData } = useSensorStore();

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript("Voice assistant stopped.");
      return;
    }

    setIsListening(true);
    setTranscript("Listening... try saying 'What's my heart rate?'");
    
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition is not supported in this browser.");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(`You said: "${text}"`);
      processCommand(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setTranscript("Error occurred during speech recognition. Please try again.");
      setIsListening(false);
    };

    recognition.start();
  };

  const processCommand = (text: string) => {
    let reply = "I'm sorry, I didn't understand that command.";
    
    if (text.includes("heart rate")) {
      reply = `Your latest heart rate reading is ${currentData.heartRate || 72} beats per minute.`;
    } else if (text.includes("temperature")) {
      reply = `Your body temperature is ${currentData.temperature || 36.7} degrees celsius.`;
    } else if (text.includes("medicine") || text.includes("medication")) {
      reply = `You have one upcoming medication at 8 PM, which is Lisinopril 10 milligrams.`;
    } else if (text.includes("oxygen") || text.includes("spo2")) {
      reply = `Your blood oxygen level is at ${currentData.spo2 || 98} percent.`;
    }

    setResponse(reply);
    
    // Use Speech Synthesis to speak the reply
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(reply);
    synth.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Voice Assistant</h1>
        <p className="text-muted-foreground mt-1">Hands-free interactions using the Web Speech API.</p>
      </header>

      <div className="glass-card rounded-2xl p-8 border border-border/50 text-center flex flex-col items-center justify-center min-h-[400px]">
        
        <button 
          onClick={handleMicClick}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${
            isListening 
              ? 'bg-primary/20 text-primary border-4 border-primary shadow-primary/30 animate-pulse' 
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border/50'
          }`}
        >
          {isListening ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12" />}
        </button>

        <div className="mt-8 space-y-4 max-w-lg">
          <p className="text-lg font-medium text-foreground min-h-[30px]">
            {transcript}
          </p>
          
          {response && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3 text-left">
              <Volume2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-foreground">{response}</p>
            </div>
          )}
        </div>

      </div>

      <div className="bg-secondary/30 border border-border/50 rounded-xl p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Supported Commands
        </h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>"What's my heart rate?"</li>
          <li>"What's my temperature?"</li>
          <li>"When is my next medicine?"</li>
          <li>"What is my blood oxygen?"</li>
        </ul>
      </div>
    </div>
  );
}
