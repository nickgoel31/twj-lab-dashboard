'use server'

import { Prisma } from '@/lib/generated/prisma'
import { prisma } from '@/lib/prisma' // Ensure this path matches your prisma instance location

import { revalidatePath } from 'next/cache'

// Export this type so the Client Component can use it
export type PortfolioItemWithTestimonialsAndStats = Prisma.PortfolioItemGetPayload<{
  include: { 
    testimonial: true,
    stats: true
   }
}>

// 1. GET ALL
export async function getPortfolioData(): Promise<PortfolioItemWithTestimonialsAndStats[]> {
  try {
    const data = await prisma.portfolioItem.findMany({
      select: {
        id: true,
        createdAt: true,        // <- add this
        updatedAt: true,        // <- and this
        companyName: true,
        companyLogo: true,
        industry: true,
        location: true,
        website: true,
        heroLine: true,
        heroImage: true,
        description: true,
        projectDuration: true,
        problemStatement: true,
        solution: true,
        results: true,
        services: true,
        media: true,            // <- add this
        testimonial: {
          select: {
            id: true,
            portfolioItemId: true,
            author: true,
            quote: true,
            designation: true,
          },
        },
        stats: {
          select: {
            id: true,
            portfolioItemId: true,
            conversionRateIncrease: true,
            trafficGrowth: true,
            userGrowth: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    })
    return data
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return []
  }
}

export async function updatePortfolioItem(data: PortfolioItemWithTestimonialsAndStats) {
  try {
    // ⚠️ Logic Check: 
    // If 'data' comes directly from the DB type, data.services is already a JSON string.
    // If 'data' comes from a Form where you converted it to an array, you must Stringify it back here.
    
    // Assuming data.services is strictly complying with the Prisma Type (String):
    const updated = await prisma.portfolioItem.update({
      where: { id: data.id },
      data: {
        // ... other fields ...
        companyName: data.companyName,
        companyLogo: data.companyLogo,
        industry: data.industry,
        location: data.location,
        website: data.website,
        heroLine: data.heroLine,
        heroImage: data.heroImage,
        description: data.description,
        projectDuration: data.projectDuration,
        problemStatement: data.problemStatement,
        solution: data.solution,
        results: data.results,
        
        // ✅ FIX: Ensure this is a string. 
        // If your types allow arrays, wrap this in JSON.stringify(data.services)
        services: data.services, 
        media: data.media,

        // ... (Testimonials and Stats logic remains the same) ...
        testimonial: data.testimonial ? {
          upsert: {
            create: {
              quote: data.testimonial.quote || '',
              author: data.testimonial.author || '',
              designation: data.testimonial.designation || ''
            },
            update: {
              quote: data.testimonial.quote || '',
              author: data.testimonial.author || '',
              designation: data.testimonial.designation || ''
            }
          }
        } : undefined,

        stats: data.stats ? {
            upsert: {
                create: {
                    conversionRateIncrease: data.stats.conversionRateIncrease || '',
                    trafficGrowth: data.stats.trafficGrowth || '',
                    userGrowth: data.stats.userGrowth || ''
                },
                update: {
                    conversionRateIncrease: data.stats.conversionRateIncrease || '',
                    trafficGrowth: data.stats.trafficGrowth || '',
                    userGrowth: data.stats.userGrowth || ''
                }
            }
        } : undefined
      },
      include: {
        testimonial: true,
        stats: true
      }
    })
    
    revalidatePath('/') 
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to update portfolio item:', error)
    return { success: false, error: 'Failed to update' }
  }
}

// 3. CREATE
export async function createPortfolioItem() {
  try {
    const newItem = await prisma.portfolioItem.create({
      data: {
        companyName: 'Untitled Project',
        companyLogo: '',
        industry: 'Tech',
        location: 'Remote',
        website: '',
        heroLine: 'Project Headline',
        heroImage: '',
        description: '',
        projectDuration: new Date().getFullYear().toString(),
        problemStatement: '',
        solution: '',
        results: '',
        
        // ✅ FIX: SQLite expects a String, not an Array
        // We initialize it as an empty JSON array string "[]"
        services: '[]', 
        media: '[]',
        
        testimonial: {
            create: {
                quote: "",
                author: "",
                designation: ""
            }
        },
        stats: {
            create: {
                conversionRateIncrease: "",
                trafficGrowth: "",
                userGrowth: ""
            }
        }
      },
      include: {
        testimonial: true,
        stats: true
      }
    })
    
    revalidatePath('/')
    return { success: true, data: newItem }
  } catch (error) {
    console.error('Failed to create portfolio item:', error)
    return { success: false, error: 'Failed to create' }
  }
}

// 4. DELETE
export async function deletePortfolioItem(id: number) {
  try {
    await prisma.portfolioItem.delete({
      where: { id }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: error }
  }
}