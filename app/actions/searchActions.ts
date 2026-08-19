"use server";

import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string, companyId: string) {
  try {
    const q = query.toLowerCase().trim();
    
    // We will do parallel queries for all major models that belong to the company
    const [
      customers,
      products,
      sales,
      employees,
      accounting,
      movements
    ] = await Promise.all([
      // Customers
      prisma.customer.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      // Products
      prisma.product.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      // Sales / Invoices
      prisma.sale.findMany({
        where: {
          companyId,
          OR: [
            { invoiceNo: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: { customer: true },
        take: 10
      }),
      // Employees
      prisma.employee.findMany({
        where: {
          companyId,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { role: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      // Accounting
      prisma.accountingTransaction.findMany({
        where: {
          companyId,
          OR: [
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      // Stock Movements
      prisma.stockMovement.findMany({
        where: {
          companyId,
          OR: [
            { reason: { contains: q, mode: 'insensitive' } },
            { product: { name: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: { product: true },
        take: 10
      })
    ]);

    return { 
      success: true, 
      data: {
        customers,
        products,
        sales,
        employees,
        accounting,
        movements
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
