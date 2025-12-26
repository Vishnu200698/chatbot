import React, { useEffect, useRef, useState } from 'react';

// MicButton handles push-to-talk and hold-to-talk via Web Speech API (client STT)
export default function MicButton({ onFinalTranscript, isBarging }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Browser does not support Web Speech API');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SpeechRecognition();
    r.interimResults = true;
    r.lang = 'en-US';
    r.continuous = false;
    recognitionRef.current = r;

    r.onresult = (evt) => {
      let interimText = '';
      let finalText = '';
      for (let i = evt.resultIndex; i < evt.results.length; ++i) {
        const res = evt.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      setInterim(interimText);
      if (finalText) {
        setInterim('');
        onFinalTranscript(finalText.trim(), /*duration_ms*/ null);
      }
    };

    r.onerror = (e) => {
      console.error('STT error', e);
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
    };

    return () => {
      r.abort();
    };
  }, [onFinalTranscript]);

  const start = async () => {
    if (!recognitionRef.current) return alert('No Web Speech support in this browser.');
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) { console.error(e); }
  };

  const stop = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  return (
    <div>
      <button
        className="mic"
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        aria-pressed={listening}
        title="Hold to speak (push-to-talk)"
      >
        {listening ? 'Listening… (release to send)' : 'Hold to talk'}
      </button>
      <div className="transcript">{interim}</div>
    </div>
  );
}
