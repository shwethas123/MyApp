import { X } from "lucide-react";
import { useState, useEffect } from "react";

const PdfViewerModal = ({ url, onClose }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}${isMobile ? "#zoom=page-width" : ""}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(230, 221, 221, 0.75)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: "#1f2937", flexShrink: 0,
      }}>
        <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>Document Viewer</span>
        <button onClick={onClose} style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", background: "#374151", color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>
          <X size={13} /> Close
        </button>
      </div>
      <iframe
        key={isMobile ? "mobile" : "desktop"}  // force remount on switch
        src={viewerUrl}
        style={{
          flex: 1, border: "none",
          width: isMobile ? "100%" : "45%",
          margin: "0 auto",
        }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PdfViewerModal;