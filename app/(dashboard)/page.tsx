// src/app/your-page-directory/page.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { askGemini } from "@/actions/ai";
import LeadsList from '@/components/ai/LeadsList';
import { Lead } from '@/lib/generated/prisma';
import LeadDetailsCard from '@/components/ai/LeadDetails';
// Assuming you have this component for rich tool results
// import ToolResult from '@/components/ai/ToolResult';

// --- INTERFACE ---
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  component?: React.ReactNode;
}

// --- ICONS (Keep as is) ---
const SendIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>);
const WandIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.62-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621m7.5 4.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

// --- MAIN PAGE COMPONENT ---
export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'ai', text: `Today's Date is: ${new Date().toLocaleDateString()}` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Show me all unpaid invoices.",
        "Summarize today’s project updates.",
        "Get details for the London cafe lead.",
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (messageText: string = input) => {
        if (!messageText.trim() || isLoading) return;

        const newUserMessage: Message = { id: Date.now(), text: messageText, sender: 'user' };
        
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // THE FIX IS HERE 👇
            // We filter out the very first message if it's from the AI (the initial greeting).
            const history = updatedMessages
                .filter((msg, index) => !(index === 0 && msg.sender === 'ai'))
                .map(msg => ({
                    role: msg.sender === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }],
                }));
            
            // If the history is empty after filtering (i.e., this is the very first user message),
            // we still need to send it.
            if (history.length === 0) {
                history.push({
                    role: 'user',
                    parts: [{ text: newUserMessage.text }]
                });
            }
            
            const response = await askGemini(history);
            
            let newAiMessage: Message;

            // 2. CHECK IF THE RESPONSE CONTAINS OUR TOOL DATA
            if (response.toolData?.name === 'getLeads') {
                newAiMessage = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: response.text,
                    // 3. IF IT DOES, RENDER OUR NEW LeadsList COMPONENT
                    component: <LeadsList leads={response.toolData.data as Lead[]} />
                };
            } 
            if (response.toolData?.name === 'getLeadDetails') {
                newAiMessage = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: response.text,
                    // 3. IF IT DOES, RENDER OUR NEW LeadDetails COMPONENT
                    component: <LeadDetailsCard details={response.toolData.data as Lead} />
                };
            } else {
                // 4. OTHERWISE, HANDLE IT AS A STANDARD TEXT MESSAGE
                newAiMessage = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: response.text,
                };
            }

            setMessages(prev => [...prev, newAiMessage]);

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: `⚠️ Error: ${errorMsg}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    return (
        <div className=" text-foreground h-[calc(100vh-4rem)]  w-full flex flex-col items-center justify-center p-6 ">
            <div className="w-full h-full">
                {/* <header className="">
                    <h1 className="font-bold tracking-tight text-card-foreground">TWJ AI</h1>
                    <p className="text-xs text-muted-foreground">Your global chatbot for instant insights.</p>
                </header> */}

                {messages.length <= 1 && (
                     <div className="px-6 py-6 gap-2  flex flex-col items-center justify-center">
                        <div className='text-center'>
                            <h2 className="text-4xl font-bold mb-2 bg-linear-to-l from-blue-700 to-violet-600 text-transparent bg-clip-text">Hello, Harsh</h2>
                            <p className="text-2xl text-muted-foreground font-semibold">I&apos;m your AI assistant. How can I help you today?</p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full max-w-3xl'>
                                {suggestions.slice(0, 3).map(s => (
                                <button key={s} onClick={() => handleSend(s)} className="p-2 text-xs text-center bg-muted/50 border border-border rounded-md text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <main className="flex-1 p-6 max-w-5xl mx-auto overflow-y-auto space-y-6 pb-28">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0"><WandIcon className="w-5 h-5"/></div>}
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.component}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0"><WandIcon className="w-5 h-5"/></div>
                           <div className="max-w-md p-3 rounded-lg bg-muted text-muted-foreground flex items-center gap-1">
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </main>
                
                

                <footer className="p-4 fixed bottom-0 left-0 w-full bg-background z-20">
                    <form onSubmit={handleFormSubmit} className="relative max-w-3xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., 'Summarize today's project updates...'"
                            className="w-full bg-input border-border rounded-lg pl-4 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary disabled:opacity-50" disabled={isLoading || !input.trim()}>
                            <SendIcon />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}