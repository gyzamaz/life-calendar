"use client";

import { useState, RefObject } from "react";

interface ExportToPdfProps {
  t: Record<string, string>;
  calendarRef: RefObject<HTMLElement | null>;
  filename?: string;
}

export function ExportToPdf({ t, calendarRef, filename = "kalendarz-zycia.pdf" }: ExportToPdfProps) {
  const [loading, setLoading] = useState(false);

  async function handleExportPdf() {
    if (!calendarRef.current || loading) return;

    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = calendarRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

        while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Błąd eksportu PDF:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExportPdf}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-xs px-3 py-1.5 shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? "…" : "⬇"}
      <span>{t.exportPdf}</span>
    </button>
  );
}
