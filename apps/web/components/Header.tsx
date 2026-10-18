import Link from "next/link";
import { company } from "@driftbase/brand";
import { Logo } from "./Logo";
import styles from "./Header.module.css";

export function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					<Logo />
					<span>Driftbase</span>
				</Link>
				<nav className={styles.nav} aria-label="Main">
					<a href={company.docsUrl}>Docs</a>
					<Link href="/pricing">Pricing</Link>
					<Link href="/changelog">Changelog</Link>
					<Link href="/blog">Blog</Link>
					<Link href="/about">Company</Link>
					<a href={company.appUrl} className={styles.cta}>
						Sign in
					</a>
				</nav>
			</div>
		</header>
	);
}
