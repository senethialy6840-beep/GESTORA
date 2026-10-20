import jsPDF from "jspdf";

export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  invoiceNo: string;
  totalAmount: number;
  subTotal?: number;
  createdAt?: string | Date;
  items: ReceiptItem[];
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
  paymentMethod?: string;
  amountReceived?: number;
  changeDue?: number;
  cashierName?: string;
  companyInfo?: {
    companyName?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxNumber?: string;
    currency?: string;
    invoiceFooter?: string;
    logo?: string | null;
  };
}

const formatCurrency = (amount: number, currency: string = "FCFA") => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount).replace(/\u202f/g, " ");
  return `${formatted} ${currency}`;
};

const formatReceiptDate = (date?: string | Date) => {
  if (!date) return new Date().toLocaleString("fr-FR");
  try {
    const d = new Date(date);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date().toLocaleString("fr-FR");
  }
};

/**
 * Génère et télécharge un Ticket de Caisse au format thermique 80mm (PDF).
 */
export const generateReceiptPDF = (data: ReceiptData) => {
  try {
    const currency = data.companyInfo?.currency || "FCFA";
    const companyName =
      data.companyInfo?.companyName ||
      data.companyInfo?.name ||
      "GESTORA BOUTIQUE";
    const companyAddress = data.companyInfo?.address || "";
    const companyPhone = data.companyInfo?.phone || "";
    const companyEmail = data.companyInfo?.email || "";
    const taxNumber = data.companyInfo?.taxNumber || "";
    const cashierName = data.cashierName || "Caisse";
    const clientName = data.customer?.name || "Client Comptant";
    const paymentMethod = data.paymentMethod || "Espèces";

    const items = data.items && data.items.length > 0
      ? data.items
      : [{ description: "Article", quantity: 1, price: data.totalAmount }];

    // Calcul dynamique de la hauteur du ticket pour s'adapter parfaitement à la longueur
    const estimatedHeight = Math.max(160, 110 + items.length * 11 + (data.amountReceived ? 16 : 0));

    // Format standard bobine thermique : Largeur 80mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, estimatedHeight],
    });

    const pageWidth = 80;
    const centerX = pageWidth / 2;
    const leftX = 5;
    const rightX = 75;
    let y = 8;

    // --- EN-TÊTE ENTREPRISE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    const storeLines = doc.splitTextToSize(companyName.toUpperCase(), 70);
    doc.text(storeLines, centerX, y, { align: "center" });
    y += storeLines.length * 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);

    if (companyAddress) {
      const addrLines = doc.splitTextToSize(companyAddress, 70);
      doc.text(addrLines, centerX, y, { align: "center" });
      y += addrLines.length * 3.5;
    }
    if (companyPhone) {
      doc.text(`Tél : ${companyPhone}`, centerX, y, { align: "center" });
      y += 3.5;
    }
    if (companyEmail) {
      doc.text(`Email : ${companyEmail}`, centerX, y, { align: "center" });
      y += 3.5;
    }
    if (taxNumber) {
      doc.text(`NINEA / RCCM : ${taxNumber}`, centerX, y, { align: "center" });
      y += 3.5;
    }

    // Ligne pointillée
    y += 1;
    doc.setLineDashPattern([1, 1], 0);
    doc.setDrawColor(160, 160, 160);
    doc.line(leftX, y, rightX, y);
    y += 4.5;

    // --- TITRE TICKET ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text("TICKET DE CAISSE", centerX, y, { align: "center" });
    y += 4.5;

    // --- INFORMATIONS TICKET ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);

    doc.text(`Ticket N° :`, leftX, y);
    doc.setFont("helvetica", "bold");
    doc.text(data.invoiceNo, rightX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 3.5;

    doc.text(`Date :`, leftX, y);
    doc.text(formatReceiptDate(data.createdAt), rightX, y, { align: "right" });
    y += 3.5;

    doc.text(`Caissier :`, leftX, y);
    doc.text(cashierName, rightX, y, { align: "right" });
    y += 3.5;

    doc.text(`Client :`, leftX, y);
    doc.text(clientName, rightX, y, { align: "right" });
    y += 3.5;

    doc.text(`Règlement :`, leftX, y);
    doc.setFont("helvetica", "bold");
    doc.text(paymentMethod, rightX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 4;

    // Ligne pointillée
    doc.line(leftX, y, rightX, y);
    y += 4;

    // --- EN-TÊTE ARTICLES ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text("DÉSIGNATION", leftX, y);
    doc.text("TOTAL", rightX, y, { align: "right" });
    y += 3.5;

    // --- LISTE DES ARTICLES ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    let totalArticles = 0;
    items.forEach((item) => {
      totalArticles += Number(item.quantity) || 1;
      const rowTotal = (Number(item.quantity) || 1) * (Number(item.price) || 0);

      // Nom du produit (sur une ligne principale ou découpé)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      const descLines = doc.splitTextToSize(item.description, 50);
      doc.text(descLines, leftX, y);

      // Total de la ligne à droite
      doc.text(formatCurrency(rowTotal, currency), rightX, y, { align: "right" });
      y += descLines.length * 3.5;

      // Détail quantité x prix unitaire
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${item.quantity} x ${formatCurrency(item.price, currency)}`,
        leftX + 2,
        y
      );
      y += 4;
    });

    // Ligne pointillée
    y += 1;
    doc.line(leftX, y, rightX, y);
    y += 4.5;

    // --- TOTAUX ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);

    const subTotal = data.subTotal || data.totalAmount;
    doc.text("Sous-total :", leftX, y);
    doc.text(formatCurrency(subTotal, currency), rightX, y, { align: "right" });
    y += 4;

    // TOTAL À PAYER (Grand & Mis en avant)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("TOTAL À PAYER :", leftX, y);
    doc.text(formatCurrency(data.totalAmount, currency), rightX, y, {
      align: "right",
    });
    y += 5.5;

    // DÉTAILS DE PAIEMENT & RENDU DE MONNAIE
    if (data.amountReceived && data.amountReceived >= data.totalAmount) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);

      doc.text("Montant reçu :", leftX, y);
      doc.text(formatCurrency(data.amountReceived, currency), rightX, y, {
        align: "right",
      });
      y += 3.5;

      const change = data.changeDue ?? Math.max(0, data.amountReceived - data.totalAmount);
      doc.setFont("helvetica", "bold");
      doc.text("Monnaie rendue :", leftX, y);
      doc.text(formatCurrency(change, currency), rightX, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 4;
    }

    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(`Nombre d'articles : ${totalArticles}`, leftX, y);
    y += 4.5;

    // Ligne pointillée
    doc.line(leftX, y, rightX, y);
    y += 5;

    // --- CODE-BARRES VISUEL ---
    const barcodePattern = [
      2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 1, 2, 4, 2, 1,
      3, 1, 2, 1, 4,
    ];
    let curX = 14;
    const barcodeY = y;
    const barcodeH = 7;
    for (let i = 0; i < barcodePattern.length; i++) {
      const barW = barcodePattern[i] * 0.42;
      if (i % 2 === 0) {
        doc.setFillColor(30, 30, 30);
        doc.rect(curX, barcodeY, barW, barcodeH, "F");
      }
      curX += barW;
    }
    y += barcodeH + 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`* ${data.invoiceNo} *`, centerX, y, { align: "center" });
    y += 4.5;

    // --- PIED DE PAGE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text("Merci de votre visite !", centerX, y, { align: "center" });
    y += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text("À bientôt chez nous", centerX, y, { align: "center" });
    y += 3;

    const footerNotice =
      data.companyInfo?.invoiceFooter ||
      "Les articles vendus ne sont ni repris ni échangés.";
    const footerLines = doc.splitTextToSize(footerNotice, 70);
    doc.text(footerLines, centerX, y, { align: "center" });
    y += footerLines.length * 3;

    doc.setFontSize(5.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Système de caisse GESTORA", centerX, y, { align: "center" });

    // Enregistrement du fichier
    doc.save(`Ticket_${data.invoiceNo}.pdf`);
    return { success: true };
  } catch (err: any) {
    console.error("Erreur lors de la génération du ticket PDF:", err);
    alert("Impossible de générer le ticket de caisse en PDF.");
    return { success: false, error: err.message };
  }
};

/**
 * Génère le code HTML propre d'un ticket thermique 80mm
 */
export const getReceiptHtml = (data: ReceiptData): string => {
  const currency = data.companyInfo?.currency || "FCFA";
  const companyName =
    data.companyInfo?.companyName ||
    data.companyInfo?.name ||
    "GESTORA BOUTIQUE";
  const companyAddress = data.companyInfo?.address || "";
  const companyPhone = data.companyInfo?.phone || "";
  const companyEmail = data.companyInfo?.email || "";
  const taxNumber = data.companyInfo?.taxNumber || "";
  const cashierName = data.cashierName || "Caisse";
  const clientName = data.customer?.name || "Client Comptant";
  const paymentMethod = data.paymentMethod || "Espèces";

  const items = data.items && data.items.length > 0
    ? data.items
    : [{ description: "Article", quantity: 1, price: data.totalAmount }];

  const totalArticles = items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 1),
    0
  );
  const subTotal = data.subTotal || data.totalAmount;
  const change =
    data.changeDue ??
    (data.amountReceived ? Math.max(0, data.amountReceived - data.totalAmount) : 0);

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Ticket ${data.invoiceNo}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 4mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            width: 72mm;
            margin: 0 auto;
            padding: 8mm 4mm;
            font-family: 'Courier New', Courier, monospace, system-ui;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
            box-sizing: border-box;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          .divider {
            border-top: 1px dashed #444;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px dashed #000;
            margin: 8px 0;
          }
          .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .item-row {
            margin-bottom: 5px;
          }
          .barcode-box {
            margin: 8px 0 3px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5px;
            height: 28px;
          }
          .bar {
            background-color: #000;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <!-- EN-TÊTE -->
        <div class="text-center">
          <div class="font-bold uppercase" style="font-size: 14px; letter-spacing: 0.5px;">${companyName}</div>
          ${companyAddress ? `<div style="font-size: 9.5px; margin-top: 2px;">${companyAddress}</div>` : ""}
          ${companyPhone ? `<div style="font-size: 9.5px;">Tél : ${companyPhone}</div>` : ""}
          ${companyEmail ? `<div style="font-size: 9.5px;">Email : ${companyEmail}</div>` : ""}
          ${taxNumber ? `<div style="font-size: 9px; margin-top: 1px;">NINEA/RCCM : ${taxNumber}</div>` : ""}
        </div>

        <div class="divider"></div>

        <!-- TITRE & METADATA -->
        <div class="text-center font-bold" style="font-size: 11px; letter-spacing: 1px;">TICKET DE CAISSE</div>
        
        <div style="margin-top: 4px; font-size: 10px;">
          <div class="flex-between">
            <span>Ticket N° :</span>
            <span class="font-bold">${data.invoiceNo}</span>
          </div>
          <div class="flex-between">
            <span>Date :</span>
            <span>${formatReceiptDate(data.createdAt)}</span>
          </div>
          <div class="flex-between">
            <span>Caissier :</span>
            <span>${cashierName}</span>
          </div>
          <div class="flex-between">
            <span>Client :</span>
            <span>${clientName}</span>
          </div>
          <div class="flex-between">
            <span>Règlement :</span>
            <span class="font-bold">${paymentMethod}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- ARTICLES -->
        <div class="flex-between font-bold" style="font-size: 10px; margin-bottom: 4px;">
          <span>DÉSIGNATION</span>
          <span>TOTAL</span>
        </div>

        <div style="font-size: 10px;">
          ${items
            .map(
              (item) => `
            <div class="item-row">
              <div class="flex-between">
                <span class="font-bold">${item.description}</span>
                <span class="font-bold">${formatCurrency(
                  (Number(item.quantity) || 1) * (Number(item.price) || 0),
                  currency
                )}</span>
              </div>
              <div style="font-size: 9px; color: #555; margin-left: 4px;">
                ${item.quantity} x ${formatCurrency(item.price, currency)}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="divider"></div>

        <!-- TOTAUX -->
        <div style="font-size: 10.5px;">
          <div class="flex-between">
            <span>Sous-total :</span>
            <span>${formatCurrency(subTotal, currency)}</span>
          </div>
          
          <div class="flex-between font-bold" style="font-size: 13px; margin: 5px 0;">
            <span>TOTAL :</span>
            <span>${formatCurrency(data.totalAmount, currency)}</span>
          </div>

          ${
            data.amountReceived && data.amountReceived >= data.totalAmount
              ? `
            <div class="flex-between" style="font-size: 10px;">
              <span>Montant reçu :</span>
              <span>${formatCurrency(data.amountReceived, currency)}</span>
            </div>
            <div class="flex-between font-bold" style="font-size: 10px;">
              <span>Monnaie rendue :</span>
              <span>${formatCurrency(change, currency)}</span>
            </div>
          `
              : ""
          }

          <div class="flex-between" style="font-size: 9px; color: #555; margin-top: 3px;">
            <span>Nombre d'articles :</span>
            <span>${totalArticles}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- CODE-BARRES -->
        <div class="barcode-box">
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 3px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 4px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 3px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 3px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 4px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 1px;"></div>
          <div class="bar" style="width: 3px;"></div>
          <div class="bar" style="width: 2px;"></div>
          <div class="bar" style="width: 1px;"></div>
        </div>
        <div class="text-center" style="font-size: 9px; letter-spacing: 1px; color: #333;">* ${data.invoiceNo} *</div>

        <!-- PIED DE PAGE -->
        <div class="text-center" style="margin-top: 8px;">
          <div class="font-bold" style="font-size: 11px;">Merci de votre visite !</div>
          <div style="font-size: 9px; color: #444;">À bientôt chez nous</div>
          <div style="font-size: 8.5px; color: #666; margin-top: 4px;">
            ${
              data.companyInfo?.invoiceFooter ||
              "Les articles vendus ne sont ni repris ni échangés."
            }
          </div>
          <div style="font-size: 7.5px; color: #999; margin-top: 4px;">Document généré par GESTORA POS</div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Lance l'impression directe du ticket sur imprimante thermique (ou imprimante standard)
 * sans ouvrir ni polluer la page active.
 */
export const printReceipt = (data: ReceiptData) => {
  if (typeof window === "undefined") return;

  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const html = getReceiptHtml(data);
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Erreur lors du déclenchement de l'impression :", e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 250);
  } catch (error) {
    console.error("Erreur d'impression du ticket:", error);
    alert("Impossible de lancer l'impression du ticket.");
  }
};
