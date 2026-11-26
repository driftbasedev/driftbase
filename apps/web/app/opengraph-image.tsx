import { ImageResponse } from "next/og";
import { colors, logoMark } from "@driftbase/brand";

export const alt = "Driftbase · Keep Postgres, search and cache in sync";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "72px 80px",
					background: colors.paper,
					color: colors.ink,
					borderBottom: `16px solid ${colors.tide}`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
					<svg width={64} height={64} viewBox={logoMark.viewBox} fill="none">
						<path d={logoMark.paths[0]} stroke={colors.tide} strokeWidth={3} strokeLinecap="round" />
						<path d={logoMark.paths[1]} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
						<circle cx={logoMark.dot.cx} cy={logoMark.dot.cy} r={logoMark.dot.r} fill={colors.kelp} />
					</svg>
					<span style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.01em" }}>Driftbase</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<span style={{ fontSize: 30, fontWeight: 600, color: colors.kelp, marginBottom: 20 }}>
						From Postgres to search. Always in sync.
					</span>
					<span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
						Keep Postgres, search and cache in sync
					</span>
				</div>
				<span style={{ fontSize: 28, color: colors.slate }}>driftbase.dev</span>
			</div>
		),
		size,
	);
}
