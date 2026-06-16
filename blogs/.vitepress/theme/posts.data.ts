import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Author {
  name: string;
  avatar: string | null;
  role: string | null;
}

export interface Post {
  title: string;
  url: string;
  date: string;
  formattedDate: string;
  description: string;
  author: Author;
  tags: string[];
  category: string;
  cover: string | null;
  excerpt: string;
  readingTime: number;
  featured: boolean;
  prev: { title: string; url: string } | null;
  next: { title: string; url: string } | null;
}

declare const data: Post[];
export { data };

function resolveAuthor(raw: unknown): Author {
  if (typeof raw === "string") {
    return { name: raw, avatar: null, role: null };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, string>;
    return {
      name: o.name ?? "Corefix Team",
      avatar: o.avatar ?? null,
      role: o.role ?? null,
    };
  }
  return { name: "Corefix Team", avatar: null, role: null };
}

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function toExcerpt(body: string): string {
  return body
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export default {
  watch: ["./blogs/*.md"],

  load(): Post[] {
    const blogsDir = path.resolve(process.cwd(), "blogs");
    if (!fs.existsSync(blogsDir)) return [];

    const files = fs
      .readdirSync(blogsDir)
      .filter((f) => f.endsWith(".md") && f !== "index.md");

    const posts = files
      .map((filename) => {
        const raw = fs.readFileSync(path.join(blogsDir, filename), "utf-8");
        const { data: fm, content: body } = matter(raw);
        if (fm.draft) return null;

        const dateStr = fm.date ? String(fm.date) : "";

        return {
          title: String(fm.title ?? "Untitled"),
          url: `/${filename.replace(/\.md$/, "")}`,
          date: dateStr,
          formattedDate: dateStr ? formatDate(dateStr) : "",
          description: String(fm.description ?? ""),
          author: resolveAuthor(fm.author),
          tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
          category: String(fm.category ?? ""),
          cover: fm.cover ? String(fm.cover) : null,
          excerpt: toExcerpt(body),
          readingTime: fm.readingTime
            ? Number(fm.readingTime)
            : estimateReadingTime(body),
          featured: Boolean(fm.featured),
        };
      })
      .filter((p): p is Exclude<typeof p, null> => p !== null)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    return posts.map((post, i) => ({
      ...post,
      prev: posts[i + 1]
        ? { title: posts[i + 1].title, url: posts[i + 1].url }
        : null,
      next: posts[i - 1]
        ? { title: posts[i - 1].title, url: posts[i - 1].url }
        : null,
    }));
  },
};
