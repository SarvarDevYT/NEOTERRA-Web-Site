"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagRoleInputProps {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
}

const SUGGESTED_ROLES = ["Owner", "Co-Owner", "Admin", "Tex.Admin", "Moderator", "Helper", "Sponsor", "Builder", "YouTuber", "Streamer"];

export function TagRoleInput({ name = "role", defaultValue = "", placeholder = "Lavozim yozing..." }: TagRoleInputProps) {
  const initialTags = defaultValue
    ? defaultValue.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputVal, setInputVal] = useState("");

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInputVal("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const roleColors: Record<string, string> = {
    Owner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Co-Owner": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Admin: "bg-red-500/20 text-red-400 border-red-500/30",
    "Tex.Admin": "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Moderator: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Helper: "bg-green-500/20 text-green-400 border-green-500/30",
    Sponsor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Builder: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    YouTuber: "bg-red-600/20 text-red-300 border-red-600/30",
    Streamer: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  };

  const getTagColor = (tag: string) =>
    roleColors[tag] || "bg-white/10 text-zinc-300 border-white/20";

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
        Lavozim(lar)
      </label>

      {/* Hidden input carries comma-separated value for form submission */}
      <input type="hidden" name={name} value={tags.join(", ")} />

      {/* Tag container + input */}
      <div className="min-h-12 border border-white/10 bg-white/5 rounded-2xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${getTagColor(tag)}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-60 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal) addTag(inputVal); }}
          placeholder={tags.length === 0 ? placeholder : "Yana qo'shish..."}
          className="flex-1 min-w-24 bg-transparent text-white font-bold text-sm outline-none placeholder:text-zinc-700"
        />
      </div>

      {/* Hint */}
      <p className="text-[10px] text-zinc-600 ml-1">
        Enter yoki vergul ( , ) bosib lavozim qo'shing. Bir nechta belgilash mumkin.
      </p>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_ROLES.filter((r) => !tags.includes(r)).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => addTag(role)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border opacity-60 hover:opacity-100 transition-opacity ${getTagColor(role)}`}
          >
            <Plus className="h-2.5 w-2.5" />
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}
