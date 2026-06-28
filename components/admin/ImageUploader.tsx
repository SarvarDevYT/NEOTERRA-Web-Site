"use client";

import { useState } from "react";
import { Upload, X, Link, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  /** The hidden input name that will be submitted with the form */
  name?: string;
  /** Current image value (URL or base64 string) */
  value?: string | null;
  /** Called when the image value changes */
  onChange?: (value: string | null) => void;
  /** Label shown above the uploader */
  label?: string;
}

type TabType = "file" | "url";

export function ImageUploader({ name = "imageUrl", value, onChange, label = "Rasm" }: ImageUploaderProps) {
  const isUrl = value?.startsWith("http://") || value?.startsWith("https://");
  const [activeTab, setActiveTab] = useState<TabType>(isUrl ? "url" : "file");
  const [urlInput, setUrlInput] = useState<string>(isUrl ? (value || "") : "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange?.(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange?.(url || null);
  };

  const clearImage = () => {
    setUrlInput("");
    onChange?.(null);
    // Reset file input
    const fileInput = document.querySelector(`input[data-uploader="${name}"]`) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    // When switching tabs, clear current value
    clearImage();
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
        {label}
      </label>

      {/* Hidden input — always present, carries the final value */}
      {value && (
        <input type="hidden" name={name} value={value} />
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => switchTab("file")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === "file"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Fayl yuklash
        </button>
        <button
          type="button"
          onClick={() => switchTab("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === "url"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Link className="h-3.5 w-3.5" />
          URL havola
        </button>
      </div>

      {/* ── FILE UPLOAD TAB ── */}
      {activeTab === "file" && (
        <div>
          {value && !value.startsWith("http") ? (
            /* Preview of uploaded file */
            <div className="relative rounded-2xl overflow-hidden border border-white/10 p-2">
              <img src={value} alt="Preview" className="w-full h-36 object-cover rounded-xl" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-4 right-4 p-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* File drop zone */
            <div className="relative group border border-white/10 border-dashed rounded-2xl hover:border-purple-500/50 transition-colors overflow-hidden">
              <input
                type="file"
                data-uploader={name}
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center py-6 text-zinc-500 group-hover:text-zinc-400 transition-colors pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="h-6 w-6 text-purple-500" />
                </div>
                <span className="text-sm font-semibold">Rasm tanlang</span>
                <span className="text-[11px] text-zinc-600 mt-1">PNG, JPG, WEBP — Max 1MB</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── URL TAB ── */}
      {activeTab === "url" && (
        <div className="space-y-3">
          <div className="relative">
            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="pl-10 border-white/10 h-12 bg-white/5 rounded-2xl text-white font-medium placeholder:text-zinc-700 focus-visible:ring-purple-500"
            />
            {urlInput && (
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-zinc-700 text-white rounded-full hover:bg-red-500 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* URL Preview */}
          {urlInput ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 p-2">
              <img
                src={urlInput}
                alt="URL Preview"
                className="w-full h-36 object-cover rounded-xl"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const errDiv = img.nextElementSibling as HTMLElement;
                  if (errDiv) errDiv.style.display = "flex";
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "block";
                  const errDiv = img.nextElementSibling as HTMLElement;
                  if (errDiv) errDiv.style.display = "none";
                }}
              />
              <div
                className="w-full h-36 rounded-xl bg-white/5 items-center justify-center text-zinc-500 text-xs font-medium gap-2 flex-col"
                style={{ display: "none" }}
              >
                <ImageIcon className="h-6 w-6 opacity-40" />
                <span>❌ Rasm yuklanmadi — URL noto'g'ri</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 flex items-center justify-center text-zinc-600 text-xs font-medium rounded-2xl bg-white/5 border border-white/5 gap-2">
              <ImageIcon className="h-5 w-5 opacity-40" />
              <span>URL kiriting — preview ko'rinadi</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
