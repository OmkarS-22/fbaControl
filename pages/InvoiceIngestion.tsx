import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  ArrowRight,
  UploadCloud,
  FileText,
  Database,
} from "lucide-react";
import { UserRole } from "../types";

interface IngestionProps {
  onBack: () => void;
  onSubmit: () => void;
  userRole: UserRole;
}

interface ExtractedInvoiceData {
  invoiceNumber: string | null;
  date: string | null;
  carrier: string | null;
  consignor: {
    name: string | null;
    city: string | null;
  };
  consignee: {
    name: string | null;
    city: string | null;
  };
  lineItems: Array<{
    qty: number | null;
    description: string | null;
    unitPrice: number | null;
    lineTotal: number | null;
  }>;
  subtotal: number | null;
  salesTax: number | null;
  total: number | null;
}

interface ExtractionResponse {
  success: boolean;
  message: string;
  data: {
    extractedData: ExtractedInvoiceData;
    fileId: string;
  };
}

export const InvoiceIngestion: React.FC<IngestionProps> = ({
  onBack,
  onSubmit,
  userRole,
}) => {
  // Workflow State: 'upload' -> 'scanning' -> 'verify' -> 'success'
  const [ingestionStep, setIngestionStep] = useState<
    "upload" | "scanning" | "verify" | "success"
  >("upload");

  const [activeField, setActiveField] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [extractionFileId, setExtractionFileId] = useState<string | null>(null);

  // Updated form structure to match extracted data
  const [formValues, setFormValues] = useState({
    // Header fields
    invoiceNumber: "",
    date: "",
    carrier: "",

    // Consignor fields
    consignorName: "",
    consignorCity: "",

    // Consignee fields
    consigneeName: "",
    consigneeCity: "",

    // Line items - support multiple items
    lineItems: [
      {
        qty: "",
        description: "",
        unitPrice: "",
        lineTotal: "",
        code: "",
      }
    ],

    // Totals
    subtotal: "",
    salesTax: "",
    total: "",

    // Additional fields (if needed)
    currency: "USD",
  });

  const [fieldConfidence, setFieldConfidence] = useState({
    invoiceNumber: "low",
    date: "low",
    carrier: "low",
    consignorName: "low",
    consignorCity: "low",
    consigneeName: "low",
    consigneeCity: "low",
    lineItems: "low",
    subtotal: "low",
    salesTax: "low",
    total: "low",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const isVendor = userRole === "VENDOR";

  // Handler to update line item fields
  const updateLineItem = (index: number, field: string, value: string) => {
    setFormValues(prev => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: value
      };
      return {
        ...prev,
        lineItems: newLineItems
      };
    });

    // Update confidence for line items
    if (field === "description" || field === "lineTotal") {
      setFieldConfidence(prev => ({ ...prev, lineItems: "high" }));
    }
  };

  // Add new line item
  const addLineItem = () => {
    setFormValues(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { qty: "", description: "", unitPrice: "", lineTotal: "", code: "" }
      ]
    }));
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (formValues.lineItems.length > 1) {
      setFormValues(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  // --- HANDLERS ---

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(" FILE SELECT TRIGGERED");
    console.log("📄 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    setUploadedFileType(file.type);
    setExtractionError(null);

    // 1. Show scanning state
    setIngestionStep("scanning");

    const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            console.log("📊 Base64 data info:", {
              totalLength: result.length,
              hasDataPrefix: result.startsWith('data:'),
              prefix: result.substring(0, 50) + "..."
            });
            resolve(result);
          } else {
            reject(new Error("Failed to read file as base64"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    };

    try {
      const base64Data = await readFileAsBase64(file);
      setPreviewUrl(base64Data);

      // 3. Call your extraction API using fetch
      console.log("🚀 Calling API: http://localhost:5000/api/invoices/extract");
      const startTime = Date.now();
      const response = await fetch("http://localhost:5000/api/invoices/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64: base64Data,
        }),
      });

      const endTime = Date.now();
      console.log(`⏱️ Request took: ${endTime - startTime}ms`);
      console.log("📥 API Response status:", response.status, response.statusText);

      const result: ExtractionResponse = await response.json();
      console.log(" EXTRACTION RESPONSE:", result);

      if (!response.ok || !result.success) {
        console.error("❌ API Error details:", {
          status: response.status,
          statusText: response.statusText,
          response: result
        });
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success && result.data) {
        const { extractedData: rawData, fileId } = result.data;

        const extractedData: ExtractedInvoiceData = {
          ...rawData,
          lineItems: (rawData as any).line_items ?? []
        };

        console.log("🎉 Extraction successful!", {
          fileId,
          extractedData
        });
        setExtractionFileId(fileId);

        // 4. Map extracted data to form values EXACTLY as received
        const mappedLineItems = extractedData.lineItems?.map(item => ({
          qty: item.qty?.toString() || "",
          description: item.description || "",
          unitPrice: item.unitPrice?.toString() || "",
          lineTotal: item.lineTotal?.toString() || "",
          code: item.description ? getItemCode(item.description) : ""
        })) || [{ qty: "", description: "", unitPrice: "", lineTotal: "", code: "" }];

        setFormValues({
          invoiceNumber: extractedData.invoiceNumber || "",
          date: extractedData.date ? formatDate(extractedData.date) : "",
          carrier: extractedData.carrier || "",
          consignorName: extractedData.consignor?.name || "",
          consignorCity: extractedData.consignor?.city || "",
          consigneeName: extractedData.consignee?.name || "",
          consigneeCity: extractedData.consignee?.city || "",
          lineItems: mappedLineItems,
          subtotal: extractedData.subtotal?.toString() || "",
          salesTax: extractedData.salesTax?.toString() || "",
          total: extractedData.total?.toString() || "",
          currency: "USD",
        });

        // 5. Set confidence levels based on extracted data
        setFieldConfidence({
          invoiceNumber: extractedData.invoiceNumber ? "high" : "low",
          date: extractedData.date ? "high" : "low",
          carrier: extractedData.carrier ? "high" : "low",
          consignorName: extractedData.consignor?.name ? "high" : "low",
          consignorCity: extractedData.consignor?.city ? "high" : "low",
          consigneeName: extractedData.consignee?.name ? "high" : "low",
          consigneeCity: extractedData.consignee?.city ? "high" : "low",
          lineItems: extractedData.lineItems?.length > 0 ? "high" : "low",
          subtotal: extractedData.subtotal !== null ? "high" : "low",
          salesTax: extractedData.salesTax !== null ? "high" : "low",
          total: extractedData.total !== null ? "high" : "low",
        });

        setIngestionStep("verify");
      } else {
        throw new Error(result.message || "Extraction failed");
      }
    } catch (error: any) {
      console.error("Extraction API Error:", error);
      setExtractionError(
        error.message ||
        "Failed to extract invoice data. Please try again or enter manually."
      );
      setIngestionStep("verify");
    }
  };

  const handleFocus = (field: string) => {
    setActiveField(field);
  };

  const handleCorrection = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitProcess = async () => {
    if (!extractionFileId) {
      alert("Please upload a file first");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(formValues)
      // Prepare data for save API - using the exact structure from extraction
      const invoiceData = {
        fileId: extractionFileId,
        invoiceNumber: formValues.invoiceNumber || null,
        date: formValues.date || null,
        carrier: formValues.carrier || null,
        consignor: {
          name: formValues.consignorName || null,
          city: formValues.consignorCity || null,
        },
        consignee: {
          name: formValues.consigneeName || null,
          city: formValues.consigneeCity || null,
        },
        lineItems: formValues.lineItems
          .filter(item => item.description.trim() !== "") // Only include filled items
          .map(item => ({
            qty: item.qty ? parseInt(item.qty) : null,
            description: item.description || null,
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
            lineTotal: item.lineTotal ? parseFloat(item.lineTotal) : null,
            code: item.code || null,
          })),
        subtotal: formValues.subtotal ? parseFloat(formValues.subtotal) : null,
        salesTax: formValues.salesTax ? parseFloat(formValues.salesTax) : null,
        total: formValues.total ? parseFloat(formValues.total) : null,
        // Additional fields
        currency: formValues.currency || "USD",
        status: "processed",
        uploadedAt: new Date().toISOString(),
        // Metadata
        extractionSource: "OCR",
        confidenceScore: calculateConfidenceScore(),
        userVerified: true,
        verificationTimestamp: new Date().toISOString(),
      };

      console.log("💾 Saving invoice data:", invoiceData);

      const API_BASE_URL = "http://localhost:5000/api";

      const response = await fetch(`${API_BASE_URL}/invoices/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      console.log("📤 Save API response status:", response.status);

      const result = await response.json();
      console.log(" Save API result:", result);

      if (result.success) {
        console.log("🎉 Invoice saved successfully!");
        setIngestionStep("success");
        setTimeout(() => {
          onSubmit();
        }, 2000);
      } else {
        throw new Error(result.message || "Save failed");
      }
    } catch (error: any) {
      console.error("❌ Save Error:", error);
      alert(`Failed to save invoice: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate overall confidence score
  const calculateConfidenceScore = (): number => {
    const fields = Object.values(fieldConfidence);
    const highConfidenceCount = fields.filter(conf => conf === "high").length;
    const totalFields = fields.length;
    return Math.round((highConfidenceCount / totalFields) * 100);
  };

  // --- HELPER FUNCTIONS ---

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const getItemCode = (description: string | null): string => {
    if (!description) return "";
    const desc = description.toLowerCase();
    if (desc.includes("fuel") || desc.includes("bunker")) return "FSC";
    if (desc.includes("security")) return "SEC";
    if (desc.includes("handling")) return "THC";
    if (desc.includes("base")) return "BAS";
    if (desc.includes("ocean")) return "OCN";
    return "";
  };

  // Calculate line total from quantity and unit price
  const calculateLineTotal = (qty: string, unitPrice: string): string => {
    const qtyNum = parseFloat(qty) || 0;
    const priceNum = parseFloat(unitPrice) || 0;
    return (qtyNum * priceNum).toFixed(2);
  };

  // Auto-calculate line total when qty or unitPrice changes
  useEffect(() => {
    formValues.lineItems.forEach((item, index) => {
      if (item.qty && item.unitPrice && !item.lineTotal) {
        const calculatedTotal = calculateLineTotal(item.qty, item.unitPrice);
        updateLineItem(index, "lineTotal", calculatedTotal);
      }
    });
  }, [formValues.lineItems]);

  // --- RENDER: STEP 1 - UPLOAD SCREEN ---
  if (ingestionStep === "upload") {
    return (
      <div className="h-full flex flex-col bg-gray-50 font-sans p-8 items-center justify-center relative">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Invoice
            </h2>
            <p className="text-gray-500">
              Supported formats: PDF, JPG, PNG (Max 25MB)
            </p>
          </div>

          <div
            onClick={handleUploadClick}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-16 cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all group shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
            />
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">
              Click to Browse or Drag File Here
            </h3>
            <p className="text-sm text-gray-400">
              Securely encrypted upload to 3SC Control Tower
            </p>
          </div>

          <div className="mt-8 flex justify-center space-x-8 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <span className="flex items-center">
              <CheckCircle size={14} className="mr-2 text-teal-500" /> OCR
              Extraction
            </span>
            <span className="flex items-center">
              <CheckCircle size={14} className="mr-2 text-teal-500" />{" "}
              Auto-Validation
            </span>
            <span className="flex items-center">
              <CheckCircle size={14} className="mr-2 text-teal-500" /> Instant
              Feedback
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 1.5 - SCANNING ---
  if (ingestionStep === "scanning") {
    return (
      <div className="h-full flex flex-col bg-gray-50 font-sans items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-teal-600">
              <FileText size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing Document...
          </h2>
          <p className="text-gray-500 animate-pulse">
            OCR Engine is extracting metadata and line items
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 2 - VERIFICATION WORKBENCH (Split View) ---
  return (
    <div className="h-full flex flex-col font-sans bg-gray-100 overflow-hidden relative">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-30 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIngestionStep("upload")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                {isVendor
                  ? "Verify & Submit Invoice"
                  : "Invoice Validation Workbench"}
              </h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center">
                <AlertTriangle size={12} className="mr-1" />{" "}
                {isVendor ? "Action Required" : "Pending Verification"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isVendor
                ? "Please review the OCR-extracted data below against your original document."
                : "Review extracted data and submit for processing"}
              {extractionError && (
                <span className="text-red-500 ml-2">⚠️ {extractionError}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isVendor && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-sm text-xs font-bold uppercase hover:bg-red-50 transition-colors">
              <X size={16} />
              <span>Reject</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-teal-600 text-teal-700 rounded-sm text-xs font-bold uppercase hover:bg-teal-50 transition-colors">
            <Save size={16} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleSubmitProcess}
            disabled={isSubmitting || !extractionFileId}
            className="flex items-center space-x-2 px-6 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <span>
                  {isVendor ? "Confirm Submission" : "Submit to Audit"}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: PDF/IMAGE VIEWER */}
        <div className="w-1/2 bg-[#525659] p-8 overflow-auto custom-scrollbar flex justify-center relative">
          {/* Tools */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#323639] rounded-full px-4 py-2 flex items-center space-x-4 shadow-xl z-20 text-gray-300 border border-gray-600">
            <ZoomOut
              size={16}
              className="cursor-pointer hover:text-white"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            />
            <span className="text-xs font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <ZoomIn
              size={16}
              className="cursor-pointer hover:text-white"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            />
            <div className="w-px h-4 bg-gray-600"></div>
            <Maximize size={16} className="cursor-pointer hover:text-white" />
          </div>

          {/* The Document Container */}
          <div
            className="bg-white shadow-2xl transition-transform duration-200 origin-top relative flex-shrink-0"
            style={{
              width: "595px",
              minHeight: "842px",
              transform: `scale(${zoomLevel})`,
            }}
          >
            {previewUrl ? (
              uploadedFileType === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[842px] border-0"
                  title="Invoice PDF"
                />
              ) : (
                <img
                  src={previewUrl}
                  className="w-full h-auto object-contain"
                  alt="Invoice preview"
                />
              )
            ) : (
              <p className="text-gray-400 p-8">No preview available</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: DIGITAL TWIN FORM */}
        <div className="w-1/2 bg-white flex flex-col border-l border-gray-300">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                <Database size={16} className="mr-2 text-teal-600" />
                Extracted Data
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Please verify all Amber fields before submitting.
              </p>
              {extractionFileId && (
                <p className="text-xs text-teal-600 mt-1">
                  File ID: {extractionFileId.substring(0, 12)}...
                </p>
              )}
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-gray-700">OCR Engine v3</p>
              <p className="text-teal-600 flex items-center justify-end">
                <CheckCircle size={10} className="mr-1" /> Connected
              </p>
            </div>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            {/* Header Details */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Header Details
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <InputWithStatus
                  label="Invoice Number"
                  value={formValues.invoiceNumber}
                  confidence={fieldConfidence.invoiceNumber}
                  onFocus={() => handleFocus("invoiceNumber")}
                  onChange={(v) => handleCorrection("invoiceNumber", v)}
                />
                <InputWithStatus
                  label="Invoice Date"
                  value={formValues.date}
                  confidence={fieldConfidence.date}
                  onFocus={() => handleFocus("date")}
                  onChange={(v) => handleCorrection("date", v)}
                />
                <InputWithStatus
                  label="Carrier"
                  value={formValues.carrier}
                  confidence={fieldConfidence.carrier}
                  onFocus={() => handleFocus("carrier")}
                  onChange={(v) => handleCorrection("carrier", v)}
                />

              </div>
            </div>

            {/* Consignor Details */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Consignor (Shipper)
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <InputWithStatus
                  label="Consignor Name"
                  value={formValues.consignorName}
                  confidence={fieldConfidence.consignorName}
                  onFocus={() => handleFocus("consignorName")}
                  onChange={(v) => handleCorrection("consignorName", v)}
                />
                <InputWithStatus
                  label="Consignor City"
                  value={formValues.consignorCity}
                  confidence={fieldConfidence.consignorCity}
                  onFocus={() => handleFocus("consignorCity")}
                  onChange={(v) => handleCorrection("consignorCity", v)}
                />
              </div>
            </div>

            {/* Consignee Details */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Consignee (Receiver)
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <InputWithStatus
                  label="Consignee Name"
                  value={formValues.consigneeName}
                  confidence={fieldConfidence.consigneeName}
                  onFocus={() => handleFocus("consigneeName")}
                  onChange={(v) => handleCorrection("consigneeName", v)}
                />
                <InputWithStatus
                  label="Consignee City"
                  value={formValues.consigneeCity}
                  confidence={fieldConfidence.consigneeCity}
                  onFocus={() => handleFocus("consigneeCity")}
                  onChange={(v) => handleCorrection("consigneeCity", v)}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Line Items
                </h4>
                <button
                  onClick={addLineItem}
                  className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1 rounded border border-teal-200 font-bold"
                >
                  + Add Item
                </button>
              </div>

              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase mb-2 px-2">
                <div className="col-span-1">Qty</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">System Code</div>
                <div className="col-span-2 text-right">Line Total</div>
                <div className="col-span-1 text-center"></div>
              </div>

              {formValues.lineItems.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-sm border mb-2 transition-colors cursor-pointer
                    ${fieldConfidence.lineItems === "low"
                      ? "border-amber-400 bg-amber-50"
                      : "border-teal-200 bg-teal-50"
                    }
                    ${activeField === `lineItem-${index}` ? "ring-1 ring-amber-500" : ""}
                  `}
                  onClick={() => handleFocus(`lineItem-${index}`)}
                >
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={item.qty}
                      placeholder="1"
                      onChange={(e) => updateLineItem(index, "qty", e.target.value)}
                      className={`w-full text-sm text-center font-medium bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItems === "low"
                        ? "border-amber-500 text-amber-900"
                        : "border-teal-500 text-teal-900"
                        }`}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.description}
                      placeholder="Item description"
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      className={`w-full text-sm font-medium bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItems === "low"
                        ? "border-amber-500 text-amber-900"
                        : "border-teal-500 text-teal-900"
                        }`}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.unitPrice}
                      placeholder="0.00"
                      onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                      className={`w-full text-sm font-medium bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItems === "low"
                        ? "border-amber-500 text-amber-900"
                        : "border-teal-500 text-teal-900"
                        }`}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.code}
                      onChange={(e) => updateLineItem(index, "code", e.target.value)}
                      className="text-xs font-mono font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 w-full focus:border-teal-500 outline-none"
                    >
                      <option value="">Select Code</option>
                      <option value="BAS">BAS (Base Freight)</option>
                      <option value="FSC">FSC (Fuel Surcharge)</option>
                      <option value="SEC">SEC (Security)</option>
                      <option value="THC">THC (Terminal Handling)</option>
                      <option value="OCN">OCN (Ocean Freight)</option>
                    </select>
                  </div>
                  <div className="col-span-2 text-right">
                    <input
                      type="text"
                      value={item.lineTotal}
                      placeholder="0.00"
                      onChange={(e) => updateLineItem(index, "lineTotal", e.target.value)}
                      className={`w-full text-right font-bold bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItems === "low"
                        ? "border-amber-500 text-amber-900"
                        : "border-teal-500 text-teal-900"
                        }`}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {formValues.lineItems.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLineItem(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Totals
              </h4>
              <div className="flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formValues.subtotal || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sales Tax</span>
                    <span>{formValues.salesTax || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total ({formValues.currency})</span>
                    <span>{formValues.total || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMISSION SUCCESS OVERLAY */}
      {ingestionStep === "success" && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Submission Complete
            </h3>
            <p className="text-gray-500 mb-4">
              Invoice has been saved and sent for processing.
            </p>
            <p className="text-xs text-gray-400 font-mono">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENT ---
interface InputWithStatusProps {
  label: string;
  value: string;
  confidence: "high" | "low";
  onFocus: () => void;
  onChange: (value: string) => void;
}

const InputWithStatus: React.FC<InputWithStatusProps> = ({
  label,
  value,
  confidence,
  onFocus,
  onChange,
}) => {
  const isHigh = confidence === "high";
  return (
    <div className="relative">
      <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
        {label}
        <span
          className={`text-[9px] ${isHigh ? "text-teal-600" : "text-amber-600"
            }`}
        >
          {isHigh ? "High Confidence" : "Review Needed"}
        </span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-sm px-3 py-2 text-sm font-medium transition-shadow focus:outline-none focus:ring-1 
                  ${isHigh
              ? "border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-800"
              : "border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-amber-50/50"
            }`}
        />
        {!isHigh && (
          <AlertTriangle
            size={14}
            className="absolute right-3 top-2.5 text-amber-500"
          />
        )}
      </div>
    </div>
  );
};