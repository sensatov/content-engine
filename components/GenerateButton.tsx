"use client";

type Props = {
  disabled: boolean;
  loading: boolean;
  missingRequirements: string[];
  onGenerate: () => void;
};

export function GenerateButton({
  disabled,
  loading,
  missingRequirements,
  onGenerate,
}: Props) {
  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || loading}
        className="w-full rounded py-3 font-medium text-white transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 enabled:bg-accent enabled:hover:opacity-90"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Analyzing data & generating topics…
          </span>
        ) : (
          "Generate topic ideas"
        )}
      </button>
      {disabled && missingRequirements.length > 0 && (
        <p className="mt-2 text-center text-sm text-optidge-text-muted">
          Add: {missingRequirements.join(", ")}
        </p>
      )}
    </div>
  );
}
