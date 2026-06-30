import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useValidateReviewTokenQuery, useSubmitReviewMutation } from "../redux/api/reviewsApi";

const EMOJIS: { label: string; emoji: string; value: number }[] = [
    { value: 1, emoji: "😞", label: "Terrible" },
    { value: 2, emoji: "😕", label: "Bad" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "😊", label: "Good" },
    { value: 5, emoji: "🤩", label: "Amazing" },
];

function getErrorMessage(error: any): string {
    const status = error?.status;
    const message: string = error?.data?.message ?? "";

    if (status === 404) return "This review link is invalid.";
    if (message.toLowerCase().includes("already submitted")) return "You've already left a review for this order.";
    if (message.toLowerCase().includes("expired")) return "This review link has expired.";
    return message || "Something went wrong. Please try again.";
}

export default function Review() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const ratingParam = Number(searchParams.get("rating")) || 0;

    const [rating, setRating] = useState<number>(
        ratingParam >= 1 && ratingParam <= 5 ? ratingParam : 0
    );
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const { data, error: validateError, isLoading } = useValidateReviewTokenQuery(token, {
        skip: !token,
    });

    const [submitReview, { isLoading: isSubmitting, error: submitError }] = useSubmitReviewMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) return;
        try {
            await submitReview({ token, rating, comment: comment.trim() || undefined }).unwrap();
            setSubmitted(true);
        } catch {}
    };

    if (!token) {
        return <PageShell><ErrorCard message="This review link is invalid." /></PageShell>;
    }

    if (isLoading) {
        return (
            <PageShell>
                <div className="flex justify-center items-center py-16">
                    <div className="w-8 h-8 border-4 border-[#1D7B3C] border-t-transparent rounded-full animate-spin" />
                </div>
            </PageShell>
        );
    }

    if (validateError) {
        return <PageShell><ErrorCard message={getErrorMessage(validateError)} /></PageShell>;
    }

    if (submitted) {
        return (
            <PageShell>
                <div className="text-center py-10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h2>
                    <p className="text-gray-500">Your review helps us serve you better.</p>
                </div>
            </PageShell>
        );
    }

    const { orderNumber, customerName } = data!.data;

    return (
        <PageShell>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Hi {customerName}, how was your order?
            </h2>
            <p className="text-[#1D7B3C] font-semibold mb-8">{orderNumber}</p>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-4 mb-8">
                    {EMOJIS.map(({ value, emoji, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                rating === value
                                    ? "border-[#1D7B3C] bg-green-50 scale-110"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <span className="text-4xl">{emoji}</span>
                            <span className="text-xs text-gray-500">{label}</span>
                        </button>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    rows={4}
                    className="w-full border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-lg px-4 py-3 outline-none resize-none text-sm text-gray-700 placeholder:text-gray-400 mb-4"
                />

                {submitError && (
                    <p className="text-red-500 text-sm mb-4 text-center">{getErrorMessage(submitError)}</p>
                )}

                <button
                    type="submit"
                    disabled={!rating || isSubmitting}
                    className="w-full bg-[#1D7B3C] text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        "Submit Review"
                    )}
                </button>
            </form>
        </PageShell>
    );
}

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <div className="flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="FarmChops" className="h-8" onError={(e) => (e.currentTarget.style.display = "none")} />
                    <span className="text-[#1D7B3C] font-bold text-lg">FarmChops</span>
                </div>
                {children}
            </div>
        </div>
    );
}

function ErrorCard({ message }: { message: string }) {
    return (
        <div className="text-center py-8">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-gray-700 font-medium">{message}</p>
        </div>
    );
}
