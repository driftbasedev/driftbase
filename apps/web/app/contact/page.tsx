import type { Metadata } from "next";
import { company } from "@driftbase/brand";
import page from "@/components/Page.module.css";
import styles from "./contact.module.css";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Contact Driftbase for sales, support, security reports or press. We answer email within one business day.",
	alternates: { canonical: "/contact" },
};

const channels = [
	{
		label: "Sales and Scale plans",
		address: "sales@driftbase.dev",
		detail: "Volume pricing, private networking, security questionnaires. We reply the same day, Pacific time.",
	},
	{
		label: "Support",
		address: "support@driftbase.dev",
		detail: "Team and Scale customers get a ticket number back within minutes. Include your workspace ID.",
	},
	{
		label: "Security",
		address: "security@driftbase.dev",
		detail: "Report a vulnerability. Our PGP key and disclosure policy are at /.well-known/security.txt.",
	},
	{
		label: "Everything else",
		address: company.email,
		detail: "Press, partnerships, or just to tell us what you’re building.",
	},
];

export default function Contact() {
	return (
		<div className={page.narrow}>
			<p className={page.eyebrow}>Contact</p>
			<h1 className={page.title}>Talk to the people who wrote it.</h1>
			<p className={page.lede}>
				There is no ticket triage layer here. Whoever answers your email has commit access.
			</p>
			<ul className={styles.channels}>
				{channels.map((c) => (
					<li key={c.address}>
						<h2>{c.label}</h2>
						<a href={`mailto:${c.address}`}>{c.address}</a>
						<p>{c.detail}</p>
					</li>
				))}
			</ul>
			<div className={page.prose}>
				<h2>Office</h2>
				<p>
					Driftbase, Inc.
					<br />
					1120 NW Couch St, Suite 410
					<br />
					Portland, OR 97209
				</p>
				<p>
					Community questions are best asked on{" "}
					<a href={`${company.github}/drift/discussions`}>GitHub Discussions</a>, where the answer helps
					the next person too.
				</p>
			</div>
		</div>
	);
}
