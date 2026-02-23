
import React, { useState, useRef, useEffect } from 'react';
import { getOrientationAssistantResponse, generateFmcsaVideo } from '../services/geminiService';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const OrientationAssistant: React.FC = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Welcome to SwiftLink Academy! I am your AI Safety Mentor. I can generate custom FMCSA training videos for you. Which topic should we visualize?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Video Generation States
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const modules = [
    {
      title: 'FMCSA Safety Rules',
      category: 'Compliance',
      description: 'Understanding DOT numbers, safety ratings, and roadside inspections.',
      icon: '🛡️',
      topics: ['DOT Compliance', 'Roadside Procedures', 'Safety Management Cycles']
    },
    {
      title: 'ELD & HOS Mastery',
      category: 'Operations',
      description: 'The 11-hour, 14-hour, and 70-hour rules. Using the electronic log system.',
      icon: '📟',
      topics: ['Logging Breaks', 'Personal Conveyance', 'Yard Move Usage']
    },
    {
      title: 'Incident Reporting',
      category: 'Safety',
      description: 'What to do in case of an accident or equipment failure.',
      icon: '🚨',
      topics: ['Accident Photo Protocol', 'Dispatcher Communication', 'Insurance Files']
    }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleDownloadVideo = () => {
    if (!customVideoUrl) return;
    
    const link = document.createElement('a');
    link.href = customVideoUrl;
    // Clean filename: SwiftLink_Academy_Module_Name.mp4
    const filename = `SwiftLink_Academy_${modules[activeModule].title.replace(/\s+/g, '_')}.mp4`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateVideo = async () => {
    try {
      setError(null);
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }

      setIsGeneratingVideo(true);
      const videoUrl = await generateFmcsaVideo(modules[activeModule].title, (status) => {
        setGenerationStatus(status);
      });
      
      setCustomVideoUrl(videoUrl);
      setMessages(prev => [...prev, { role: 'ai', text: `I've generated a custom training video for ${modules[activeModule].title}. You can watch it in the academy player now or download it for offline use.` }]);
    } catch (err: any) {
      if (err.message === 'KEY_RESET_REQUIRED') {
        setError("API Key Error. Please re-select your paid project key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setError("Failed to generate video. Please ensure you have a paid project selected.");
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const context = `User is currently viewing the ${modules[activeModule].title} module.`;
    const response = await getOrientationAssistantResponse(userMsg, context);

    setMessages(prev => [...prev, { role: 'ai', text: response || 'I am sorry, I could not process that request.' }]);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)] animate-in fade-in duration-500">
      {/* Left Column: Learning Materials */}
      <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Driver Orientation Hub</h2>
              <p className="text-slate-500 mt-2">Complete these modules to activate your profile.</p>
            </div>
            <div className="flex gap-3">
              {customVideoUrl && (
                <button 
                  onClick={handleDownloadVideo}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  📥 Download
                </button>
              )}
              <button 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                {isGeneratingVideo ? '⏳ Generating...' : '🎬 Generate AI Training'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {modules.map((m, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setActiveModule(idx);
                setCustomVideoUrl(null);
              }}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-6 ${
                activeModule === idx 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                : 'bg-white text-slate-900 border-slate-100 hover:border-blue-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                  activeModule === idx ? 'bg-white/10' : 'bg-slate-50'
                }`}>
                  {m.icon}
                </div>
                <div>
                  <h4 className="font-black text-lg leading-tight">{m.title}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeModule === idx ? 'text-blue-400' : 'text-slate-400'}`}>
                    {m.category} • AI Interactive
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   activeModule === idx ? 'bg-blue-600' : 'bg-slate-100 text-slate-400'
                 }`}>
                   {activeModule === idx ? 'Viewing' : 'Select'}
                 </span>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player Area */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 relative min-h-[400px]">
          {isGeneratingVideo ? (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-12 text-center space-y-6 animate-pulse">
              <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-white text-2xl font-black tracking-tighter">SwiftLink Veo Rendering</h3>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">{generationStatus}</p>
              <div className="max-w-xs text-slate-500 text-[10px] leading-relaxed uppercase">
                Generating high-fidelity training footage. This may take 2-3 minutes as we process compliance frames.
              </div>
            </div>
          ) : customVideoUrl ? (
            <div className="relative h-full">
              <video 
                src={customVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-cover bg-black"
              />
              <button 
                onClick={handleDownloadVideo}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Save Video
              </button>
            </div>
          ) : (
            <>
              <div className="aspect-video bg-slate-900 relative group cursor-pointer" onClick={handleGenerateVideo}>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                   <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                      <span className="text-white text-3xl">🎬</span>
                   </div>
                   <p className="text-white text-xs font-black uppercase tracking-widest">Generate Training Module</p>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Compliance Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {modules[activeModule].topics.map((t, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="text-xs font-bold text-slate-700">{t}</span>
                     </div>
                   ))}
                </div>
                {error && (
                  <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center space-y-2">
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">System Alert</p>
                    <p className="text-rose-900 text-xs font-medium text-center">{error}</p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-600 text-[9px] font-black uppercase underline">Billing Documentation</a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: AI Assistant */}
      <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 relative">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">✨</div>
              <div>
                 <h4 className="text-white font-black tracking-tight">AI Orientation Mentor</h4>
                 <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Active Safety Guidance</p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-dark">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-xl' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-800 p-5 rounded-[2rem] rounded-bl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
           <div className="relative group">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about HOS, ELD or Roadside..."
                className="w-full bg-slate-800 text-white pl-6 pr-14 py-4 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-slate-700 placeholder:text-slate-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 w-12 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg"
              >
                ➔
              </button>
           </div>
           <p className="text-[9px] text-slate-500 text-center mt-3 uppercase tracking-tighter font-medium">SwiftLink Veo 3.1 & Gemini 3 Pro</p>
        </div>
      </div>
    </div>
  );
};

export default OrientationAssistant;
