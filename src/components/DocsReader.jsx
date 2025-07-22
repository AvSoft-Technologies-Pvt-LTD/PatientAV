import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { User, CalendarDays, Stethoscope, FileText, Printer, FileDown, Building2, MapPin } from "lucide-react";
import { FaFilePdf, FaFileUpload, FaStethoscope } from "react-icons/fa";
import { MdPictureAsPdf, MdOutlinePreview } from "react-icons/md";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OCRPrescriptionReader = () => {
    const printRef = useRef();
    const [parsed, setParsed] = useState({ medications: [] });
    const [file, setFile] = useState(null);
    const [lang, setLang] = useState("eng");
    const [rawText, setRawText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e) => {
        const uploaded = e.target.files[0];
        setFile(URL.createObjectURL(uploaded));
        const isPdf = uploaded.type === "application/pdf";
        if (isPdf) extractTextFromPDF(uploaded);
        else extractTextFromImage(uploaded);
    };

    const extractTextFromImage = async (imageFile) => {
        setLoading(true);
        try {
            const { data: { text } } = await Tesseract.recognize(imageFile, lang);
            setRawText(text);
            parseText(text);
        } catch (err) {
            console.error("OCR error:", err);
        }
        setLoading(false);
    };

    const extractTextFromPDF = async (pdfFile) => {
        setLoading(true);
        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const typedarray = new Uint8Array(fileReader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const text = content.items.map(item => item.str).join(" ");
                fullText += text + "\n";
            }
            setRawText(fullText);
            parseText(fullText);
            setLoading(false);
        };
        fileReader.readAsArrayBuffer(pdfFile);
    };

    const parseText = (text) => {
        const lines = text
            .split("\n")
            .map(l => l.trim())
            .filter(l => l && !/^(page \d+|thank you|signature)/i.test(l)); // remove unnecessary lines

        const data = {
            hospitalName: lines[0] || "",
            hospitalAddress: lines.slice(1, 3).join(", "),
            patientName: "",
            age: "",
            sex: "",
            bedNo: "",
            admissionDate: "",
            dischargeDate: "",
            consultant: "",
            diagnosis: "",
            complaints: "",
            medications: [],
        };

        const keywords = {
            patientName: ["patient name", "name", "name of patient", "mr", "mrs", "ms", "shri", "smt"],
            age: ["age", "years old", "yrs", "age of patient"],
            sex: ["sex", "gender", "male", "female"],
            bedNo: ["bed no", "bed number", "bed"],
            admissionDate: ["admission date", "admitted on", "date of admission", "admission"],
            dischargeDate: ["discharge date", "discharged on", "date of discharge", "discharge"],
            consultant: ["consultant", "doctor", "physician", "consulting doctor", "dr", "dr."],
            complaints: ["chief complaint", "presenting complaint", "complaint", "symptoms"],
            diagnosis: ["diagnosis", "final diagnosis", "provisional diagnosis", "dx", "condition"],
            medications: ["tab", "tablet", "inj", "injection", "cap", "capsule", "syrup", "rx", "ointment"]
        };

        const normalize = (str) =>
            str.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim();

        const matchAliases = (line, aliases) => {
            const cleanLine = normalize(line);
            return aliases.some(alias => cleanLine.includes(normalize(alias)));
        };

        lines.forEach((line) => {
            const clean = normalize(line);

            if (!data.patientName && matchAliases(line, keywords.patientName)) {
                data.patientName = line.replace(/.*?(name|mr|mrs|ms|shri|smt)[\s:\-]*/i, "").trim();
            }

            if (!data.age && matchAliases(line, keywords.age)) {
                data.age = line.match(/(\d{1,3})\s*(yrs|years|y|yo)?/i)?.[1] || "";
            }

            if (!data.sex && matchAliases(line, keywords.sex)) {
                const sexMatch = line.match(/male|female|m|f/i);
                if (sexMatch)
                    data.sex = sexMatch[0].toLowerCase().startsWith("m") ? "Male" : "Female";
            }

            if (!data.bedNo && matchAliases(line, keywords.bedNo)) {
                data.bedNo = line.match(/bed\s*(no)?\s*[:\-]?\s*(\w+)/i)?.[2] || "";
            }

            if (!data.admissionDate && matchAliases(line, keywords.admissionDate)) {
                data.admissionDate = line.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/)?.[0] || "";
            }

            if (!data.dischargeDate && matchAliases(line, keywords.dischargeDate)) {
                data.dischargeDate = line.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/)?.[0] || "";
            }

            if (!data.consultant && matchAliases(line, keywords.consultant)) {
                data.consultant = line.split(/[:\-]/)[1]?.trim() || line;
            }

            if (!data.complaints && matchAliases(line, keywords.complaints)) {
                data.complaints = line.split(/[:\-]/)[1]?.trim() || line;
            }

            if (!data.diagnosis && matchAliases(line, keywords.diagnosis)) {
                data.diagnosis = line.split(/[:\-]/)[1]?.trim() || line;
            }

            if (matchAliases(line, keywords.medications)) {
                data.medications.push(line.trim());
            }
        });

        setParsed(data);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(parsed.hospitalName || "Hospital Name", 10, 10);
        doc.setFontSize(10);
        doc.text(parsed.hospitalAddress || "Hospital Address", 10, 16);

        doc.autoTable({
            head: [["Label", "Value"]],
            body: [
                ["Patient Name", parsed.patientName],
                ["Age", parsed.age],
                ["Sex", parsed.sex],
                ["Bed No", parsed.bedNo],
                ["Admission Date", parsed.admissionDate],
                ["Discharge Date", parsed.dischargeDate],
                ["Consultant", parsed.consultant],
                ["Complaint", parsed.complaints],
                ["Diagnosis", parsed.diagnosis],
            ],
            startY: 24
        });

        if (parsed.medications.length) {
            doc.text("Medications:", 10, doc.lastAutoTable.finalY + 10);
            parsed.medications.forEach((med, i) => {
                doc.text(`- ${med}`, 12, doc.lastAutoTable.finalY + 16 + (i * 6));
            });
        }

        doc.text("Signature: ___________________", 140, 280);
        doc.text("Hospital Address: " + (parsed.hospitalAddress || ""), 10, 285);
        doc.save("prescription.pdf");
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-tr from-blue-50 to-white">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-dashed rounded-full animate-spin"></div>
                </div>
            )}

            {/* <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <FaStethoscope className="text-[var(--primary-color)]" /> OCR  Reader
                    </h1>
                    <p className="text-sm text-gray-600">Advanced medical document processing system</p>
                </div>

            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <FaFileUpload /> Upload Document
                    </h3>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-40 text-gray-500 hover:border-[var(--primary-color)] cursor-pointer transition mb-4">
                        <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} hidden />
                        <div className="flex flex-col items-center">
                            <MdOutlinePreview size={36} />
                            <p className="text-sm">Drag & drop a prescription file here</p>
                            <small className="text-xs text-gray-400">Supports: images (JPG, PNG, TIFF) and PDF files</small>
                        </div>
                    </label>

                    {file && (
                        <div>
                            <p className="text-sm mb-2">{file.split("/").pop()}</p>
                            {file.endsWith(".pdf") ? (
                                <div className="text-xs italic text-gray-600 flex items-center gap-1">
                                    <MdPictureAsPdf /> PDF file uploaded
                                </div>
                            ) : (
                                <img src={file} alt="Preview" className="max-h-72 rounded border" />
                            )}
                        </div>
                    )}
                </div>

                {/* Output */}
                <div
                    ref={printRef}
                    className="bg-white rounded-xl shadow p-6 min-h-[300px] flex flex-col justify-center"
                >
                    {!rawText ? (
                        <div className="flex flex-col justify-center items-center text-center text-gray-500 h-full">
                            <FileText className="text-gray-400" size={48} />
                            <p className="mt-2 font-medium text-gray-600">Upload a document to extract prescription information</p>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-800 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 mb-4">
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-1">Extracted Information</h3>

                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            const printContents = printRef.current.innerHTML;
                                            const win = window.open("", "", "width=800,height=600");
                                            win.document.write(`<html><head><title>Print</title></head><body>${printContents}</body></html>`);
                                            win.document.close();
                                            win.focus();
                                            win.print();
                                            win.close();
                                        }}
                                        className="px-4 py-2 text-sm font-medium bg-blue-50 text-[var(--primary-color)] border border-blue-300 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>

                                    <button
                                        onClick={handleExportPDF}
                                        className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-100 rounded-xl shadow-md p-5 mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Hospital Icon and Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <Building2 className="text-[var(--primary-color)] w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-[var(--primary-color)]">
                                                {parsed.hospitalName || "Medical Center"}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                                                <span>{parsed.hospitalAddress || "Hospital Address"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow-md border">
                                {/* Patient Information */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-[var(--primary-color)]" />
                                        <span>Patient Information</span>
                                    </h4>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Name:</span> {parsed.patientName || "—"} &nbsp;&nbsp;
                                        <span className="font-semibold">Age:</span> {parsed.age || "—"}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Sex:</span> {parsed.sex || "—"} &nbsp;&nbsp;
                                        <span className="font-semibold">Bed No:</span> {parsed.bedNo || "—"}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-green-500" />
                                        <span>Dates</span>
                                    </h4>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Admission:</span> {parsed.admissionDate || "—"}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Discharge:</span> {parsed.dischargeDate || "—"}
                                    </p>
                                </div>

                                {/* Clinical Info */}
                                <div className="col-span-2 space-y-3">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <img src="/stethoscope-icon.svg" alt="Stethoscope" className="w-5 h-5 text-purple-500" />
                                        <span>Clinical Information</span>
                                    </h4>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Consultant:</span> {parsed.consultant || "—"}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Chief Complaint:</span> {parsed.complaints || "—"}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Diagnosis:</span> {parsed.diagnosis || "—"}
                                    </p>
                                </div>

                                {/* Medications */}
                                <div className="col-span-2 space-y-3">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-red-500" />
                                        <span>Medications</span>
                                    </h4>
                                    <ul className="list-disc pl-6 text-gray-700">
                                        {parsed.medications?.length > 0 ? (
                                            parsed.medications.map((med, i) => <li key={i}>{med}</li>)
                                        ) : (
                                            <li>—</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                                <p>Generated: {new Date().toLocaleDateString()}</p>
                                <p>Doctor Signature: _______________</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRPrescriptionReader;
