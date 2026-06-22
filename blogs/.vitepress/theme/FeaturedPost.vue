<script setup lang="ts">
import type { Post } from "./posts.data.js";

defineProps<{ post: Post }>();
</script>

<template>
  <div class="fp-section">
    <p class="fp-eyebrow">Featured Article</p>
    <a :href="post.url" class="fp-card">
      <!-- Cover image — left column -->
      <div class="fp-cover">
        <img
          v-if="post.cover"
          :src="post.cover"
          :alt="post.title"
          loading="eager"
        />
        <div v-else class="fp-cover-placeholder" aria-hidden="true" />
      </div>

      <!-- Content — right column -->
      <div class="fp-body">
        <p v-if="post.category" class="fp-category">{{ post.category }}</p>
        <h2 class="fp-title">{{ post.title }}</h2>
        <p v-if="post.description" class="fp-desc">{{ post.description }}</p>
        <div class="fp-footer">
          <div class="fp-meta">
            <time v-if="post.formattedDate" :datetime="post.date">
              {{ post.formattedDate }}
            </time>
            <template v-if="post.formattedDate && post.readingTime">
              <span class="fp-sep">·</span>
            </template>
            <span v-if="post.readingTime">{{ post.readingTime }} min read</span>
          </div>
          <span class="fp-read-link">Read Article →</span>
        </div>
      </div>
    </a>
  </div>
</template>
