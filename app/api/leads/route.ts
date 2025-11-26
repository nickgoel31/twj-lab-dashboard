import { createLead, LeadFormData } from '@/actions/leads';
import { NextResponse } from 'next/server';


type LeadData = {
  name: string;
  company?: string;
  contact: string;
  services: string[];
  budget: string;
};


export async function POST(req: Request) {
    // ensure JSON
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    let body: LeadData;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { name, budget, contact, services, company } = body;
    const errors: Record<string, string> = {};

    if (!name || typeof name !== 'string') errors.name = 'name is required and must be a string';


    if (!contact || typeof contact !== 'string') errors.contact = 'contact is required and must be a string';

    if (!budget || typeof budget !== 'string') errors.budget = 'budget is required and must be a string';

    if (!services || !Array.isArray(services) || services.some(s => typeof s !== 'string')) {
        errors.services = 'services is required and must be an array of strings';
    }
    if (company && typeof company !== 'string') {
        errors.company = 'company must be a string if provided';
    }

    if (Object.keys(errors).length) {
        return NextResponse.json({ errors }, { status: 422 });
    }

    const lead: LeadFormData = {
        name: name ?? null,
        companyName: company ?? '',
        email: contact,
        projectSummary: services.join(', '),
        dealValue: budget,
        industry: '',
        country: '',
        currency: 'USD',
        contactNotes: '',
    };

    // Persist the lead. Replace this with your DB call (Prisma, Mongo, etc.)
    try {
        await createLead(lead);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to persist lead' }, { status: 500 });
    }

    return NextResponse.json({ data: lead }, { status: 201 });
}

