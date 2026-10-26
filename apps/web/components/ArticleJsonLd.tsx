import { posts } from "@/app/blog/posts";

const base = "https://driftbase.dev";

export default function ArticleJsonLd({ slug, description }: { slug: string; description: string }) {
	const post = posts.find((p) => p.slug === slug);
	if (!post) return null;
	const url = `${base}/blog/${post.slug}`;
	const data = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		name: post.title,
		headline: post.title,
		description,
		url,
		mainEntityOfPage: url,
		datePublished: post.date,
		dateModified: post.date,
		author: { "@type": "Person", name: post.author },
		publisher: { "@type": "Organization", name: "Driftbase", url: base },
	};
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
		/>
	);
}
