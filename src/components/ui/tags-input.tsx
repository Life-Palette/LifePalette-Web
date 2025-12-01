import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// 预定义的标签列表
const PREDEFINED_TAGS = [
  "旅行",
  "美食",
  "生活",
  "推荐",
  "摄影",
  "风景",
  "城市",
  "日常",
  "记录",
  "分享",
];

interface TagsInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TagsInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "添加标签（用空格或逗号分隔）",
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 从 value 字符串解析标签
  useEffect(() => {
    if (value) {
      const parsedTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      setTags(parsedTags);
    } else {
      setTags([]);
    }
  }, [value]);

  // 更新父组件的值
  const updateValue = useCallback(
    (newTags: string[]) => {
      onChange(newTags.join(", "));
    },
    [onChange],
  );

  // 添加标签
  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        const newTags = [...tags, trimmedTag];
        setTags(newTags);
        updateValue(newTags);
      }
      setInputValue("");
      setShowSuggestions(false);
    },
    [tags, updateValue],
  );

  // 删除标签
  const removeTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      updateValue(newTags);
    },
    [tags, updateValue],
  );

  // 处理输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 显示建议
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // 删除最后一个标签
      removeTag(tags[tags.length - 1]);
    }
  };

  // 获取匹配的建议标签
  const suggestions = PREDEFINED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag) &&
      inputValue.trim() !== "",
  );

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 rounded-md">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 rounded-sm hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="h-7 flex-1 border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* 建议列表 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
