import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@driftbase/brand";
import page from "@/components/Page.module.css";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
	title: "Pricing",
	description:
		"Driftbase pricing: Free up to 1M change events a month, Team at $149/month for 25M events, and Scale for high-volume pipelines with an SLA.",
	alternates: { canonical: "/pricing" },
};

const plans = [
	{
		name: "Free",
		price: "$0",
		per: "forever",
		blurb: "For side projects and for proving it works on your schema.",
		features: [
			"1,000,000 change events / month",
			"1 source database",
			"Up to 3 sinks",
			"24-hour replay window",
			"Community support on GitHub Discussions",
		],
		cta: "Start free",
		href: company.appUrl,
	},
	{
		name: "Team",
		price: "$149",
		per: "per month",
		blurb: "For production apps where stale search results cost you tickets.",
		features: [
			"25,000,000 change events / month",
			"$4 per additional million",
			"3 source databases",
			"Unlimited sinks",
			"7-day replay window",
			"Lag and slot-size alerts to Slack and PagerDuty",
			"Email support, next business day",
		],
		cta: "Start a 14-day trial",
		href: company.appUrl,
		featured: true,
	},
	{
		name: "Scale",
		price: "From $899",
		per: "per month",
		blurb: "For high-volume pipelines and teams with compliance requirements.",
		features: [
			"250,000,000 change events / month",
			"Unlimited sources and sinks",
			"30-day replay window",
			"Private networking (AWS PrivateLink, GCP PSC)",
			"SSO, audit log, SOC 2 Type II report",
			"99.95% uptime SLA, 1-hour response",
		],
		cta: "Talk to us",
		href: "/contact",
	},
];

const faqs = [
	{
		q: "What counts as a change event?",
		a: "One committed row change read from the write-ahead log: an insert, an update or a delete. A transaction that touches 40 rows is 40 events. Fanning one change out to three sinks is still one event.",
	},
	{
		q: "Is the CLI free if I run it myself?",
		a: "Yes. The drift CLI is Apache-2.0 and runs anywhere. Self-hosted pipelines only count against your plan if you connect them to the hosted control plane for monitoring and alerts.",
	},
	{
		q: "What happens if I go over my Free limit?",
		a: "Nothing breaks. We pause delivery to sinks and keep your replication slot position, and you get an email at 80% and 100%. Upgrade or wait for the next month and delivery resumes from where it stopped.",
	},
	{
		q: "Do you offer discounts?",
		a: "Startups under $5M raised and open-source projects get Team free for the first year. Write to us from your company address.",
	},
];

export default function Pricing() {
	return (
		<div className={page.wrap}>
			<p className={page.eyebrow}>Pricing</p>
			<h1 className={page.title}>Pay for the changes you sync, not the rows you store.</h1>
			<p className={page.lede}>
				Every plan includes the full CLI, every sink and backfills that don’t count against your quota.
			</p>

			<div className={styles.plans}>
				{plans.map((p) => (
					<section key={p.name} className={p.featured ? `${styles.plan} ${styles.featured}` : styles.plan}>
						<h2 className={styles.name}>{p.name}</h2>
						<p className={styles.price}>
							{p.price} <span>{p.per}</span>
						</p>
						<p className={styles.blurb}>{p.blurb}</p>
						<ul className={styles.features}>
							{p.features.map((f) => (
								<li key={f}>{f}</li>
							))}
						</ul>
						{p.href.startsWith("/") ? (
							<Link className={styles.cta} href={p.href}>
								{p.cta}
							</Link>
						) : (
							<a className={styles.cta} href={p.href}>
								{p.cta}
							</a>
						)}
					</section>
				))}
			</div>

			<p className={styles.note}>
				Backfills, retries and replays are free. For exactly how events are metered and what happens at
				each limit, see <a href="https://docs.driftbase.dev/limits">plan limits and metering</a>.
			</p>

			<section className={styles.faq}>
				<h2>Questions</h2>
				{faqs.map((f) => (
					<div key={f.q}>
						<h3>{f.q}</h3>
						<p>{f.a}</p>
					</div>
				))}
			</section>
		</div>
	);
}
