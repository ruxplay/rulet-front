'use client';

import React, { useState, useRef } from 'react';
import { uploadImageToCloudinary } from '@/lib/services/cloudinary';

interface ReceiptUploadProps {
  onUpload: (fileData: {
    receiptUrl: string;
    receiptPublicId: string;
    receiptFormat: string;
    receiptBytes: number;
  }) => void;
  error?: string;
  disabled?: boolean;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onUpload,
  error,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen (JPG, PNG)');
      return;
    }

    // Validar tamaño (máximo 2MB como en el HTML original)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('La imagen no debe exceder los 2MB');
      return;
    }

    setUploadedFile(file);
    
    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Subir imagen a Cloudinary
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Subir imagen real a Cloudinary
      const uploadResult = await uploadImageToCloudinary(file);
      
      const fileData = {
        receiptUrl: uploadResult.url,
        receiptPublicId: uploadResult.publicId,
        receiptFormat: uploadResult.format,
        receiptBytes: uploadResult.bytes,
      };

      onUpload(fileData);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo. Inténtalo nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="receipt-upload">
      <div className="upload-area" onClick={triggerFileInput}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="file-input"
        />
        
        {isUploading ? (
          <div className="upload-loading">
            <div className="loading-spinner"></div>
            <span>Subiendo comprobante...</span>
          </div>
        ) : uploadedFile ? (
          <div className="upload-success">
            <div className="file-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              ) : (
                <div className="file-icon">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="file-info">
              <span className="file-name">{uploadedFile.name}</span>
              <span className="file-size">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="remove-file-btn"
              disabled={disabled}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <div className="upload-text">
              <span className="upload-title">Subir Comprobante</span>
              <span className="upload-subtitle">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </span>
              <span className="upload-formats">
                Formatos: JPG, PNG (máx. 2MB)
              </span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
};

export default ReceiptUpload;
