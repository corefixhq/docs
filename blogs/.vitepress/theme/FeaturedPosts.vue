<script setup lang="ts">
import type { Post } from "./posts.data.js";
import BlogCard from "./BlogCard.vue";

defineProps<{ posts: Post[] }>();
</script>

<template>
  <div v-if="posts.length > 0" class="featured-posts">
    <div class="featured-posts-header">
      <h2 class="featured-posts-heading">
        <span class="featured-posts-icon" aria-hidden="true">★</span>
        Editor's picks
      </h2>
    </div>
    <div class="featured-posts-grid">
      <BlogCard
        v-for="post in posts.slice(0, 2)"
        :key="post.url"
        :post="post"
        size="large"
      />
    </div>
  </div>
</template>
