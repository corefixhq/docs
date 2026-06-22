<script setup lang="ts">
import type { Post } from "./posts.data.js";

defineProps<{
  post: Post;
  size?: "default" | "large";
}>();
</script>

<template>
  <a
    :href="post.url"
    class="blog-card"
    :class="{ 'blog-card--large': size === 'large' }"
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

    <div class="blog-card-body">
      <span v-if="post.category" class="blog-card-badge">
        {{ post.category }}
      </span>

      <h2 class="blog-card-title">{{ post.title }}</h2>

      <p
        v-if="post.description || post.excerpt"
        class="blog-card-desc"
      >
        {{ post.description || post.excerpt }}
      </p>

      <div class="blog-card-foot">
        <time v-if="post.formattedDate" :datetime="post.date">
          {{ post.formattedDate }}
        </time>
        <span v-if="post.formattedDate && post.readingTime" class="blog-card-dot">·</span>
        <span v-if="post.readingTime">{{ post.readingTime }} min read</span>
        <svg
          class="blog-card-arrow"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  </a>
</template>
