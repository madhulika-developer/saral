import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Sparkles,
  WifiOff,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  CornerDownRight
} from 'lucide-react';

export const AssistantChat = ({ isFloating = false, onClose = null }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, utility, health, showToast } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // Speech Recognition & Synthesis states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Session ID for conversation memory
  const sessionIdRef = useRef(`session_${currentUser}_${Date.now()}`);

  // Dynamic suggestion chips
  const [currentSuggestions, setCurrentSuggestions] = useState([
    "Why did my bill double?",
    "Where is my deducted payment?",
    "Is there an outage near me?",
    "How can I reduce next month's bill?"
  ]);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map language code to BCP 47 tag
      const langMap = {
        te: 'te-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        ur: 'ur-IN',
        en: 'en-IN'
      };
      recognition.lang = langMap[i18n.language] || 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [i18n.language]);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      const isTe = i18n.language === 'te';
      const isHi = i18n.language === 'hi';

      const initialText = isTe
        ? "నమస్కారం! నేను **సరళ (Saral)** AI అసిస్టెంట్‌ని. మీ విద్యుత్ మరియు నీటి బిల్లులు, చెల్లింపుల స్థితి, లేదా విద్యుత్ కోతల గురించి నన్ను ఏ భాషలోనైనా అడగవచ్చు. నేను మీకు ఎలా సహాయపడగలను?"
        : isHi
        ? "नमस्ते! मैं **सरल (Saral)** AI सहायक हूँ। मैं आपके बिजली व पानी बिलों की स्थिति, रुके हुए भुगतान और आपूर्ति कटौती के बारे में किसी भी भाषा में आपकी सहायता कर सकता हूँ।"
        : "Hello! I am **Saral**, your personal utility assistant. I can explain why your bill changed, track in-transit payments, or check outages in Vijayawada. How may I assist you today?";

      setMessages([
        {
          role: 'assistant',
          content: initialText,
          source: health.mode === 'ai_online' ? 'ai' : 'offline',
          actions: [
            { label: 'Explain Bill Increase', action: 'navigate', payload: '/bills' },
            { label: 'Track Payment', action: 'navigate', payload: '/payments' }
          ]
        }
      ]);
    }
  }, [i18n.language, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Voice Input Toggle
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      showToast('Speech recognition not supported in this browser', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const langMap = {
          te: 'te-IN',
          hi: 'hi-IN',
          ta: 'ta-IN',
          kn: 'kn-IN',
          ml: 'ml-IN',
          mr: 'mr-IN',
          bn: 'bn-IN',
          gu: 'gu-IN',
          pa: 'pa-IN',
          ur: 'ur-IN',
          en: 'en-IN'
        };
        recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech error:', err);
      }
    }
  };

  // Text-to-Speech Read Aloud
  const speakText = (text, index) => {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis not available', 'error');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters
    const clean = text.replace(/[*#>`_-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);

    const langMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
      en: 'en-IN'
    };
    utterance.lang = langMap[i18n.language] || 'en-IN';

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Send Message with Streaming SSE
  const handleSend = async (messageToSend = null) => {
    const text = messageToSend || inputText;
    if (!text.trim() || isStreaming) return;

    setInputText('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsStreaming(true);

    // Placeholder for assistant stream
    const assistantIndex = newMessages.length;
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', actions: [], source: health.mode === 'ai_online' ? 'ai' : 'offline' }
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          message: text,
          user_id: currentUser,
          lang: i18n.language,
          utility: utility
        })
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let streamActions = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'meta') {
                if (parsed.actions) streamActions = parsed.actions;
                if (parsed.suggestions && parsed.suggestions.length > 0) {
                  setCurrentSuggestions(parsed.suggestions);
                }
              } else if (parsed.type === 'chunk') {
                accumulated += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[assistantIndex] = {
                    ...updated[assistantIndex],
                    content: accumulated,
                    actions: streamActions
                  };
                  return updated;
                });
              } else if (parsed.type === 'done') {
                setIsStreaming(false);
              }
            } catch (e) {
              // Ignore partial stream parse errors
            }
          }
        }
      }
    } catch (err) {
      console.warn('Chat streaming error, falling back locally:', err);
      // Fallback message
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: 'assistant',
          content: "I am Saral. Your latest bill for June is **₹1,641** (285 units). Your payment of **₹1,641** via UPI is safe in transit at the gateway. How else may I assist you?",
          actions: [
            { label: 'View Bill Breakdown', action: 'navigate', payload: '/bills' },
            { label: 'Track Payment', action: 'navigate', payload: '/payments' }
          ],
          source: 'offline'
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.action === 'navigate') {
      navigate(action.payload);
      if (onClose) onClose();
    } else if (action.action === 'query') {
      handleSend(action.payload);
    } else if (action.action === 'copy_complaint') {
      navigate('/payments');
      if (onClose) onClose();
    } else if (action.action === 'call') {
      window.location.href = action.payload;
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Message copied to clipboard', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    sessionIdRef.current = `session_${currentUser}_${Date.now()}`;
    showToast('Conversation reset', 'info');
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${
      isFloating ? 'h-[580px] w-full max-w-[420px]' : 'h-[calc(100vh-140px)] w-full max-w-4xl mx-auto'
    }`}>
      
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm tracking-tight">{t('assistant.title')}</h2>
              {health.mode === 'ai_online' ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  AI
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30" title="Offline deterministic engine">
                  Offline Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-teal-100/80 leading-none mt-0.5">
              {t('assistant.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
            title={t('assistant.clear_chat')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors ml-1 font-bold text-sm"
              title="Close chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice & Disclaimer Banner */}
      <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          {t('assistant.disclaimer')}
        </span>
        <button
          onClick={() => handleSend("Connect me to official utility office contacts")}
          className="text-teal-600 dark:text-teal-400 hover:underline shrink-0 ml-2 font-medium"
        >
          {t('assistant.escalate_office')}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Message Content rendered cleanly */}
              <div className="whitespace-pre-wrap space-y-1.5 font-normal">
                {msg.content}
              </div>

              {/* Action Buttons attached to Assistant Reply */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleActionClick(act)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-600 shadow-xs transition-colors"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Tools: Read Aloud & Copy */}
            {msg.role === 'assistant' && msg.content && (
              <div className="flex items-center gap-2 mt-1 px-1">
                <button
                  type="button"
                  onClick={() => speakText(msg.content, index)}
                  className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title={speakingIndex === index ? 'Stop audio' : 'Listen to reply'}
                >
                  {speakingIndex === index ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.content, index)}
                  className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="Copy message"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Typing / Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-[11px]">Saral is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 shrink-0 font-medium">Suggestions:</span>
        {currentSuggestions.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(suggestion)}
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-2xs"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isListening ? t('assistant.stop_listening') : t('assistant.listening')}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? t('assistant.listening') : t('assistant.input_placeholder')}
            disabled={isStreaming}
            className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none placeholder:text-slate-400 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-teal-600/20"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
