"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Template = {
  id: string
  name: string
  content: string
}

const starterTemplates: Template[] = [
  { id: "t1", name: "Standard Service Agreement", content: "This Agreement is made between [Client] and [Your Company]..." },
  { id: "t2", name: "NDA", content: "This Non-Disclosure Agreement is entered into by and between [Client] and [Your Company]..." },
  { id: "t3", name: "Website Proposal", content: "Project Scope: Design & develop a responsive website...\nTimeline: 6 weeks\nPricing: $4500" }
]

export default function ProposalsPage() {
  const [templates, setTemplates] = useState<Template[]>(starterTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [scope, setScope] = useState("")
  const [pricing, setPricing] = useState("")
  const [timeline, setTimeline] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [clientBrief, setClientBrief] = useState("")
  const [signature, setSignature] = useState<string | null>(null)
  const [polishLoading, setPolishLoading] = useState(false)

  const createProposal = () => {
    const draft = `Project Scope:\n${scope}\n\nPricing:\n${pricing}\n\nTimeline:\n${timeline}`
    setProposalText(draft)
    toast.success("Proposal generated successfully!")
  }

  const runAiDraft = () => {
    if (!clientBrief) return toast.error("Enter a client brief first.")
    setAiLoading(true)
    setTimeout(() => {
      setProposalText(
        `AI Draft based on client brief:\n\nProject Scope: ${clientBrief}\n\nPricing: $5000 (estimated)\nTimeline: 6 weeks\nDeliverables: Website design, development & testing`
      )
      setAiLoading(false)
      toast.success("AI draft generated!")
    }, 1200)
  }

  const polishLanguage = () => {
    if (!proposalText) return toast.error("No proposal to polish.")
    setPolishLoading(true)
    setTimeout(() => {
      setProposalText(
        proposalText.replace(/([a-z])\./g, "$1. ").replace(/\bi\b/g, "I") +
          "\n\n✨ AI Polished for clarity and professionalism."
      )
      setPolishLoading(false)
      toast.success("Language polished!")
    }, 1000)
  }

  const saveTemplate = () => {
    if (!proposalText.trim()) return toast.error("Nothing to save.")
    const id = Date.now().toString()
    setTemplates(prev => [...prev, { id, name: `Custom Template ${prev.length + 1}`, content: proposalText }])
    toast.success("Template saved to library!")
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Proposal & Document Automation</h1>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="builder">Proposal Builder</TabsTrigger>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="ai">AI Drafting</TabsTrigger>
          <TabsTrigger value="esign">E-Signature</TabsTrigger>
        </TabsList>

        {/* ✅ PROPOSAL BUILDER */}
        <TabsContent value="builder">
          <Card>
            <CardHeader><CardTitle>Proposal Builder</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Input placeholder="Project Scope" value={scope} onChange={e => setScope(e.target.value)} />
                <Input placeholder="Pricing" value={pricing} onChange={e => setPricing(e.target.value)} />
                <Input placeholder="Timeline" value={timeline} onChange={e => setTimeline(e.target.value)} />
                <Button onClick={createProposal}>Generate Proposal</Button>
                <Button variant="outline" onClick={saveTemplate} className="w-full">Save as Template</Button>
              </div>
              <ScrollArea className="h-64 border rounded p-3">
                {proposalText || "Generated proposal will appear here..."}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ TEMPLATE LIBRARY */}
        <TabsContent value="templates">
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map(t => (
              <Card
                key={t.id}
                className={cn(
                  "cursor-pointer transition hover:ring-2 hover:ring-primary",
                  selectedTemplate?.id === t.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTemplate(t)}
              >
                <CardHeader><CardTitle>{t.name}</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-32 text-sm">{t.content}</ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ✅ AI DRAFTING */}
        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>AI Proposal Drafting</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste client brief here..."
                value={clientBrief}
                onChange={e => setClientBrief(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={runAiDraft} disabled={aiLoading}>
                  {aiLoading ? "Generating..." : "Generate AI Draft"}
                </Button>
                <Button onClick={polishLanguage} disabled={polishLoading}>
                  {polishLoading ? "Polishing..." : "Polish Language"}
                </Button>
              </div>
              <ScrollArea className="h-64 border rounded p-3">
                {proposalText || "AI draft will appear here..."}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ E-SIGNATURE */}
        <TabsContent value="esign">
          <Card>
            <CardHeader><CardTitle>Digital E-Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Sign Document</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Draw Your Signature</DialogTitle></DialogHeader>
                  <SignaturePad onSign={setSignature} />
                </DialogContent>
              </Dialog>
              {signature && (
                <div className="border p-4 rounded bg-white">
                  <p className="font-medium mb-2">Preview:</p>
                  <img src={signature} alt="Signature preview" className="h-16 object-contain" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* --- Canvas Signature Component --- */
function SignaturePad({ onSign }: { onSign: (dataUrl: string) => void }) {
  const [drawing, setDrawing] = useState(false)
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)

  const start = () => setDrawing(true)
  const end = () => {
    setDrawing(false)
    if (canvasRef) onSign(canvasRef.toDataURL())
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasRef) return
    const ctx = canvasRef.getContext("2d")
    if (!ctx) return
    const rect = canvasRef.getBoundingClientRect()
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 1.5, 0, 2 * Math.PI)
    ctx.fill()
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <canvas
        ref={setCanvasRef}
        width={400}
        height={200}
        className="border rounded bg-gray-50"
        onMouseDown={start}
        onMouseUp={end}
        onMouseMove={draw}
      />
      <Button variant="secondary" onClick={() => {
        if (!canvasRef) return
        const ctx = canvasRef.getContext("2d")
        if (ctx) ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)
        onSign("")
      }}>Clear</Button>
    </div>
  )
}
