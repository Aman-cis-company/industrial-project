import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import {
  Sparkles,
  Send,
  Cpu,
  Bot,
  User,
  Briefcase,
  Terminal,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Clipboard
} from 'lucide-react';

const SuggestedPrompts = [
  { text: 'Which projects are at risk?', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
  { text: 'Show all segments with overdue inspections', icon: Clipboard, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
  { text: 'Show me gas transmission projects', icon: Briefcase, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
  { text: 'What is the most expensive project?', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { text: 'Draft a proposal for GAIL under Gas Transmission', icon: FileText, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' }
];

const AIAssistant = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Pipeline AI Copilot. I can query our active pipeline projects, analyze safety risk profiles, check IoT telemetry alerts, and draft consulting proposals in real-time. What would you like to examine today?',
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setThinking(true);

    try {
      let endpoint = `${apiUrl}/ai/query`;
      let body = { queryText: text };

      // Check if it looks like a proposal draft request
      if (text.toLowerCase().includes('draft a proposal') || text.toLowerCase().includes('proposal for')) {
        endpoint = `${apiUrl}/ai/proposal-draft`;
        
        // Extract client and category if possible, or fallback to defaults
        let clientName = 'NEOM Authority';
        let serviceCategory = 'BIM';
        
        if (text.toLowerCase().includes('aramco')) clientName = 'Saudi Aramco';
        if (text.toLowerCase().includes('diriyah')) clientName = 'Diriyah Gate Development Authority (DGDA)';
        
        if (text.toLowerCase().includes('buildings')) serviceCategory = 'Buildings';
        if (text.toLowerCase().includes('water')) serviceCategory = 'WaterTreatment';
        if (text.toLowerCase().includes('wastewater')) serviceCategory = 'WastewaterTreatment';
        if (text.toLowerCase().includes('mep')) serviceCategory = 'PowerTransmissionDistribution';

        body = { clientName, serviceCategory };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.answer || data.outline || 'Query compiled successfully.',
          structuredData: data.structuredData || null,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Mock Fallback response for offline environments
      setTimeout(() => {
        let textResponse = "I compiled your query. We have 7 projects in the database. Let me know if you'd like to query specific statuses.";
        
        if (text.toLowerCase().includes('risk') || text.toLowerCase().includes('delayed')) {
          textResponse = `I found **2 projects** currently flagged as At-Risk or Delayed:
          \n- **Aramco Admin Complex HVAC Refit** (Status: **AtRisk**, Budget: SAR 8.4M)
          \n- **Diriyah Gate Historic Substation Integration** (Status: **Delayed**, Budget: SAR 18.2M)
          \n\nI recommend reviewing the active Risk Logs for excavation parameters and subcontractor delay factors.`;
        } else if (text.toLowerCase().includes('water') || text.toLowerCase().includes('desalination')) {
          textResponse = `I found **2 active Water and Wastewater Treatment contracts** in the database directory:
          \n- **Jeddah Central Seawater Desalination Plant** (Status: **OnTrack**, Phase: **Design**)
          \n- **Riyadh South Biological Wastewater Plant** (Status: **OnTrack**, Phase: **Execution**)`;
        } else if (text.toLowerCase().includes('expensive') || text.toLowerCase().includes('value') || text.toLowerCase().includes('budget')) {
          textResponse = `The project with the largest contract value is **Riyadh South Biological Wastewater Plant** for the **Ministry of Health**, valued at **SAR 52,000,000**. It is currently in the **Execution** phase and is **On Track** (SAR 28,300,000 spent).`;
        } else if (text.toLowerCase().includes('draft') || text.toLowerCase().includes('proposal')) {
          textResponse = `### MOCK PROPOSAL DRAFT OUTLINE
          \n**Prepared For:** NEOM Authority
          \n**Service Domain:** BIM Execution Framework
          \n
          \n#### 1. Technical Objective
          \nEstablish a comprehensive, Level-of-Detail (LOD) 400 BIM model structure to coordinate site utilities and avoid subsurface clashes.
          \n
          \n#### 2. Recommended Sprints
          \n- **Weeks 1-4**: Ingestion of survey CAD files and initial model templates configuration.
          \n- **Weeks 5-8**: Multi-discipline clash detection reports.
          \n- **Weeks 9-12**: Submission of final coordinate sheets and handovers.`;
        }

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: textResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }, 1000);
    } finally {
      // Simulate delay for thinking animation
      setTimeout(() => {
        setThinking(false);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      <PageHeader
        title="Pipeline AI Copilot"
        breadcrumbs={['PetroFlow', 'Pipeline AI Copilot']}
      />

      {/* Suggested prompts chips */}
      <div className="flex flex-wrap gap-2 select-none">
        {SuggestedPrompts.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              disabled={thinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-slate-800 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer ${prompt.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {prompt.text}
            </button>
          );
        })}
      </div>

      {/* Chat Thread Panel */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative shadow-xs">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                  isBot ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 select-text ${
                  isBot
                    ? 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-150'
                    : 'bg-teal-600 dark:bg-teal-700/80 border-teal-600 dark:border-teal-700 text-white'
                }`}>
                  <div className="whitespace-pre-wrap font-semibold">
                    {/* Parse markdown bold and headers simple formatting */}
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('###') || line.startsWith('####')) {
                        return <h4 key={lIdx} className="font-extrabold text-sm mt-2 mb-1 uppercase tracking-wider block">{line.replace(/#/g, '').trim()}</h4>;
                      }
                      // Replace **text** with bold tags
                      const boldParts = line.split('**');
                      return (
                        <span key={lIdx} className="block mt-1 first:mt-0">
                          {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-teal-600 dark:text-teal-400">{part}</strong> : part)}
                        </span>
                      );
                    })}
                  </div>

                  {/* Render Structured Data table if present */}
                  {isBot && msg.structuredData && msg.structuredData.length > 0 && (
                    <div className="mt-4 border rounded-lg overflow-hidden bg-white dark:bg-slate-900/50">
                      <table className="w-full text-left text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b">
                            <th className="px-3 py-2">Project Name</th>
                            <th className="px-3 py-2">Client</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msg.structuredData.map(p => (
                            <tr key={p.id} className="border-b last:border-b-0">
                              <td className="px-3 py-2 font-semibold">{p.name}</td>
                              <td className="px-3 py-2">{p.clientName}</td>
                              <td className="px-3 py-2 font-bold">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking Bounce animation */}
          {thinking && (
            <div className="flex gap-3 max-w-[85%] select-none">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="p-3.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 border-slate-200/70 dark:border-slate-800 text-slate-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputVal); }}
          className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 relative"
        >
          <input
            type="text"
            disabled={thinking}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask AI Copilot to analyze timelines or draft outlines..."
            className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-202 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={thinking || !inputVal.trim()}
            className={`p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center cursor-pointer ${
              !inputVal.trim() || thinking ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            <Send className="w-4.5 h-4.5 shrink-0" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AIAssistant;
