import type { PalettePreviewProps } from "./PalettePreview.types"

export function PalettePreview({ paletteName, colors }: PalettePreviewProps) {
  const gradientId = `palette-preview-gradient-${paletteName}`

  return (
    <div
      style={{
        backgroundColor: colors.background,
        borderRadius: "6px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {/* Mini card */}
      <div
        style={{
          backgroundColor: colors.panelBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: "4px",
          padding: "6px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              height: "4px",
              width: "60px",
              backgroundColor: colors.text,
              borderRadius: "2px",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              height: "3px",
              width: "40px",
              backgroundColor: colors.mutedText,
              borderRadius: "2px",
              opacity: 0.6,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {[38, 28, 34].map((w, i) => (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: "3px" }}
            >
              <div
                style={{
                  height: "3px",
                  width: `${w}px`,
                  backgroundColor: colors.mutedText,
                  borderRadius: "2px",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  height: "5px",
                  width: `${w}px`,
                  backgroundColor: i === 1 ? colors.accent : colors.text,
                  borderRadius: "2px",
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mini table */}
      <div
        style={{
          backgroundColor: colors.panelBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "4px 8px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {[72, 44, 36].map((w, i) => (
            <div
              key={i}
              style={{
                height: "3px",
                width: `${w}px`,
                backgroundColor: colors.mutedText,
                borderRadius: "2px",
                opacity: 0.5,
                alignSelf: "center",
              }}
            />
          ))}
        </div>
        {[0, 1].map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              gap: "12px",
              padding: "4px 8px",
              borderBottom: row < 1 ? `1px solid ${colors.border}` : undefined,
            }}
          >
            {[72, 44, 36].map((w, i) => (
              <div
                key={i}
                style={{
                  height: "3px",
                  width: `${w}px`,
                  backgroundColor:
                    i === 1 ? colors.accent : colors.text,
                  borderRadius: "2px",
                  opacity: i === 1 ? 0.85 : 0.7,
                  alignSelf: "center",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mini chart */}
      <div
        style={{
          backgroundColor: colors.panelBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: "4px",
          padding: "4px 6px",
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="32"
          viewBox="0 0 200 32"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 24 C20 22 35 12 60 14 C85 16 100 8 130 10 C160 12 175 5 200 7"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
          />
          <path
            d="M0 24 C20 22 35 12 60 14 C85 16 100 8 130 10 C160 12 175 5 200 7 L200 32 L0 32 Z"
            fill={`url(#${gradientId})`}
          />
        </svg>
      </div>
    </div>
  )
}
