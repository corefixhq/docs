<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as posts } from "./posts.data.js";
import type { Post } from "./posts.data.js";

const { page, frontmatter } = useData();

const isPost = computed(
  () => !!frontmatter.value.date || !!frontmatter.value.author
);

const related = computed<Post[]>(() => {
  if (!isPost.value) return [];
  const url = "/" + page.value.relativePath.replace(/\.md$/, "");
  const current = posts.find((p) => p.url === url);
  if (!current || posts.length < 2) return [];

  return posts
    .filter((p) => p.url !== url)
    .map((p) => ({
      ...p,
      _score:
        p.tags.filter((t) => current.tags.includes(t)).length * 2 +
        (p.category === current.category ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b._score - a._score ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 3);
});

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
</script>

<template>
  <div v-if="related.length > 0" class="related-posts">
    <h2 class="related-posts-title">Related articles</h2>
    <div class="related-posts-grid">
      <a
        v-for="post in related"
        :key="post.url"
        :href="post.url"
        class="related-card"
      >
        <div class="related-card-cover">
          <img
            v-if="post.cover"
            :src="post.cover"
            :alt="post.title"
            loading="lazy"
          />
          <div v-else class="related-card-placeholder" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
          </div>
        </div>
        <div class="related-card-body">
          <span
            v-if="post.category"
            class="blog-tag blog-tag--category related-card-cat"
          >
            {{ post.category }}
          </span>
          <h3 class="related-card-title">{{ post.title }}</h3>
          <div class="related-card-meta">
            <img
              v-if="post.author.avatar"
              :src="post.author.avatar"
              :alt="post.author.name"
              class="related-card-avatar"
            />
            <span
              v-else
              class="related-card-avatar related-card-avatar--initials"
              aria-hidden="true"
            >
              {{ initials(post.author.name) }}
            </span>
            <span class="related-card-author">{{ post.author.name }}</span>
            <span class="related-card-sep">·</span>
            <time :datetime="post.date">{{ post.formattedDate }}</time>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
