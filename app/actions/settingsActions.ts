"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SettingsSchema } from '@/lib/validations';
import { auth } from '@/auth';

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

export async function getSettings(requestedCompanyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, settings: defaultSettings };
    
    // FORCER l'utilisation du companyId de la session (IDOR Fix)
    const companyId = session.user.companyId as string;
    
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

export async function saveSettings(requestedCompanyId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé." };
    
    // FORCER l'utilisation du companyId de la session (IDOR Fix)
    const companyId = session.user.companyId as string;
    
    const validated = SettingsSchema.safeParse({
      ...data,
      companyId: companyId
    });
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
          const buffer = Buffer.from(matches[2], 'base64');
          
          // Validation stricte des Magic Bytes (CWE-434 Fix)
          const { fileTypeFromBuffer } = await import('file-type');
          const typeInfo = await fileTypeFromBuffer(buffer);
          
          if (!typeInfo || !typeInfo.mime.startsWith('image/')) {
            throw new Error("Fichier invalide ou corrompu.");
          }
          
          const type = typeInfo.ext;
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
