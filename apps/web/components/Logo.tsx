import { logoMark } from "@driftbase/brand";

export function Logo({ size = 28 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox={logoMark.viewBox}
			fill="none"
			role="img"
			aria-label="Driftbase"
		>
			<path d={logoMark.paths[0]} stroke="var(--db-tide)" strokeWidth={3} strokeLinecap="round" />
			<path d={logoMark.paths[1]} stroke="var(--db-ink)" strokeWidth={3} strokeLinecap="round" />
			<circle cx={logoMark.dot.cx} cy={logoMark.dot.cy} r={logoMark.dot.r} fill="var(--db-kelp)" />
		</svg>
	);
}
