import React, { useState } from 'react';
import { Tag, Loader2 } from 'lucide-react';

interface CouponInputProps {
  onApply: (code: string) => void;
  isLoading?: boolean;
  currentCode?: string;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  onApply,
  isLoading = false,
  currentCode = ''
}) => {
  const [code, setCode] = useState(currentCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          disabled={isLoading}
          maxLength={12}
          className="w-full py-2 pl-10 pr-3 border border-gray-300 focus:border-green-600 rounded-md outline-none placeholder:text-sm disabled:bg-gray-100 uppercase"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Applying...</span>
          </>
        ) : (
          <span>Apply</span>
        )}
      </button>
    </form>
  );
};
