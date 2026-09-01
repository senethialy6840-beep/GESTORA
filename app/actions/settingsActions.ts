"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SettingsSchema } from '@/lib/validations';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

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
    
    const validated = SettingsSchema.safeParse(data);
    if (!validated.success) {
      console.error("Validation failed", validated.error.issues);
      return { success: false, error: "Données invalides." };
    }
    
    data = validated.data;
    let logoUrl = data.logo;
    
    // Check if the logo is a new base64 upload
    if (logoUrl && logoUrl.startsWith('data:image/')) {
      try {
        const matches = logoUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const type = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `${companyId}-${Date.now()}.${type}`;
          
          const { data: uploadData, error } = await getSupabase()
            .storage
            .from('logos')
            .upload(filename, buffer, {
              contentType: `image/${type}`,
              upsert: true
            });
            
          if (error) {
            console.error("Supabase upload error:", error);
          } else {
            const { data: publicUrlData } = getSupabase().storage.from('logos').getPublicUrl(filename);
            logoUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.error("Error processing logo upload:", err);
      }
    }
    
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.companyName,
        taxNumber: data.companyId,
        address: data.address,
        email: data.email,
        phone: data.phone,
        logoUrl: logoUrl
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
