import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, Send, User, ChevronRight, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AIChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Harmony AI. I can help you resolve conflicts or give advice on how to handle difficult situations. If you need to report an incident, I can help you file that too.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reportDraft, setReportDraft] = useState(null); // { title, description }
  
  const messagesEndRef = useRef(null);
  const { addReport } = useReports();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textInput) => {
    const text = typeof textInput === 'string' ? textInput : input;
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    if (typeof textInput !== 'string') setInput('');
    setIsTyping(true);

    // Simulated AI response to bypass quota limit: 0
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let replyText = "I understand. To help you better, could you provide a bit more detail about what happened and give it a short title?";

      if (lowerText.includes('title:') || (messages.length > 2 && lowerText.length > 20)) {
        // Trigger auto-submit extraction
        replyText = "Thank you for sharing those details. I've prepared a draft report based on what you told me.\n\n[READY_TO_SUBMIT]\n" + JSON.stringify({
          title: "Reported Incident",
          description: text
        });
      } else if (lowerText.includes('fight') || lowerText.includes('angry')) {
        replyText = "It sounds like tensions are high. Please ensure you are physically safe first. Would you like to file a formal safety report about this?";
      } else if (lowerText.includes('noise')) {
        replyText = "Noise conflicts can be very disruptive. I can help you document this. What would you title this incident, and can you describe the disturbance?";
      } else if (lowerText.includes('report') || lowerText.includes('yes')) {
        replyText = "Okay, I can help you file an anonymous report. Please give me a brief Title, followed by a Description of what occurred.";
      }

      // Check if ready to submit
      if (replyText.includes('[READY_TO_SUBMIT]')) {
        const parts = replyText.split('[READY_TO_SUBMIT]');
        replyText = parts[0].trim();
        
        try {
          const jsonStr = parts[1].trim();
          const draft = JSON.parse(jsonStr);
          setReportDraft(draft);
          replyText += "\n\nI have gathered the details. Please review the draft report below and click 'Submit Report' to finalize it.";
        } catch (e) {
          console.error("Failed to parse report draft JSON:", e);
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: replyText, sender: 'ai' }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleFinalSubmit = () => {
    if (reportDraft) {
      addReport({
        userId: currentUser?.uid || 'user_1',
        title: reportDraft.title,
        description: reportDraft.description,
        category: 'AI Chat Intake',
        priority: 'Medium',
        department: 'General Review',
        status: 'pending',
        date: 'Just now',
        userConfirmed: false,
      });
      alert('Report submitted successfully via AI Assistant!');
      navigate('/dashboard');
    }
  };

  const quickReplies = [
    "How do I report harassment?",
    "What happens to my report?",
    "I'm feeling angry"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-white">AI Conflict Coach</h1>
        <p className="text-slate-600 dark:text-slate-400">Get private, objective advice on handling disputes before they escalate.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden animate-fade-in-up">
        <CardHeader className="border-b border-slate-200 dark:border-white/5 py-4 bg-slate-50 dark:bg-dark-900/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-400" />
            </div>
            Harmony Assistant
            <span className="ml-2 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] md:max-w-[70%] rounded-2xl p-4 flex gap-3 shadow-lg",
                msg.sender === 'user' 
                  ? "bg-brand-accent text-brand-dark font-medium rounded-br-sm shadow-sm" 
                  : "bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-bl-sm"
              )}>
                {msg.sender === 'ai' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-primary-400" />}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.sender === 'user' && <User className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Draft Report Review UI */}
          {reportDraft && !isTyping && (
            <div className="flex justify-start animate-fade-in-up mt-4">
              <div className="w-full max-w-[80%] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <FileText className="w-24 h-24 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-brand-dark dark:text-emerald-400 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review Your Report Draft
                </h3>
                <div className="space-y-3 mb-6 relative z-10">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-emerald-400/70 font-medium">TITLE</label>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{reportDraft.title}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-emerald-400/70 font-medium">DESCRIPTION</label>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{reportDraft.description}</p>
                  </div>
                </div>
                <div className="flex gap-3 relative z-10">
                  <Button variant="outline" className="flex-1 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400" onClick={() => setReportDraft(null)}>
                    Edit / Cancel
                  </Button>
                  <Button variant="gradient" className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white" onClick={handleFinalSubmit}>
                    Submit Report
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 bg-slate-50 dark:bg-dark-900/80 border-t border-slate-200 dark:border-white/5 backdrop-blur-xl">
          {messages.length < 3 && !isTyping && (
            <div className="flex flex-wrap gap-2 mb-4">
              {quickReplies.map((reply, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  {reply} <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your conflict..." 
              className="flex-1"
            />
            <Button type="submit" variant="gradient" size="icon" disabled={!input.trim() || isTyping} className="w-12 h-12 shrink-0 rounded-xl">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
