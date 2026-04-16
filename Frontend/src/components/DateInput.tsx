import React, { useState, useEffect } from "react";

interface DateInputProps {
  value: string; // ISO format: yyyy-mm-dd or empty
  onChange: (isoDate: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

// Converts ISO (yyyy-mm-dd) to display (dd/mm/yyyy)
const isoToDisplay = (iso: string): string => {
  if (!iso) return "";
  const parts = iso.split("T")[0].split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Converts display (dd/mm/yyyy) to ISO (yyyy-mm-dd)
const displayToIso = (display: string): string => {
  const parts = display.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const DateInput: React.FC<DateInputProps> = ({ value, onChange, required, className, placeholder = "dd/mm/yyyy" }) => {
  const [display, setDisplay] = useState(isoToDisplay(value));

  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9/]/g, "");

    // Auto-insert slashes
    if (val.length === 2 && !val.includes("/")) val += "/";
    if (val.length === 5 && val.split("/").length === 2) val += "/";

    // Limit length
    if (val.length > 10) return;

    setDisplay(val);

    // If complete date, convert and emit
    if (val.length === 10) {
      const iso = displayToIso(val);
      if (iso) onChange(iso);
    } else if (val === "") {
      onChange("");
    }
  };

  return (
    <input
      type="text"
      value={display}
      onChange={handleChange}
      required={required}
      className={className}
      placeholder={placeholder}
      maxLength={10}
    />
  );
};

export default DateInput;
