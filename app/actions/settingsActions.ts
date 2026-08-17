"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const defaultSettings = {
  companyName: "",
  companyId: "",
  address: "",
  email: "",
  phone: "",
  logo: null
};

export async function getSettings(companyId?: string) {
  try {
    if (!companyId) return { success: false, settings: defaultSettings };
    
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (company) {
      return { 
        success: true, 
        settings: {
          companyName: company.name,
          companyId: company.taxNumber || defaultSettings.companyId,
          address: company.address || defaultSettings.address,
          email: company.email || defaultSettings.email,
          phone: company.phone || defaultSettings.phone,
          logo: company.logoUrl || defaultSettings.logo
        } 
      };
    }
    return { success: false, settings: defaultSettings };
  } catch (error) {
    console.error("Error getting settings:", error);
    return { success: false, settings: defaultSettings };
  }
}

export async function saveSettings(companyId: string, data: any) {
  try {
    if (!companyId) return { success: false };
    
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.companyName,
        taxNumber: data.companyId,
        address: data.address,
        email: data.email,
        phone: data.phone,
        logoUrl: data.logo
      }
    });
    
    revalidatePath('/dashboard/company');
    return { success: true, settings: {
        companyName: company.name,
        companyId: company.taxNumber,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo: company.logoUrl
    }};
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false };
  }
}
