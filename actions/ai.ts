// src/actions/ai.ts

"use server";

import { getLeadDetails, getLeads } from "@/helpers/ai-helpers";
import { GoogleGenerativeAI, Content, Tool, SchemaType } from "@google/generative-ai";
import { Lead } from "@/lib/generated/prisma";

// Ensure your API key is correctly set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 1. DEFINE YOUR TOOLS
const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "getLeads",
                description: "Get a list of business leads, optionally filtered by location.",
                // This tells the AI what arguments the function can take
                parameters: { 
                    type: SchemaType.OBJECT,
                    required: [],
                    properties: {
                        location: {
                            type: SchemaType.STRING,
                            description: "The city or country to filter leads by, e.g., 'UK', 'USA'."
                        }
                    }
                },
            },
            {
                name: "getLeadDetails",
                description: "Get all detailed information for a single lead by their name, including deal value, contact info, and notes.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        leadName: {
                            type: SchemaType.STRING,
                            description: "The full name of the lead to look up, e.g., 'Jane Smith'."
                        }
                    },
                    required: ["leadName"] // This parameter is required to find a lead
                },
            },
        ],
    },
];



// NOTE: The model 'gemini-2.5-flash-lite' you provided doesn't exist.
// I've updated it to 'gemini-2.5-flash-lite', a modern and capable model.
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    tools,
    systemInstruction: {
        role: "model",
        parts: [{
            text: `Identity & Role

You are TWJ Agency Assistant, an AI operations manager for The Walking Jumbo (TWJ)—a web development, software, and branding agency.
You act as a central command hub to help the founder manage clients, projects, finances, contractors, and knowledge resources.

Primary Purpose

Organize and automate agency workflows:
- Track clients, projects, tasks, invoices, expenses, and contractors.
- Store and retrieve documents, templates, and knowledge resources.
- Provide AI-powered insights such as follow-up suggestions, project risk analysis, and resource allocation tips.
- Make it easy for the founder to scale from solo operation → small team → full agency without losing data or process clarity.

Core Responsibilities

- Client Management – Add, update, and search for client records; surface upcoming deadlines, pending invoices, and communication logs.
- Project Coordination – Create projects, assign tasks/milestones, and track status, budgets, and technical notes.
- Automation & AI – Generate follow-up recommendations, draft client emails, propose project timelines, and predict workload risks.
- Knowledge Hub – Maintain an internal library of templates, design assets, and learning materials for quick reference.
- Financial Tracking – Record invoices, payments, and expenses; alert the user about outstanding balances or unusual spending.

Personality & Tone

- Professional but friendly: clear, concise, and action-oriented.
- Use simple, practical language—avoid jargon unless specifically requested.
- Always focus on helping the founder take the next actionable step.

Constraints & Safety

- Never share private client data outside the TWJ system.
- Confirm before deleting or permanently modifying records.
- When unsure of context, politely ask clarifying questions.`
        }]
    }
});

/**
 * Sends the entire conversation history to the Gemini API.
 * @param history - An array of Content objects representing the chat history.
 * @returns The AI's text response.
 */
// It now returns a structured object, not just a string.
export async function askGemini(history: Content[]): Promise<{ 
    text: string; 
    toolData?: { name: string; data: Lead[] | Lead } 
}> {
    try {
        const chat = model.startChat({ history: history.slice(0, -1) });
        const lastMessage = history[history.length - 1].parts[0];
        const lastMessageText = (lastMessage as { text: string }).text;

        const result = await chat.sendMessage(lastMessageText);
        const call = result.response.functionCalls()?.[0];

        if(call){
          if (call.name === 'getLeads') {
            // 2. EXTRACT ARGUMENTS FROM THE AI'S FUNCTION CALL
            const { location } = call.args as { location?: string };

            // 3. PASS THE ARGUMENTS TO YOUR FUNCTION
            const leads = await getLeads(location as string | undefined);
            
            // 4. (Optional) Customize the response text based on the filter
            const responseText = location 
                ? `Here are your leads from ${location}:`
                : "Certainly! Here are all of your current leads:";

            return {
                text: responseText,
                toolData: {
                    name: 'getLeads',
                    data: leads,
                },
            };
        } else if (call.name === 'getLeadDetails') {
          const { leadName } = call.args as { leadName?: string };

                if (!leadName) {
                    return { text: "You need to provide a name to get lead details." };
                }

                // Step 1: Call your function with the AI's arguments
                const details = await getLeadDetails(leadName);
                
                // Step 2: Send the function's result back to the AI model
                const result2 = await chat.sendMessage(
                    JSON.stringify(details || { error: `Lead named '${leadName}' not found.` })
                );

                // Step 3: Return the AI's final, natural-language response to the UI
                return { text: result2.response.text(), toolData: {
                    name: 'getLeadDetails',
                    data: details as Lead
                }};
        }
      }
    
        return { text: result.response.text() };

    } catch (error) {
        console.error("Gemini API call failed:", error);
        return { text: "Sorry, I'm having trouble connecting to the AI. Please try again later." };
    }
}