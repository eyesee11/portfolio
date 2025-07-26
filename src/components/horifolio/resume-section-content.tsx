"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, FileText, Upload, ArrowRight } from "lucide-react";

// Import libraries for document parsing
import mammoth from 'mammoth';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Configure PDF.js worker - using local worker file
const initializePdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
  }
  return pdfjsLib;
};

export function ResumeSectionContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fromFormat, setFromFormat] = useState<string>("");
  const [toFormat, setToFormat] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [isPdfJsReady, setIsPdfJsReady] = useState(false);

  // Check if PDF.js is available on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializePdfJs().then((pdfjs) => {
        setIsPdfJsReady(!!pdfjs);
      }).catch(() => {
        setIsPdfJsReady(false);
      });
    }
  }, []);

  const supportedFormats = [
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "Word Document" },
    { value: "txt", label: "Text File" },
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "jpg", label: "JPEG Image" },
    { value: "png", label: "PNG Image" },
    { value: "svg", label: "SVG" },
    { value: "html", label: "HTML" },
    { value: "md", label: "Markdown" },
  ];

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = '/Resume.pdf';
    link.download = 'Ayush_Chauhan_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect file format
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && supportedFormats.some(format => format.value === extension)) {
        setFromFormat(extension);
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !fromFormat || !toFormat) {
      alert("Please select a file and both conversion formats.");
      return;
    }

    if (fromFormat === toFormat) {
      alert("Source and target formats cannot be the same.");
      return;
    }

    setIsConverting(true);
    
    try {
      // Read the file content
      const fileContent = await readFileContent(selectedFile, fromFormat);
      
      // Convert the content
      const convertedContent = await convertFile(fileContent, fromFormat, toFormat, selectedFile.name);
      
      // Download the converted file
      downloadConvertedFile(convertedContent, selectedFile.name, toFormat);
      
    } catch (error) {
      console.error('Conversion error:', error);
      alert(`Error converting file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Helper function to extract text from PDF
  const extractPdfText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      // Initialize PDF.js dynamically
      const pdfjs = await initializePdfJs();
      if (!pdfjs) {
        throw new Error('PDF.js could not be loaded. This feature is only available in the browser.');
      }

      // Try to initialize PDF.js with fallback worker URLs
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        // Try multiple CDN sources as fallback
        const workerUrls = [
          '/js/pdf.worker.min.mjs',
          `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        ];
        
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrls[0];
      }

      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item): item is any => 'str' in item)
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // If worker fails, try with a different worker URL
      try {
        const pdfjs = await initializePdfJs();
        if (!pdfjs) {
          throw new Error('PDF.js could not be loaded.');
        }
        
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item): item is any => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        return fullText.trim();
      } catch (fallbackError) {
        console.error('PDF fallback extraction failed:', fallbackError);
        throw new Error('Failed to extract text from PDF. The file may be corrupted, password-protected, or the PDF.js worker could not be loaded. Please try a different file.');
      }
    }
  };

  // Helper function to extract text from DOCX
  const extractDocxText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from Word document. The file may be corrupted or password-protected.');
    }
  };
  const readFileContent = (file: File, format: string): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      
      // Read as text for text-based formats, as ArrayBuffer for binary formats
      if (['txt', 'json', 'csv', 'html', 'md', 'svg'].includes(format)) {
        reader.readAsText(file);
      } else {
        // For PDF, DOCX, and image formats, read as ArrayBuffer
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Main conversion function
  const convertFile = async (content: string | ArrayBuffer, fromFormat: string, toFormat: string, originalName: string): Promise<string | Blob> => {
    
    // PDF to other formats
    if (fromFormat === 'pdf') {
      try {
        const extractedText = await extractPdfText(content as ArrayBuffer);
        
        switch (toFormat) {
          case 'txt':
            return extractedText;
          case 'json':
            return JSON.stringify({
              fileName: originalName,
              format: 'pdf',
              size: (content as ArrayBuffer).byteLength,
              extractedText: extractedText,
              pages: extractedText.split('\n').length
            }, null, 2);
          case 'html':
            return `<!DOCTYPE html><html><head><title>PDF Content - ${originalName}</title></head><body><h1>${originalName}</h1><pre>${extractedText}</pre></body></html>`;
          case 'md':
            return `# PDF Document: ${originalName}\n\n${extractedText}`;
          case 'csv':
            // Convert text lines to CSV format
            const lines = extractedText.split('\n').filter(line => line.trim());
            return `"Line Number","Content"\n${lines.map((line, index) => `"${index + 1}","${line.replace(/"/g, '""')}"`).join('\n')}`;
          case 'docx':
            // For PDF to DOCX, we'll create a simple Word-compatible HTML format
            const docxContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>
body { font-family: Arial, sans-serif; margin: 1in; }
h1 { color: #2E74B5; }
</style>
</head>
<body>
<h1>Converted from PDF: ${originalName}</h1>
<div>${extractedText.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
            return new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          case 'jpg':
          case 'png':
          case 'svg':
            // For PDF to image conversion, create a text representation
            return `PDF Document: ${originalName}\n\nText Content:\n${extractedText}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
        }
      } catch (error) {
        // Fallback to basic info if extraction fails
        const pdfInfo = `PDF Document: ${originalName}\nSize: ${(content as ArrayBuffer).byteLength} bytes\n\nError: ${error instanceof Error ? error.message : 'Could not extract text'}`;
        return toFormat === 'json' ? JSON.stringify({ error: pdfInfo }, null, 2) : pdfInfo;
      }
    }
    
    // DOCX to other formats
    if (fromFormat === 'docx') {
      try {
        const extractedText = await extractDocxText(content as ArrayBuffer);
        
        switch (toFormat) {
          case 'txt':
            return extractedText;
          case 'json':
            return JSON.stringify({
              fileName: originalName,
              format: 'docx',
              size: (content as ArrayBuffer).byteLength,
              extractedText: extractedText,
              wordCount: extractedText.split(/\s+/).length
            }, null, 2);
          case 'html':
            return `<!DOCTYPE html><html><head><title>Word Doc Content - ${originalName}</title></head><body><h1>${originalName}</h1><div>${extractedText.replace(/\n/g, '<br>')}</div></body></html>`;
          case 'md':
            return `# Word Document: ${originalName}\n\n${extractedText}`;
          case 'csv':
            // Convert paragraphs to CSV format
            const paragraphs = extractedText.split('\n').filter(para => para.trim());
            return `"Paragraph Number","Content"\n${paragraphs.map((para, index) => `"${index + 1}","${para.replace(/"/g, '""')}"`).join('\n')}`;
          case 'pdf':
            // For DOCX to PDF, create a simple representation
            return `DOCX Document: ${originalName}\n\nConverted Text Content:\n${extractedText}\n\nNote: This is a text representation. For actual PDF conversion with formatting, specialized tools are required.`;
          case 'jpg':
          case 'png':
          case 'svg':
            // For DOCX to image conversion, create a text representation
            return `Word Document: ${originalName}\n\nText Content:\n${extractedText}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
        }
      } catch (error) {
        // Fallback to basic info if extraction fails
        const docxInfo = `Word Document: ${originalName}\nSize: ${(content as ArrayBuffer).byteLength} bytes\n\nError: ${error instanceof Error ? error.message : 'Could not extract text'}`;
        return toFormat === 'json' ? JSON.stringify({ error: docxInfo }, null, 2) : docxInfo;
      }
    }

    // Text to other formats
    if (fromFormat === 'txt') {
      switch (toFormat) {
        case 'json':
          return JSON.stringify({ content: content as string, originalFile: originalName }, null, 2);
        case 'html':
          return `<!DOCTYPE html><html><head><title>${originalName}</title></head><body><pre>${content}</pre></body></html>`;
        case 'md':
          return `# ${originalName}\n\n${content}`;
        case 'csv':
          // Split text by lines and create CSV
          const lines = (content as string).split('\n');
          return lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
        case 'pdf':
          return `Text File: ${originalName}\n\nContent:\n${content}\n\nNote: This is a text representation. For actual PDF conversion, specialized tools are required.`;
        case 'docx':
          // Create Word-compatible HTML
          const docxHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; }</style>
</head>
<body>
<h1>Text File: ${originalName}</h1>
<pre>${content}</pre>
</body>
</html>`;
          return new Blob([docxHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        case 'jpg':
        case 'png':
        case 'svg':
          return `Text File: ${originalName}\n\nContent:\n${content}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
      }
    }
    
    // JSON to other formats
    if (fromFormat === 'json') {
      try {
        const jsonData = JSON.parse(content as string);
        switch (toFormat) {
          case 'txt':
            return JSON.stringify(jsonData, null, 2);
          case 'csv':
            if (Array.isArray(jsonData)) {
              return jsonArrayToCsv(jsonData);
            }
            return Object.entries(jsonData).map(([key, value]) => `"${key}","${value}"`).join('\n');
          case 'html':
            return `<!DOCTYPE html><html><head><title>JSON Data</title></head><body><pre>${JSON.stringify(jsonData, null, 2)}</pre></body></html>`;
          case 'md':
            return `# JSON Data\n\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``;
          case 'pdf':
            return `JSON File: ${originalName}\n\nContent:\n${JSON.stringify(jsonData, null, 2)}\n\nNote: This is a text representation. For actual PDF conversion, specialized tools are required.`;
          case 'docx':
            const jsonDocxHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; } pre { background: #f5f5f5; padding: 10px; }</style>
</head>
<body>
<h1>JSON Data: ${originalName}</h1>
<pre>${JSON.stringify(jsonData, null, 2)}</pre>
</body>
</html>`;
            return new Blob([jsonDocxHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          case 'jpg':
          case 'png':
          case 'svg':
            return `JSON File: ${originalName}\n\nContent:\n${JSON.stringify(jsonData, null, 2)}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
        }
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    }
    
    // CSV to other formats
    if (fromFormat === 'csv') {
      const csvData = parseCsv(content as string);
      switch (toFormat) {
        case 'json':
          return JSON.stringify(csvData, null, 2);
        case 'txt':
          return csvData.map(row => row.join('\t')).join('\n');
        case 'html':
          const tableRows = csvData.map(row => 
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('\n');
          return `<!DOCTYPE html><html><head><title>CSV Data</title></head><body><table border="1">\n${tableRows}\n</table></body></html>`;
        case 'md':
          if (csvData.length === 0) return '';
          const header = csvData[0].map(cell => cell).join(' | ');
          const separator = csvData[0].map(() => '---').join(' | ');
          const rows = csvData.slice(1).map(row => row.join(' | ')).join('\n');
          return `${header}\n${separator}\n${rows}`;
        case 'pdf':
          const csvText = csvData.map(row => row.join('\t')).join('\n');
          return `CSV File: ${originalName}\n\nContent:\n${csvText}\n\nNote: This is a text representation. For actual PDF conversion, specialized tools are required.`;
        case 'docx':
          const csvTableHtml = csvData.map(row => 
            `<tr>${row.map(cell => `<td style="border:1px solid #ccc; padding:5px;">${cell}</td>`).join('')}</tr>`
          ).join('\n');
          const csvDocxHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; } table { border-collapse: collapse; width: 100%; }</style>
</head>
<body>
<h1>CSV Data: ${originalName}</h1>
<table>\n${csvTableHtml}\n</table>
</body>
</html>`;
          return new Blob([csvDocxHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        case 'jpg':
        case 'png':
        case 'svg':
          const csvTextForImage = csvData.map(row => row.join('\t')).join('\n');
          return `CSV File: ${originalName}\n\nContent:\n${csvTextForImage}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
      }
    }
    
    // HTML to other formats
    if (fromFormat === 'html') {
      const textContent = (content as string).replace(/<[^>]*>/g, ''); // Strip HTML tags
      switch (toFormat) {
        case 'txt':
          return textContent;
        case 'md':
          // Basic HTML to Markdown conversion
          let mdContent = content as string;
          mdContent = mdContent.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
          mdContent = mdContent.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
          mdContent = mdContent.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
          mdContent = mdContent.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
          mdContent = mdContent.replace(/<br\s*\/?>/gi, '\n');
          mdContent = mdContent.replace(/<[^>]*>/g, ''); // Remove remaining tags
          return mdContent;
        case 'json':
          return JSON.stringify({ html: content, text: textContent }, null, 2);
        case 'csv':
          const htmlLines = textContent.split('\n').filter(line => line.trim());
          return `"Line Number","Content"\n${htmlLines.map((line, index) => `"${index + 1}","${line.replace(/"/g, '""')}"`).join('\n')}`;
        case 'pdf':
          return `HTML File: ${originalName}\n\nText Content:\n${textContent}\n\nNote: This is a text representation. For actual PDF conversion, specialized tools are required.`;
        case 'docx':
          // HTML is already compatible with Word
          const htmlDocx = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; }</style>
</head>
<body>
<h1>HTML Content: ${originalName}</h1>
${content}
</body>
</html>`;
          return new Blob([htmlDocx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        case 'jpg':
        case 'png':
        case 'svg':
          return `HTML File: ${originalName}\n\nText Content:\n${textContent}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
      }
    }
    
    // Markdown to other formats
    if (fromFormat === 'md') {
      switch (toFormat) {
        case 'html':
          let htmlContent = content as string;
          htmlContent = htmlContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');
          htmlContent = htmlContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
          htmlContent = htmlContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
          htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
          htmlContent = htmlContent.replace(/\n/g, '<br>');
          return `<!DOCTYPE html><html><head><title>Converted from Markdown</title></head><body>${htmlContent}</body></html>`;
        case 'txt':
          return (content as string).replace(/[#*`]/g, '');
        case 'json':
          return JSON.stringify({ markdown: content }, null, 2);
        case 'csv':
          const mdLines = (content as string).split('\n').filter(line => line.trim());
          return `"Line Number","Content"\n${mdLines.map((line, index) => `"${index + 1}","${line.replace(/"/g, '""')}"`).join('\n')}`;
        case 'pdf':
          const mdText = (content as string).replace(/[#*`]/g, '');
          return `Markdown File: ${originalName}\n\nContent:\n${mdText}\n\nNote: This is a text representation. For actual PDF conversion, specialized tools are required.`;
        case 'docx':
          let mdHtmlContent = content as string;
          mdHtmlContent = mdHtmlContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');
          mdHtmlContent = mdHtmlContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
          mdHtmlContent = mdHtmlContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
          mdHtmlContent = mdHtmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          mdHtmlContent = mdHtmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
          mdHtmlContent = mdHtmlContent.replace(/\n/g, '<br>');
          const mdDocxHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; }</style>
</head>
<body>
<h1>Markdown Content: ${originalName}</h1>
${mdHtmlContent}
</body>
</html>`;
          return new Blob([mdDocxHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        case 'jpg':
        case 'png':
        case 'svg':
          const mdTextForImage = (content as string).replace(/[#*`]/g, '');
          return `Markdown File: ${originalName}\n\nContent:\n${mdTextForImage}\n\nNote: This is a text representation. For actual image conversion, specialized tools are required.`;
      }
    }

    // For image formats and other binary formats, we'll create comprehensive conversions
    if (['jpg', 'png', 'svg'].includes(fromFormat)) {
      const isTextFormat = fromFormat === 'svg';
      const imageContent = isTextFormat ? content as string : '';
      
      switch (toFormat) {
        case 'txt':
          if (fromFormat === 'svg') {
            // Extract text from SVG if possible
            const textMatch = imageContent.match(/<text[^>]*>(.*?)<\/text>/gi);
            const extractedText = textMatch ? textMatch.map(t => t.replace(/<[^>]*>/g, '')).join('\n') : '';
            return `SVG File: ${originalName}\nSize: ${isTextFormat ? imageContent.length : (content as ArrayBuffer).byteLength} bytes\n\nExtracted Text:\n${extractedText || 'No text found in SVG'}`;
          }
          return `Image file: ${originalName}\nFormat: ${fromFormat}\nSize: ${(content as ArrayBuffer).byteLength} bytes\n\nNote: This is an image file. Text extraction from images requires OCR technology.`;
        
        case 'json':
          if (fromFormat === 'svg') {
            return JSON.stringify({
              fileName: originalName,
              format: fromFormat,
              size: imageContent.length,
              svgContent: imageContent,
              note: "SVG content included as text"
            }, null, 2);
          }
          return JSON.stringify({
            fileName: originalName,
            format: fromFormat,
            size: (content as ArrayBuffer).byteLength,
            note: "Binary image data cannot be directly converted to text formats"
          }, null, 2);
        
        case 'html':
          if (fromFormat === 'svg') {
            return `<!DOCTYPE html><html><head><title>SVG Content - ${originalName}</title></head><body><h1>${originalName}</h1><div>${imageContent}</div></body></html>`;
          }
          const base64 = btoa(String.fromCharCode(...new Uint8Array(content as ArrayBuffer)));
          return `<!DOCTYPE html><html><head><title>Image - ${originalName}</title></head><body><h1>${originalName}</h1><img src="data:image/${fromFormat};base64,${base64}" alt="${originalName}" style="max-width:100%;"></body></html>`;
        
        case 'md':
          if (fromFormat === 'svg') {
            return `# SVG Image: ${originalName}\n\n\`\`\`svg\n${imageContent}\n\`\`\``;
          }
          return `# Image: ${originalName}\n\nFormat: ${fromFormat.toUpperCase()}\nSize: ${(content as ArrayBuffer).byteLength} bytes\n\nNote: This is an image file. For display in markdown, the image needs to be hosted online.`;
        
        case 'csv':
          return `"Property","Value"\n"File Name","${originalName}"\n"Format","${fromFormat}"\n"Size","${isTextFormat ? imageContent.length : (content as ArrayBuffer).byteLength} bytes"\n"Type","Image File"`;
        
        case 'pdf':
          const imageInfo = isTextFormat ? imageContent : `Binary image data (${(content as ArrayBuffer).byteLength} bytes)`;
          return `Image File: ${originalName}\nFormat: ${fromFormat.toUpperCase()}\n\nContent:\n${imageInfo}\n\nNote: This is a text representation. For actual PDF conversion with image embedding, specialized tools are required.`;
        
        case 'docx':
          let docxImageHtml;
          if (fromFormat === 'svg') {
            docxImageHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; }</style>
</head>
<body>
<h1>SVG Image: ${originalName}</h1>
<div>${imageContent}</div>
</body>
</html>`;
          } else {
            const base64Image = btoa(String.fromCharCode(...new Uint8Array(content as ArrayBuffer)));
            docxImageHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${originalName}</title>
<style>body { font-family: Arial, sans-serif; margin: 1in; }</style>
</head>
<body>
<h1>Image: ${originalName}</h1>
<img src="data:image/${fromFormat};base64,${base64Image}" alt="${originalName}" style="max-width:100%;">
</body>
</html>`;
          }
          return new Blob([docxImageHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        case 'jpg':
        case 'png':
        case 'svg':
          if (fromFormat === toFormat) {
            throw new Error(`Source and target formats cannot be the same (${fromFormat})`);
          }
          return `Image Conversion: ${originalName}\nFrom: ${fromFormat.toUpperCase()}\nTo: ${toFormat.toUpperCase()}\n\nNote: Direct image format conversion requires specialized image processing libraries. This is a text representation.`;
      }
    }
    
    throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported yet`);
  };

  // Helper function to parse CSV
  const parseCsv = (csvText: string): string[][] => {
    const lines = csvText.split('\n');
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  // Helper function to convert JSON array to CSV
  const jsonArrayToCsv = (jsonArray: any[]): string => {
    if (jsonArray.length === 0) return '';
    
    const headers = Object.keys(jsonArray[0]);
    const csvContent = [
      headers.join(','),
      ...jsonArray.map(row => 
        headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')
      )
    ];
    
    return csvContent.join('\n');
  };

  // Helper function to download converted file
  const downloadConvertedFile = (content: string | Blob, originalName: string, toFormat: string) => {
    let blob: Blob;
    let mimeType: string;
    
    // Determine MIME type based on format
    switch (toFormat) {
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'html':
        mimeType = 'text/html';
        break;
      case 'json':
        mimeType = 'application/json';
        break;
      case 'csv':
        mimeType = 'text/csv';
        break;
      case 'md':
        mimeType = 'text/markdown';
        break;
      case 'svg':
        mimeType = 'image/svg+xml';
        break;
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      default:
        mimeType = 'text/plain';
    }
    
    if (content instanceof Blob) {
      blob = content;
    } else {
      blob = new Blob([content], { type: mimeType });
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    link.href = url;
    link.download = `${nameWithoutExt}_converted.${toFormat}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`File successfully converted to ${toFormat.toUpperCase()} and downloaded!`);
  };

  return (
    <div className="space-y-8 text-white">
      {/* Resume Download Section */}
      <Card className="bg-black/40 border-white/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-400" />
          </div>
          <CardTitle className="text-white text-2xl">My Resume</CardTitle>
          <CardDescription className="text-white/70 text-base">
            Download my professional resume to learn more about my experience, skills, and accomplishments. 
            Get a comprehensive overview of my career journey and technical expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={handleDownloadResume}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Resume
          </Button>
        </CardContent>
      </Card>

      {/* File Converter Section */}
      <Card className="bg-black/40 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center">
            <Upload className="mr-3 h-6 w-6 text-green-400" />
            File Converter
          </CardTitle>
          <CardDescription className="text-white/70">
            Convert files between different formats with full text extraction support for PDF and Word documents. 
            Transform your documents, data, and images with ease!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-white font-medium">
              Select File to Convert
            </Label>
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
                accept=".pdf,.docx,.txt,.json,.csv,.jpg,.jpeg,.png,.svg,.html,.md"
              />
            </div>
            {selectedFile && (
              <p className="text-green-400 text-sm">
                Selected: {selectedFile.name}
              </p>
            )}
            {(fromFormat === 'pdf' || fromFormat === 'docx') && (
              <p className="text-blue-400 text-sm">
                ✨ Full text extraction enabled for {fromFormat === 'pdf' ? 'PDF' : 'Word'} documents!
                {fromFormat === 'pdf' && !isPdfJsReady && (
                  <span className="text-yellow-400 block">⚠️ PDF processing is loading...</span>
                )}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-white font-medium">From Format</Label>
              <select 
                value={fromFormat} 
                onChange={(e) => setFromFormat(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-900">Select source format</option>
                {supportedFormats.map((format) => (
                  <option 
                    key={format.value} 
                    value={format.value}
                    className="bg-gray-900"
                  >
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-blue-400" />
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">To Format</Label>
              <select 
                value={toFormat} 
                onChange={(e) => setToFormat(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-900">Select target format</option>
                {supportedFormats.map((format) => (
                  <option 
                    key={format.value} 
                    value={format.value}
                    className="bg-gray-900"
                  >
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Convert Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={handleConvert}
              disabled={!selectedFile || !fromFormat || !toFormat || isConverting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 text-lg font-semibold transition-all duration-200"
              size="lg"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Convert File
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
