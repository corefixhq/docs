<script setup lang="ts">
defineProps<{
  categories: string[];
  selected: string | null;
}>();

defineEmits<{
  select: [category: string | null];
}>();
</script>

<template>
  <div class="cat-filter" role="group" aria-label="Filter by category">
    <button
      class="cat-btn"
      :class="{ active: !selected }"
      :aria-pressed="!selected"
      @click="$emit('select', null)"
    >
      All Posts
    </button>
    <button
      v-for="category in categories"
      :key="category"
      class="cat-btn"
      :class="{ active: selected === category }"
      :aria-pressed="selected === category"
      @click="$emit('select', selected === category ? null : category)"
    >
      {{ category }}
    </button>
  </div>
</template>
