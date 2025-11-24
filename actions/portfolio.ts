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
export async function getPortfolioData() {
  try {
    const data = await prisma.portfolioItem.findMany({
      include: {
        testimonial: true,
        stats: true
      },
      orderBy: { id: 'asc' }
    })
    return data as PortfolioItemWithTestimonialsAndStats[]
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return []
  }
}

// 2. UPDATE
export async function updatePortfolioItem(data: PortfolioItemWithTestimonialsAndStats) {
  try {
    const updated = await prisma.portfolioItem.update({
      where: { id: data.id },
      data: {
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
        services: data.services,
        media: data.media,

        // UPSERT: Updates if exists, Creates if it doesn't
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
        services: [],
        media: [],
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