<script setup lang="ts">
import type { Post } from "./posts.data.js";

const props = defineProps<{
  post: Post;
  size?: "default" | "large";
}>();

function truncate(text: string, max = 120): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
</script>

<template>
  <article class="blog-card" :class="{ 'blog-card--large': size === 'large' }">
    <a
      :href="post.url"
      class="blog-card-cover-link"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="blog-card-cover">
        <img
          v-if="post.cover"
          :src="post.cover"
          :alt="post.title"
          loading="lazy"
        />
        <div v-else class="blog-card-placeholder" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </div>
    </a>

    <div class="blog-card-body">
      <p v-if="post.category" class="blog-card-category">
        {{ post.category }}
      </p>

      <h2 class="blog-card-title">
        <a :href="post.url">{{ post.title }}</a>
      </h2>

      <p
        v-if="post.description || post.excerpt"
        class="blog-card-desc"
      >
        {{ truncate(post.description || post.excerpt) }}
      </p>

      <div class="blog-card-foot">
        <time v-if="post.formattedDate" :datetime="post.date">
          {{ post.formattedDate }}
        </time>
        <span v-if="post.formattedDate && post.readingTime" class="blog-card-dot">·</span>
        <span v-if="post.readingTime">{{ post.readingTime }} min read</span>
      </div>
    </div>
  </article>
</template>
