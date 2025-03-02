import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  //determine the actual type for password fields
  const inputType = type === "password" && showPassword ? "text" : type;
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-b-8 focus:border-neutral-600 focus:outline-none transition-all duration-200 ease-in-out"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
