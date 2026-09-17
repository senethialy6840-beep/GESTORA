import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: any, companyInfo: any, customerInfo: any) => {
  try {
    const doc = new jsPDF();

    const companyName = companyInfo?.name || companyInfo?.companyName || "GESTORA";
    const companyAddress = companyInfo?.address || "";
    const companyEmail = companyInfo?.email || "";
    const companyPhone = companyInfo?.phone || "";

    const invoiceNo = invoice?.invoiceNo || invoice?.id || "FAC-000";
    let formattedDate = "";
    try {
      formattedDate = invoice?.createdAt
        ? new Date(invoice.createdAt).toLocaleDateString("fr-FR")
        : invoice?.date || new Date().toLocaleDateString("fr-FR");
    } catch {
      formattedDate = new Date().toLocaleDateString("fr-FR");
    }

    const clientName = customerInfo?.name || customerInfo?.clientName || invoice?.client || "Client";
    const clientAddress = customerInfo?.address || customerInfo?.clientAddress || "";
    const clientEmail = customerInfo?.email || customerInfo?.clientEmail || "";
    const clientPhone = customerInfo?.phone || customerInfo?.clientPhone || "";

    // Barre d'accentuation supérieure
    doc.setFillColor(37, 99, 235); // Blue #2563EB
    doc.rect(0, 0, 210, 5, "F");

    // En-tête de la facture
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("FACTURE", 14, 22);

    // Informations de l'entreprise (gauche)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(companyName, 14, 32);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    let companyY = 37;
    if (companyAddress) { doc.text(companyAddress, 14, companyY); companyY += 5; }
    if (companyEmail) { doc.text(companyEmail, 14, companyY); companyY += 5; }
    if (companyPhone) { doc.text(companyPhone, 14, companyY); companyY += 5; }

    // Informations de la facture (droite)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(`N° Facture : ${invoiceNo}`, 130, 32);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Date : ${formattedDate}`, 130, 37);

    // Informations du client
    const clientStartY = Math.max(companyY + 5, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("FACTURÉ À :", 14, clientStartY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(clientName, 14, clientStartY + 6);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    let clientY = clientStartY + 11;
    if (clientAddress) { doc.text(clientAddress, 14, clientY); clientY += 4.5; }
    if (clientEmail) { doc.text(clientEmail, 14, clientY); clientY += 4.5; }
    if (clientPhone) { doc.text(clientPhone, 14, clientY); clientY += 4.5; }

    // Tableau des articles
    const tableColumn = ["Désignation", "Quantité", "Prix Unitaire (FCFA)", "Total (FCFA)"];
    const tableRows: any[] = [];

    const items = invoice?.items && invoice.items.length > 0
      ? invoice.items
      : [{ description: "Prestation / Produit", quantity: 1, price: invoice?.totalAmount || invoice?.amount || 0 }];

    let computedTotal = 0;
    items.forEach((item: any) => {
      const qte = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const rowTotal = qte * price;
      computedTotal += rowTotal;

      tableRows.push([
        item.description || "Article",
        qte.toString(),
        price.toLocaleString("fr-FR"),
        rowTotal.toLocaleString("fr-FR"),
      ]);
    });

    const totalAmount = invoice?.totalAmount || invoice?.amount || computedTotal;

    const startTableY = Math.max(clientY + 6, 85);

    autoTable(doc, {
      startY: startTableY,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: "center", cellWidth: 30 },
        2: { halign: "right", cellWidth: 40 },
        3: { halign: "right", cellWidth: 40 },
      },
    });

    // Subtotal and Total Box
    const finalY = (doc as any).lastAutoTable?.finalY || startTableY + 30;

    doc.setFillColor(243, 244, 246);
    doc.roundedRect(120, finalY + 8, 76, 20, 3, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("TOTAL :", 125, finalY + 21);

    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(`${totalAmount.toLocaleString("fr-FR")} FCFA`, 191, finalY + 21, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    const footerText = companyInfo?.invoiceFooter || "Merci pour votre confiance. Document généré par Gestora.";
    doc.text(footerText, 105, 285, { align: "center" });

    // Sauvegarder
    doc.save(`Facture_${invoiceNo}.pdf`);
  } catch (err: any) {
    console.error("Erreur lors de la génération du PDF:", err);
    alert("Impossible de générer le fichier PDF. Veuillez réessayer.");
  }
};

