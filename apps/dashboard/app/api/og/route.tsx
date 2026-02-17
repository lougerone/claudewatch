import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#FAF7F2",
          padding: "0 80px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "32px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="#C15F3C"
              />
            </svg>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#7A736A",
                letterSpacing: "2px",
              }}
            >
              CLAUDEWATCH
            </span>
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#2C2C2C",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Track Every</span>
            <span style={{ color: "#C15F3C" }}>Token.</span>
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#7A736A",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            Token budget management for the modern vibecoder.
          </div>
        </div>

        {/* Decorative bars */}
        <div
          style={{
            position: "absolute",
            right: "60px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "flex-end",
            gap: "5px",
            opacity: 0.1,
          }}
        >
          {[120, 180, 90, 220, 150, 260, 200, 140, 280, 190, 240, 160, 300, 210].map(
            (h, i) => (
              <div
                key={i}
                style={{
                  width: "18px",
                  height: `${h}px`,
                  backgroundColor: "#C15F3C",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            )
          )}
        </div>

        {/* Corner */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#5B8A6F",
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#B0A99F", letterSpacing: "1px" }}>
            SELF-HOSTED
          </span>
        </div>

        <span style={{ position: "absolute", bottom: "24px", left: "80px", fontSize: "13px", color: "#B0A99F" }}>
          Open Source · MIT License
        </span>
        <span style={{ position: "absolute", bottom: "24px", right: "80px", fontSize: "13px", color: "#B0A99F" }}>
          github.com/lougerone/claudewatch
        </span>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #C15F3C 0%, #D4A574 50%, #5B8A6F 100%)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
