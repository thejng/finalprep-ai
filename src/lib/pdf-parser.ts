// Note: Avoid static importing of `pdf-parse` because its ESM build pulls in a pdf.js worker
// that breaks certain bundlers during Next.js production builds. We dynamically require it
// only inside the Node-only function below to keep client bundles clean and prevent webpack
// from analyzing the dependency.

export interface PDFParseResult {
  text: string;
  pages: number;
  info?: any;
}

// Server-side parsing with pdf-parse (Node only)
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    // Dynamically require to avoid bundling `pdf-parse` in client/edge builds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule: any = (0, eval)('require')('pdf-parse');
    const pdfFn = pdfParseModule.pdf ?? pdfParseModule; // support both ESM named and CJS default
    const data = await pdfFn(buffer);
    return {
      text: data.text,
      pages: (data as any).numpages || 1,
      info: (data as any).info || {},
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validatePDFFile(file: File): boolean {
  // Check file type
  if (file.type !== 'application/pdf') {
    return false;
  }
  
  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

// Client-side PDF parsing using pdfjs-dist
// This should only be called in the browser
export async function parsePDFClient(input: ArrayBuffer | Uint8Array | Blob): Promise<PDFParseResult> {
  if (typeof window === 'undefined') {
    throw new Error('parsePDFClient can only be used in the browser');
  }

  // Normalize to Uint8Array for pdf.js
  let data: Uint8Array;
  if (input instanceof Uint8Array) {
    data = input;
  } else if (typeof Blob !== 'undefined' && input instanceof Blob) {
    const ab = await input.arrayBuffer();
    data = new Uint8Array(ab);
  } else {
    // treat as ArrayBuffer
    data = new Uint8Array(input as ArrayBuffer);
  }

  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker to same-origin file served from public/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  // Load document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadingTask = (pdfjsLib as any).getDocument({ data });
  const pdfDocument = await loadingTask.promise;

  let fullText = '';
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join(' ');
    fullText += (pageNumber > 1 ? '\n\n' : '') + pageText;
  }

  return {
    text: fullText,
    pages: pdfDocument.numPages,
  };
}