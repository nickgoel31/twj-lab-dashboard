'use server'

import {  PricingPlan, Prisma } from '@/lib/generated/prisma'
import { revalidatePath } from 'next/cache'
import {prisma} from '@/lib/prisma'



// Define the nested type that includes the plans relation
export type PricingCategoryWithPlans = Prisma.PricingCategoryGetPayload<{
  include: { plans: true }
}>

// 1. GET ALL DATA
// Changed: Returns the array directly to fix ".map is not a function"
export async function getPricingData() {
  try {
    const data = await prisma.pricingCategory.findMany({
      include: {
        plans: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    })
    return data
  } catch (error) {
    console.error('Failed to fetch pricing:', error)
    return []
  }
}

// 2. UPDATE PLAN
export async function updatePricingPlan(data: PricingPlan) {
  try {
    const updated = await prisma.pricingPlan.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        featured: data.featured,
        everythingIncludedPrev: data.everythingIncludedPrev,
        features: data.features,
        featuresNotIncluded: data.featuresNotIncluded
      }
    })
    
    revalidatePath('/') 
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to update plan:', error)
    return { success: false, error: 'Failed to update plan' }
  }
}

// 3. CREATE NEW PLAN
export async function createPricingPlan(categoryId: number) {
  try {
    const newPlan = await prisma.pricingPlan.create({
      data: {
        name: 'New Plan',
        description: 'Description here',
        price: '$0',
        categoryId: categoryId,
        features: ['New Feature'],
        featuresNotIncluded: []
      }
    })
    
    revalidatePath('/')
    return { success: true, data: newPlan }
  } catch (error) {
    console.error('Failed to create plan:', error)
    return { success: false, error: 'Failed to create plan' }
  }
}

// 4. DELETE PLAN
export async function deletePricingPlan(planId: number) {
  try {
    await prisma.pricingPlan.delete({
      where: { id: planId }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete', errorCode: error }
  }
}