"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string) => void;
  placeholder?: string;
};

export default function PickupAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait until Google script loads
    const hasGoogle =
      typeof window !== "undefined" &&
      (window as any).google?.maps?.places?.Autocomplete;

    if (!hasGoogle) return;

    if (!inputRef.current || autoRef.current) return;

    autoRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      // Optional: restrict to Sri Lanka
      componentRestrictions: { country: "lk" },
      fields: ["formatted_address", "name"],
    });

    autoRef.current.addListener("place_changed", () => {
      const place = autoRef.current?.getPlace();
      const text =
        place?.formatted_address || place?.name || inputRef.current?.value || "";
      if (text) {
        onChange(text);
        onSelect?.(text);
      }
    });

    setReady(true);
  }, [onChange, onSelect]);

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Start typing a location..."}
        autoComplete="off"
      />
      {!ready && (
        <p className="text-xs text-muted-foreground">
          Loading location search...
        </p>
      )}
    </div>
  );
}
