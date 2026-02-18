"use client";

import { useState, useEffect, useRef } from "react";
import { searchContacts, type Contact } from "@/app/actions/contacts";
import { Input } from "@/components/ui/input";
import { Mail, User } from "lucide-react";

interface ContactAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectContact?: (contact: Contact) => void;
  placeholder?: string;
  className?: string;
}

export default function ContactAutocomplete({
  value,
  onChange,
  onSelectContact,
  placeholder = "Enter email or name...",
  className = "",
}: ContactAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search contacts as user types
  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (value && value.length >= 2) {
        setIsSearching(true);
        const results = await searchContacts(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [value]);

  const handleSelectContact = (contact: Contact) => {
    onChange(contact.email);
    setShowSuggestions(false);
    if (onSelectContact) {
      onSelectContact(contact);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelectContact(contact)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {contact.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {contact.email}
                </div>
                {contact.job_title && (
                  <div className="text-xs text-gray-400 mt-0.5">{contact.job_title}</div>
                )}
              </div>
              {contact.usage_count > 0 && (
                <div className="flex-shrink-0 text-xs text-gray-400">
                  Used {contact.usage_count}x
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
