<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const isPost = computed(
  () => !!frontmatter.value.date || !!frontmatter.value.author
);

const progress = ref(0);

function onScroll() {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  progress.value =
    scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0;
}

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", onScroll, { passive: true });
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", onScroll);
  }
});
</script>

<template>
  <div
    v-if="isPost"
    class="reading-progress"
    :style="{ width: progress + '%' }"
    aria-hidden="true"
    role="presentation"
  />
</template>
