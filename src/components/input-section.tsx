'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Loader2, Upload, FileText, X, File } from 'lucide-react';
import { parsePDFFile } from '@/app/actions';

interface InputSectionProps {
  onAnalyze: (syllabusText: string, papersText: string) => void;
  isLoading: boolean;
}

interface FileUploadState {
  file: File | null;
  isProcessing: boolean;
  error: string | null;
}

interface MultipleFileUploadState {
  files: File[];
  isProcessing: boolean;
  error: string | null;
  processingFiles: Set<string>;
}

export function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [syllabusText, setSyllabusText] = useState('');
  const [papersText, setPapersText] = useState('');
  const [syllabusFile, setSyllabusFile] = useState<FileUploadState>({ file: null, isProcessing: false, error: null });
  const [papersFiles, setPapersFiles] = useState<MultipleFileUploadState>({ 
    files: [], 
    isProcessing: false, 
    error: null, 
    processingFiles: new Set() 
  });
  
  const syllabusFileRef = useRef<HTMLInputElement>(null);
  const papersFileRef = useRef<HTMLInputElement>(null);

  const validatePDFFile = (file: File): boolean => {
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
  };

  const handleFileUpload = async (file: File, type: 'syllabus' | 'papers') => {
    if (!validatePDFFile(file)) {
      const errorMessage = file.type !== 'application/pdf' 
        ? 'Please upload a valid PDF file.' 
        : 'File size must be less than 10MB.';
      
      if (type === 'syllabus') {
        setSyllabusFile({ file: null, isProcessing: false, error: errorMessage });
      } else {
        setPapersFiles(prev => ({ ...prev, error: errorMessage }));
      }
      return;
    }

    // Set processing state
    if (type === 'syllabus') {
      setSyllabusFile({ file, isProcessing: true, error: null });
    } else {
      setPapersFiles(prev => ({ 
        ...prev, 
        isProcessing: true, 
        error: null,
        processingFiles: new Set([...prev.processingFiles, file.name])
      }));
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await parsePDFFile(arrayBuffer);
      
      if (type === 'syllabus') {
        setSyllabusText(result.text);
        setSyllabusFile({ file, isProcessing: false, error: null });
      } else {
        // For papers, combine with existing text
        const newText = papersText ? `${papersText}\n\n--- ${file.name} ---\n\n${result.text}` : result.text;
        setPapersText(newText);
        setPapersFiles(prev => ({ 
          ...prev, 
          files: [...prev.files, file],
          isProcessing: false,
          processingFiles: new Set([...prev.processingFiles].filter(name => name !== file.name))
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse PDF';
      if (type === 'syllabus') {
        setSyllabusFile({ file: null, isProcessing: false, error: errorMessage });
      } else {
        setPapersFiles(prev => ({ 
          ...prev, 
          isProcessing: false,
          error: errorMessage,
          processingFiles: new Set([...prev.processingFiles].filter(name => name !== file.name))
        }));
      }
    }
  };

  const handleMultipleFileUpload = async (files: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Validate all files first
    Array.from(files).forEach(file => {
      if (validatePDFFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setPapersFiles(prev => ({ 
        ...prev, 
        error: `Invalid files: ${invalidFiles.join(', ')}. Please upload valid PDF files under 10MB.`
      }));
    }

    if (validFiles.length === 0) return;

    // Set processing state for all valid files
    setPapersFiles(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null,
      processingFiles: new Set(validFiles.map(f => f.name))
    }));

    // Process all files
    let combinedText = papersText;
    const processedFiles: File[] = [];

    for (const file of validFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await parsePDFFile(arrayBuffer);
        combinedText = combinedText ? `${combinedText}\n\n--- ${file.name} ---\n\n${result.text}` : result.text;
        processedFiles.push(file);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    setPapersText(combinedText);
    setPapersFiles(prev => ({ 
      ...prev, 
      files: [...prev.files, ...processedFiles],
      isProcessing: false,
      processingFiles: new Set()
    }));
  };

  const handleFileRemove = (type: 'syllabus' | 'papers', fileName?: string) => {
    if (type === 'syllabus') {
      setSyllabusFile({ file: null, isProcessing: false, error: null });
      setSyllabusText('');
      if (syllabusFileRef.current) syllabusFileRef.current.value = '';
    } else if (fileName) {
      // Remove specific file from papers
      setPapersFiles(prev => {
        const updatedFiles = prev.files.filter(f => f.name !== fileName);
        const updatedText = papersText.split('\n\n--- ').filter(section => 
          !section.startsWith(`${fileName} ---`)
        ).join('\n\n--- ').replace(/^--- /, '');
        
        setPapersText(updatedText);
        return { 
          ...prev, 
          files: updatedFiles,
          error: null
        };
      });
    } else {
      // Remove all papers files
      setPapersFiles({ files: [], isProcessing: false, error: null, processingFiles: new Set() });
      setPapersText('');
      if (papersFileRef.current) papersFileRef.current.value = '';
    }
  };


  const handleAnalyzeClick = () => {
    onAnalyze(syllabusText, papersText);
  };

  return (
    <Card id="input">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl">Upload Documents</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Upload PDF files or paste text content for your syllabus and past exam papers to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Syllabus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-base sm:text-lg">Syllabus Content</label>
              {syllabusFile.file && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <File className="h-3 w-3" />
                  <span className="hidden sm:inline">{syllabusFile.file.name}</span>
                  <span className="sm:hidden truncate max-w-20">{syllabusFile.file.name}</span>
                </Badge>
              )}
            </div>
            
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Text Input</span>
                  <span className="sm:hidden">Text</span>
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">PDF Upload</span>
                  <span className="sm:hidden">PDF</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-2">
                <Textarea
                  placeholder="Paste your syllabus here..."
                  className="min-h-[200px] sm:min-h-[250px] font-code text-sm sm:text-base"
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="file" className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={syllabusFileRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'syllabus');
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  {syllabusFile.isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600">Processing PDF...</p>
                    </div>
                  ) : syllabusFile.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <File className="h-8 w-8 text-green-500" />
                      <p className="text-sm font-medium">{syllabusFile.file.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileRemove('syllabus')}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload PDF</p>
                      <Button
                        variant="outline"
                        onClick={() => syllabusFileRef.current?.click()}
                        disabled={isLoading}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                  
                  {syllabusFile.error && (
                    <p className="text-sm text-red-500 mt-2">{syllabusFile.error}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Papers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-base sm:text-lg">Past Papers Content</label>
              {papersFiles.files.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <File className="h-3 w-3" />
                  {papersFiles.files.length} file{papersFiles.files.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Text Input</span>
                  <span className="sm:hidden">Text</span>
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">PDF Upload</span>
                  <span className="sm:hidden">PDF</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-2">
                <Textarea
                  placeholder="Paste questions from past papers here..."
                  className="min-h-[200px] sm:min-h-[250px] font-code text-sm sm:text-base"
                  value={papersText}
                  onChange={(e) => setPapersText(e.target.value)}
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="file" className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={papersFileRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleMultipleFileUpload(files);
                      }
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  {papersFiles.isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600">
                        Processing {papersFiles.processingFiles.size} PDF{papersFiles.processingFiles.size > 1 ? 's' : ''}...
                      </p>
                    </div>
                  ) : papersFiles.files.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center gap-2">
                        <File className="h-8 w-8 text-green-500" />
                        <p className="text-sm font-medium">{papersFiles.files.length} file{papersFiles.files.length > 1 ? 's' : ''} uploaded</p>
                      </div>
                      
                      {/* File List */}
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {papersFiles.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700 truncate max-w-48">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileRemove('papers', file.name)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => papersFileRef.current?.click()}
                          disabled={isLoading}
                        >
                          Add More Files
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileRemove('papers')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload multiple PDFs</p>
                      <p className="text-xs text-gray-500">You can select multiple files at once</p>
                      <Button
                        variant="outline"
                        onClick={() => papersFileRef.current?.click()}
                        disabled={isLoading}
                      >
                        Choose Files
                      </Button>
                    </div>
                  )}
                  
                  {papersFiles.error && (
                    <p className="text-sm text-red-500 mt-2">{papersFiles.error}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleAnalyzeClick} disabled={isLoading || !syllabusText || !papersText} size="lg" className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
                <span className="sm:hidden">Analyzing...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Analyze & Predict</span>
                <span className="sm:hidden">Analyze</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
