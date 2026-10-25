import { company } from "@driftbase/brand";
import { posts } from "@/app/blog/posts";

export function ArticleJsonLd({ slug, description }: { slug: string; description?: string | null }) {
	const post = posts.find((p) => p.slug === slug);
	if (!post) return null;
	const url = `${company.webUrl}/blog/${post.slug}`;
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		name: post.title,
		headline: post.title,
		description: description ?? post.summary,
		url,
		mainEntityOfPage: url,
		datePublished: post.date,
		dateModified: post.date,
		author: { "@type": "Person", name: post.author },
		publisher: {
			"@type": "Organization",
			name: company.name,
			url: company.webUrl,
			logo: { "@type": "ImageObject", url: `${company.webUrl}/icon.svg` },
		},
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
