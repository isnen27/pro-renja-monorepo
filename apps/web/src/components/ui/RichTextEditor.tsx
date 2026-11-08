import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Undo,
  Redo,
  RemoveFormatting,
  Paperclip,
  FileText,
  X,
} from "lucide-react";

export interface AttachedDocument {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
  allowAttachments?: boolean;
  attachments?: AttachedDocument[];
  onAttachmentsChange?: (files: AttachedDocument[]) => void;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "Ketik teks di sini...",
  minHeight = "120px",
  allowAttachments = false,
  attachments = [],
  onAttachmentsChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal HTML with value prop without breaking active typing
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only set if not currently focused or if empty
      if (document.activeElement !== editorRef.current || !value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const executeCommand = (command: string, valueArg: string | undefined = undefined) => {
    if (disabled) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    if (disabled) return;
    const url = prompt("Masukkan URL link:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--text)" }}
        >
          {label}
        </label>
      )}

      <div
        className="rounded-lg border overflow-hidden transition-colors"
        style={{
          borderColor: "var(--border)",
          backgroundColor: disabled ? "var(--primary-bg)" : "var(--card)",
        }}
      >
        {/* Toolbar Top */}
        <div
          className="flex flex-wrap items-center gap-1 p-1.5 border-b select-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: disabled ? "var(--primary-bg)" : "var(--accent)",
          }}
        >
          {/* Undo / Redo */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <Redo size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-0.5" />

          {/* Heading 1 / 2 */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("formatBlock", "<h1>")}
            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors font-bold text-xs"
            title="Heading 1"
          >
            <Heading1 size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors font-bold text-xs"
            title="Heading 2"
          >
            <Heading2 size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-0.5" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors italic"
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors underline"
            title="Underline (Ctrl+U)"
          >
            <Underline size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("strikeThrough")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors line-through"
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Rata Kiri"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Rata Tengah"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Rata Kanan"
          >
            <AlignRight size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("justifyFull")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Rata Kiri Kanan"
          >
            <AlignJustify size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Bullet List"
          >
            <List size={14} />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-0.5" />

          {/* Link */}
          <button
            type="button"
            disabled={disabled}
            onClick={addLink}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Tambah Link"
          >
            <LinkIcon size={14} />
          </button>

          {/* Clear Format */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("removeFormat")}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Hapus Format"
          >
            <RemoveFormatting size={14} />
          </button>

          {/* Lampirkan Dokumen (persis seperti gambar referensi pengguna) */}
          {allowAttachments && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-0.5" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 disabled:opacity-40 transition-colors cursor-pointer"
                title="Lampirkan Dokumen Pendukung (PDF, DOCX, XLSX, dsb.)"
              >
                <Paperclip size={14} className="text-purple-600 dark:text-purple-400" />
                <span>Lampirkan Dokumen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  const newAtts: AttachedDocument[] = Array.from(files).map((f) => ({
                    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    name: f.name,
                    size: (f.size / 1024).toFixed(1) + " KB",
                  }));
                  if (onAttachmentsChange) {
                    onAttachmentsChange([...attachments, ...newAtts]);
                  }
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>

        {/* List Dokumen Terlampir */}
        {allowAttachments && attachments.length > 0 && (
          <div className="px-3 py-2 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/40 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
              <Paperclip size={12} />
              <span>Berkas Terlampir ({attachments.length}):</span>
            </span>
            {attachments.map((att) => (
              <span
                key={att.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-medium text-[11px] shadow-2xs"
              >
                <FileText size={12} className="text-purple-500" />
                <span className="max-w-[160px] truncate" title={att.name}>{att.name}</span>
                {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                {!disabled && onAttachmentsChange && (
                  <button
                    type="button"
                    onClick={() => onAttachmentsChange(attachments.filter((a) => a.id !== att.id))}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                    title="Hapus berkas"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onBlur={handleInput}
          suppressContentEditableWarning
          className="rich-text-content p-3 text-sm focus:outline-none overflow-y-auto leading-relaxed"
          style={{
            minHeight,
            color: disabled ? "var(--text-muted)" : "var(--text)",
            cursor: disabled ? "not-allowed" : "text",
          }}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
