<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as posts } from "./posts.data.js";

const { page, frontmatter } = useData();

const isPost = computed(
  () => !!frontmatter.value.date || !!frontmatter.value.author
);

const post = computed(() => {
  if (!isPost.value) return null;
  const url = "/" + page.value.relativePath.replace(/\.md$/, "");
  return posts.find((p) => p.url === url) ?? null;
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
  <div v-if="isPost && post" class="post-meta">
    <!-- Cover image — full width, no border-radius -->
    <div v-if="post.cover" class="post-meta-cover">
      <img :src="post.cover" :alt="post.title" />
    </div>

    <header class="post-meta-header">
      <!-- Category + reading time row -->
      <div class="post-meta-top">
        <span v-if="post.category" class="post-meta-category">
          {{ post.category }}
        </span>
        <span class="post-meta-readtime">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {{ post.readingTime }} min read
        </span>
      </div>

      <!-- Title -->
      <h1 class="post-meta-title">{{ post.title }}</h1>

      <!-- Description (italic stand-first) -->
      <p v-if="post.description" class="post-meta-desc">
        {{ post.description }}
      </p>

      <!-- Author byline -->
      <div class="post-meta-byline">
        <div class="post-meta-author-wrap">
          <img
            v-if="post.author.avatar"
            :src="post.author.avatar"
            :alt="post.author.name"
            class="post-meta-avatar"
          />
          <span
            v-else
            class="post-meta-avatar post-meta-avatar--initials"
            aria-hidden="true"
          >
            {{ initials(post.author.name) }}
          </span>
          <div class="post-meta-author-info">
            <span class="post-meta-author-name">{{ post.author.name }}</span>
            <span v-if="post.author.role" class="post-meta-author-role">
              {{ post.author.role }}
            </span>
          </div>
        </div>
        <template v-if="post.formattedDate">
          <span class="post-meta-divider" aria-hidden="true">·</span>
          <time :datetime="post.date" class="post-meta-date">
            {{ post.formattedDate }}
          </time>
        </template>
      </div>

      <!-- Tags -->
      <div v-if="post.tags.length > 0" class="post-meta-tags">
        <span v-for="tag in post.tags" :key="tag" class="post-meta-tag">
          {{ tag }}
        </span>
      </div>
    </header>
  </div>
</template>
