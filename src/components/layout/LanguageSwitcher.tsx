"use client";

import React from "react";

export default function LanguageSwitcher() {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    // Implement your locale switching logic here (e.g., using next-intl router)
  };

  return (
    <select onChange={handleChange} className="bg-transparent border rounded px-2 py-1">
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="gu">ગુજરાતી</option>
    </select>
  );
}