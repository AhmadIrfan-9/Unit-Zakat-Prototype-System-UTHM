// src/components/profile/ProfileSalaryInput.tsx
"use client";

import { useState } from "react";

export default function ProfileSalaryInput({ initialSalary }: { initialSalary: number }) {
  const [salary, setSalary] = useState<string>(initialSalary.toFixed(2));

  const handleBlur = () => {
    const numericValue = parseFloat(salary);
    if (!isNaN(numericValue)) {
      setSalary(numericValue.toFixed(2)); // PENGUKUHAN STANDARD: Paksa format dua titik perpuluhan apabila hilang fokus
    } else {
      setSalary("0.00");
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-700">Gaji Semasa (RM)</label>
      <input
        type="text"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        onBlur={handleBlur}
        className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 font-mono"
      />
    </div>
  );
}
