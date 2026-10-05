"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SettingsSchema } from '@/lib/validations';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

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
  logo: null,
  currency: "XOF",
  timezone: "GMT",
  dateFormat: "DD/MM/YYYY",
  invoicePrefix: "FAC-",
  invoiceFooter: ""
};

export async function getSettings(requestedCompanyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, settings: defaultSettings };
    
    // FORCER l'utilisation du companyId de la session (IDOR Fix)
    const companyId = session.user.companyId as string;
    
    const activeBoutiqueId = cookies().get('activeBoutiqueId')?.value;
    
    if (activeBoutiqueId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: activeBoutiqueId }
      });
      if (warehouse && warehouse.companyId === companyId) {
        return { 
          success: true, 
          settings: {
            companyName: warehouse.name,
            companyId: warehouse.taxNumber || defaultSettings.companyId,
            address: warehouse.address || defaultSettings.address,
            email: warehouse.email || defaultSettings.email,
            phone: warehouse.phone || defaultSettings.phone,
            logo: warehouse.logoUrl || defaultSettings.logo,
            currency: warehouse.currency || defaultSettings.currency,
            timezone: warehouse.timezone || defaultSettings.timezone,
            dateFormat: warehouse.dateFormat || defaultSettings.dateFormat,
            invoicePrefix: warehouse.invoicePrefix || defaultSettings.invoicePrefix,
            invoiceFooter: warehouse.invoiceFooter || defaultSettings.invoiceFooter
          } 
        };
      }
    }
    
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
          logo: company.logoUrl || defaultSettings.logo,
          currency: company.currency || defaultSettings.currency,
          timezone: company.timezone || defaultSettings.timezone,
          dateFormat: company.dateFormat || defaultSettings.dateFormat,
          invoicePrefix: company.invoicePrefix || defaultSettings.invoicePrefix,
          invoiceFooter: company.invoiceFooter || defaultSettings.invoiceFooter
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
    const dbCompanyId = session.user.companyId as string;
    
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
          const buffer = Buffer.from(matches[2], 'base64');
          
          // Validation manuelle (magic bytes simples)
          const header = buffer.toString('hex', 0, 4);
          let type = matches[1]; // from regex
          let isValid = false;
          
          if (header.startsWith('89504e47')) { type = 'png'; isValid = true; } // PNG
          else if (header.startsWith('ffd8ff')) { type = 'jpeg'; isValid = true; } // JPG/JPEG
          else if (header.startsWith('52494646')) { type = 'webp'; isValid = true; } // WEBP (partial check)
          else if (type === 'png' || type === 'jpeg' || type === 'jpg' || type === 'webp') { isValid = true; } // fallback to mime
          
          if (!isValid) {
            throw new Error("Fichier invalide ou corrompu.");
          }
          const filename = `${dbCompanyId}-${Date.now()}.${type}`;
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
          if (supabaseUrl === 'https://placeholder.supabase.co') {
             throw new Error("Supabase n'est pas configuré. Upload ignoré pour éviter de bloquer.");
          }

          const { data: uploadData, error } = await getSupabase()
            .storage
            .from('logos')
            .upload(filename, buffer, {
              contentType: `image/${type}`,
              upsert: true
            });
            
          if (error) {
            console.error("Supabase upload error:", error);
            // Empêcher la sauvegarde du base64 complet dans la base
            logoUrl = null;
          } else {
            const { data: publicUrlData } = getSupabase().storage.from('logos').getPublicUrl(filename);
            logoUrl = publicUrlData.publicUrl;
          }
        } else {
           logoUrl = null;
        }
      } catch (err) {
        console.error("Error processing logo upload:", err);
        logoUrl = null;
      }
    }
    
    const activeBoutiqueId = cookies().get('activeBoutiqueId')?.value;
    
    if (activeBoutiqueId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: activeBoutiqueId }
      });
      
      if (warehouse && warehouse.companyId === dbCompanyId) {
        const updatedWarehouse = await prisma.warehouse.update({
          where: { id: activeBoutiqueId },
          data: {
            name: data.companyName,
            taxNumber: data.companyId,
            address: data.address,
            email: data.email,
            phone: data.phone,
            logoUrl: logoUrl,
            currency: data.currency,
            timezone: data.timezone,
            dateFormat: data.dateFormat,
            invoicePrefix: data.invoicePrefix,
            invoiceFooter: data.invoiceFooter
          }
        });
        
        revalidatePath('/dashboard/settings');
        return { success: true, settings: {
            companyName: updatedWarehouse.name,
            companyId: updatedWarehouse.taxNumber,
            address: updatedWarehouse.address,
            email: updatedWarehouse.email,
            phone: updatedWarehouse.phone,
            logo: updatedWarehouse.logoUrl,
            currency: updatedWarehouse.currency,
            timezone: updatedWarehouse.timezone,
            dateFormat: updatedWarehouse.dateFormat,
            invoicePrefix: updatedWarehouse.invoicePrefix,
            invoiceFooter: updatedWarehouse.invoiceFooter
        }};
      }
    }
    
    const company = await prisma.company.update({
      where: { id: dbCompanyId },
      data: {
        name: data.companyName,
        taxNumber: data.companyId,
        address: data.address,
        email: data.email,
        phone: data.phone,
        logoUrl: logoUrl,
        currency: data.currency,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        invoicePrefix: data.invoicePrefix,
        invoiceFooter: data.invoiceFooter
      }
    });
    
    revalidatePath('/dashboard/company');
    return { success: true, settings: {
        companyName: company.name,
        companyId: company.taxNumber,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo: company.logoUrl,
        currency: company.currency,
        timezone: company.timezone,
        dateFormat: company.dateFormat,
        invoicePrefix: company.invoicePrefix,
        invoiceFooter: company.invoiceFooter
    }};
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false };
  }
}
