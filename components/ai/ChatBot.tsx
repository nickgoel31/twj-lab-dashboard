"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "bot"
  text: string
}

const sampleQueries = [
  "Show me all unpaid invoices for clients in Europe",
  "Summarize today’s project updates",
  "Draft a follow-up email to the London café lead",
  "Estimate profit if I hire Contractor X for Project Y",
]

export default function ChatBot() {
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now(), sender: "user", text: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")

    // 💡 Fake AI response (replace with real API)
    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: `🤖 Processing your query: "${userMsg.text}"`,
      }
      setMessages(prev => [...prev, botMsg])
    }, 600)
  }

  return (
    <div className="relative h-screen w-full flex flex-col bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 text-white">
      <AnimatePresence>
        {!started && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Personal Assistant
            </h1>
            <p className="text-gray-300 mt-4 max-w-2xl text-lg md:text-xl">
              Ask anything across your finances, projects, and tasks—instantly.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {sampleQueries.map((query, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start text-left border-gray-700 bg-gray-800/40 hover:bg-gray-700/60 rounded-xl shadow-md text-sm md:text-base"
                  onClick={() => {
                    setInput(query)
                    setStarted(true)
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-cyan-400" />
                  {query}
                </Button>
              ))}
            </div>

            <Button
              size="lg"
              className="mt-10 px-10 py-6 text-lg bg-cyan-500 hover:bg-cyan-600 rounded-2xl shadow-xl"
              onClick={() => setStarted(true)}
            >
              Start a Blank Chat
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {started && (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm md:text-base shadow-md backdrop-blur-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "bg-gray-800/60 text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-gray-700 bg-gray-900/80 p-4 flex gap-2 shadow-lg">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="bg-gray-800/60 border-none text-white focus:ring-2 focus:ring-cyan-500 rounded-xl"
            />
            <Button
              onClick={sendMessage}
              className="bg-cyan-500 hover:bg-cyan-600 rounded-xl"
            >
              Send
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
