import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function InspirationUpload({ image, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file) {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) uploadFile(file);
        break;
      }
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      tabIndex={0}
      onClick={() => !uploading && inputRef.current?.click()}
      className="relative w-full h-48 border border-border bg-card cursor-pointer group hover:border-gold/50 transition-all focus:outline-none focus:border-gold/50 rounded-sm"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {uploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
        </div>
      ) : image ? (
        <>
          <img src={image} alt="השראה" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-mono text-xs text-white tracking-wider">החלף תמונה</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="font-mono text-sm text-muted-foreground group-hover:text-gold/70 transition-colors">גרור / הדבק / בחר תמונת השראה</span>
        </div>
      )}
    </div>
  );
}