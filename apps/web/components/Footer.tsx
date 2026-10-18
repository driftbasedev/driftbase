import Link from "next/link";
import { company } from "@driftbase/brand";
import styles from "./Footer.module.css";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.cols}>
					<div>
						<h2 className={styles.heading}>Product</h2>
						<ul>
							<li>
								<Link href="/pricing">Pricing</Link>
							</li>
							<li>
								<Link href="/changelog">Changelog</Link>
							</li>
							<li>
								<a href={company.statusUrl}>Status</a>
							</li>
						</ul>
					</div>
					<div>
						<h2 className={styles.heading}>Developers</h2>
						<ul>
							<li>
								<a href={company.docsUrl}>Documentation</a>
							</li>
							<li>
								<a href={`${company.docsUrl}/install`}>Install the CLI</a>
							</li>
							<li>
								<a href={company.github}>GitHub</a>
							</li>
						</ul>
					</div>
					<div>
						<h2 className={styles.heading}>Company</h2>
						<ul>
							<li>
								<Link href="/about">About</Link>
							</li>
							<li>
								<Link href="/blog">Blog</Link>
							</li>
							<li>
								<Link href="/contact">Contact</Link>
							</li>
						</ul>
					</div>
				</div>
				<p className={styles.legal}>
					© {year} {company.legalName} · Portland, Oregon
				</p>
			</div>
		</footer>
	);
}
