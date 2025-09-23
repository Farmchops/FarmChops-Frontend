
import React, { useEffect, useRef, useState } from "react";

type DualRangeSliderProps = {
    min?: number;
    max?: number;
    step?: number;
    initialMin?: number;
    initialMax?: number;
    minGap?: number;
    currency?: string;
    onChange?: (values: { min: number; max: number }) => void;
};

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min = 0,
    max = 10000,
    step = 1,
    initialMin,
    initialMax,
    minGap = 100,
    currency = "₦",
    onChange,
}) => {
    const [minVal, setMinVal] = useState<number>(initialMin ?? min);
    const [maxVal, setMaxVal] = useState<number>(initialMax ?? max);
    const rangeRef = useRef<HTMLDivElement | null>(null);

    // Update the colored track between thumbs
    useEffect(() => {
        if (!rangeRef.current) return;
        const minPct = ((minVal - min) / (max - min)) * 100;
        const maxPct = ((maxVal - min) / (max - min)) * 100;
        rangeRef.current.style.background = `linear-gradient(to right, #E5E7EB ${minPct}%, #1D7B3C ${minPct}%, #1D7B3C ${maxPct}%, #E5E7EB ${maxPct}%)`;
    }, [minVal, maxVal, min, max]);

    // Notify parent of changes
    useEffect(() => {
        onChange?.({ min: minVal, max: maxVal });
    }, [minVal, maxVal, onChange]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value <= maxVal - minGap) {
            setMinVal(value);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= minVal + minGap) {
            setMaxVal(value);
        }
    };

    const minPct = ((minVal - min) / (max - min)) * 100;
    const maxPct = ((maxVal - min) / (max - min)) * 100;

    return (
        <div className="w-full">
            {/* CSS Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .dual-range input[type="range"] {
                        -webkit-appearance: none;
                        appearance: none;
                        background: transparent;
                        pointer-events: auto;
                        position: absolute;
                        top: 0;
                        width: 100%;
                        height: 40px;
                        outline: none;
                    }
                    
                    .dual-range input[type="range"]::-webkit-slider-track {
                        height: 6px;
                        background: transparent;
                    }
                    
                    .dual-range input[type="range"]::-moz-range-track {
                        height: 6px;
                        background: transparent;
                        border: none;
                    }
                    
                    .dual-range input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #fff;
                        border: 3px solid #1D7B3C;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .dual-range input[type="range"]::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #fff;
                        border: 3px solid #1D7B3C;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .dual-range .range-min {
                        z-index: 1;
                    }
                    
                    .dual-range .range-max {
                        z-index: 2;
                    }
                `
            }} />

            <div className="dual-range">
                <div className="relative h-10 mb-6">
                    {/* Background track */}
                    <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full">
                        <div ref={rangeRef} className="h-full rounded-full" />
                    </div>

                    {/* Min range input */}
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={minVal}
                        onChange={handleMinChange}
                        className="range-min"
                        aria-label="Minimum price"
                    />

                    {/* Max range input */}
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={maxVal}
                        onChange={handleMaxChange}
                        className="range-max"
                        aria-label="Maximum price"
                    />

                    {/* Value tooltips */}
                    <div
                        className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                        style={{
                            left: `${minPct}%`,
                            transform: "translateX(-50%)",
                            zIndex: 10
                        }}
                    >
                        {currency}{minVal.toLocaleString()}
                    </div>
                    <div
                        className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                        style={{
                            left: `${maxPct}%`,
                            transform: "translateX(-50%)",
                            zIndex: 10
                        }}
                    >
                        {currency}{maxVal.toLocaleString()}
                    </div>
                </div>

                {/* Display values */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>From: <span className="font-semibold text-gray-800">{currency}{minVal.toLocaleString()}</span></span>
                    <span>To: <span className="font-semibold text-green-700">{currency}{maxVal.toLocaleString()}</span></span>
                </div>
            </div>
        </div>
    );
};
