import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { colors, logoMark } from "@driftbase/brand";

export const dynamic = "force-static";

// Roboto is the first freely licensed face in the site's --db-font-sans stack.
const fontDir = path.join(process.cwd(), "assets/fonts");

export async function GET() {
	const [regular, bold] = await Promise.all([
		readFile(path.join(fontDir, "Roboto-Regular.ttf")),
		readFile(path.join(fontDir, "Roboto-Bold.ttf")),
	]);
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
					fontFamily: "Roboto",
					color: colors.ink,
					borderBottom: `16px solid ${colors.tide}`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
					<svg width={72} height={72} viewBox={logoMark.viewBox} fill="none">
						<path d={logoMark.paths[0]} stroke={colors.tide} strokeWidth={3} strokeLinecap="round" />
						<path d={logoMark.paths[1]} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
						<circle cx={logoMark.dot.cx} cy={logoMark.dot.cy} r={logoMark.dot.r} fill={colors.kelp} />
					</svg>
					<span style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.01em" }}>Driftbase</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					<span style={{ fontSize: 30, fontWeight: 700, color: colors.tide }}>
						Change data capture for application teams
					</span>
					<span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
						Keep Postgres, search and cache in sync
					</span>
				</div>
				<span style={{ fontSize: 28, color: colors.slate }}>driftbase.dev</span>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{ name: "Roboto", data: regular, weight: 400, style: "normal" },
				{ name: "Roboto", data: bold, weight: 700, style: "normal" },
			],
		},
	);
}
