"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { uploadAttachment, deleteAttachment, getAttachmentUrl } from "@/app/actions/attachments";
import { Badge } from "@/components/ui/badge";

interface Attachment {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  uploader: {
    name: string;
    email: string;
  };
}

interface AttachmentUploadProps {
  requestId: string;
  attachments: Attachment[];
  canUpload: boolean; // Based on subscription tier
  canDelete: boolean; // Based on role
  onUpdate: () => void;
}

export function AttachmentUpload({
  requestId,
  attachments,
  canUpload,
  canDelete,
  onUpdate,
}: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate progress since we can't track actual upload progress with server actions
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% until upload completes
        return prev + 10;
      });
    }, 200);

    try {
      const result = await uploadAttachment(requestId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!result.success) {
        setError(result.error || 'Upload failed');
      } else {
        // Small delay to show 100% before resetting
        setTimeout(() => {
          onUpdate();
          setUploadProgress(0);
        }, 500);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Upload failed unexpectedly');
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;

    const result = await deleteAttachment(attachmentId);
    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'Failed to delete attachment');
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    const result = await getAttachmentUrl(attachmentId);
    if (result.success && result.url) {
      const a = document.createElement('a');
      a.href = result.url;
      a.download = fileName;
      a.click();
    } else {
      alert(result.error || 'Failed to download');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <File className="w-5 h-5 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('sheet')) return <FileText className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="p-6 rounded-[18px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Attachments</h3>
          <p className="text-sm text-[#86868b]">
            Upload supporting documents (PDF, DOCX, XLSX, PNG, JPG - max 10MB)
          </p>
        </div>

        {canUpload ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="text-[#0071e3] border-[#0071e3]">
            Pro Feature
          </Badge>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Uploading file...</p>
            <p className="text-sm font-semibold text-blue-900">{uploadProgress}%</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0071e3] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-[#86868b]">
          <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1d1d1f] truncate">
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-[#86868b]">
                    {formatFileSize(attachment.file_size)} •{' '}
                    {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment.id, attachment.file_name)}
                  className="rounded-full"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!canUpload && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Upgrade to Pro</strong> to attach files to approval requests.
            Securely store contracts, quotes, and supporting documents.
          </p>
        </div>
      )}
    </Card>
  );
}
