<script setup lang="ts">
import { ref, computed } from "vue";
import { data as posts } from "./posts.data.js";
import type { Post } from "./posts.data.js";
import CategoryFilter from "./CategoryFilter.vue";
import BlogCard from "./BlogCard.vue";

const selectedCategory = ref<string | null>(null);

const allCategories = computed<string[]>(() =>
  [...new Set(posts.map((p) => p.category).filter(Boolean))].sort()
);

const filtered = computed<Post[]>(() =>
  selectedCategory.value
    ? posts.filter((p) => p.category === selectedCategory.value)
    : posts
);
</script>

<template>
  <section class="blog-grid-section" id="articles">
    <div class="blog-grid-inner">
      <div class="blog-grid-header">
        <h2 class="blog-grid-heading">Latest Research</h2>
        <CategoryFilter
          v-if="allCategories.length > 0"
          :categories="allCategories"
          :selected="selectedCategory"
          @select="selectedCategory = $event"
        />
      </div>

      <div v-if="filtered.length > 0" class="blog-grid">
        <BlogCard
          v-for="post in filtered"
          :key="post.url"
          :post="post"
        />
      </div>

      <div v-else class="blog-empty">
        <p>No articles in <strong>{{ selectedCategory }}</strong> yet.</p>
        <button class="cat-btn active" @click="selectedCategory = null">
          View all posts
        </button>
      </div>
    </div>
  </section>
</template>
