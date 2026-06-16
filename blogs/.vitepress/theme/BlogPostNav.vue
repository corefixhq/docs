<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as posts } from "./posts.data.js";
import RelatedPosts from "./RelatedPosts.vue";

const { page, frontmatter } = useData();

const isPost = computed(
  () => !!frontmatter.value.date || !!frontmatter.value.author
);

const current = computed(() => {
  if (!isPost.value) return null;
  const url = "/" + page.value.relativePath.replace(/\.md$/, "");
  return posts.find((p) => p.url === url) ?? null;
});

const prev = computed(() => current.value?.prev ?? null);
const next = computed(() => current.value?.next ?? null);
</script>

<template>
  <div v-if="isPost">
    <!-- Prev / Next navigation -->
    <nav
      v-if="prev || next"
      class="post-nav"
      aria-label="Post navigation"
    >
      <a
        v-if="prev"
        :href="prev.url"
        class="post-nav-link post-nav-link--prev"
      >
        <span class="post-nav-dir">← Older post</span>
        <span class="post-nav-title">{{ prev.title }}</span>
      </a>
      <span v-else />

      <a
        v-if="next"
        :href="next.url"
        class="post-nav-link post-nav-link--next"
      >
        <span class="post-nav-dir">Newer post →</span>
        <span class="post-nav-title">{{ next.title }}</span>
      </a>
    </nav>

    <!-- Related articles -->
    <RelatedPosts />
  </div>
</template>
