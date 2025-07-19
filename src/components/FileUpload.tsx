import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  accept = '.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize,
  });

  const removeFile = () => {
    onFileSelect(null);
  };

  if (selectedFile) {
    return (
      <Card className="border-2 border-dashed border-success bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium text-success">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={`border-2 border-dashed cursor-pointer transition-all duration-300 ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <CardContent className="p-8 text-center">
        <input {...getInputProps()} />
        <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
          isDragActive ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your PDF resume, or click to browse
        </p>
        <p className="text-sm text-muted-foreground">
          Supports PDF files up to 10MB
        </p>
      </CardContent>
    </Card>
  );
};