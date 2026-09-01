import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: any, companyInfo: any, customerInfo: any) => {
  const doc = new jsPDF();
  
  // En-tête de la facture
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("FACTURE", 14, 22);

  // Informations de l'entreprise
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyInfo?.name || "Entreprise", 14, 32);
  doc.text(companyInfo?.address || "", 14, 37);
  doc.text(companyInfo?.email || "", 14, 42);
  doc.text(`N° TVA/NINEA: ${companyInfo?.taxNumber || ""}`, 14, 47);

  // Informations de la facture
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Facture N° : ${invoice.invoiceNo}`, 120, 32);
  doc.text(`Date : ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, 120, 37);
  doc.text(`Statut : ${invoice.status}`, 120, 42);

  // Informations du client
  doc.text("Facturé à :", 14, 60);
  doc.setFont("helvetica", "bold");
  doc.text(customerInfo?.name || "Client Standard", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.text(customerInfo?.address || "", 14, 70);
  doc.text(customerInfo?.email || "", 14, 75);
  doc.text(customerInfo?.phone || "", 14, 80);

  // Tableau des articles
  const tableColumn = ["Description", "Quantité", "Prix Unitaire (XOF)", "Total (XOF)"];
  const tableRows: any[] = [];

  invoice.items?.forEach((item: any) => {
    const itemData = [
      item.description,
      item.quantity,
      item.price.toLocaleString("fr-FR"),
      (item.price * item.quantity).toLocaleString("fr-FR"),
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] }, // Bleu Tailwind
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total à payer : ${invoice.totalAmount.toLocaleString("fr-FR")} XOF`, 14, finalY + 15);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Merci pour votre confiance !", 105, 280, { align: "center" });

  // Sauvegarder
  doc.save(`Facture_${invoice.invoiceNo}.pdf`);
};
