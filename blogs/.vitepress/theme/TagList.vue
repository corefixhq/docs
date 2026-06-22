<script setup lang="ts">
defineProps<{
  tags: string[];
  selected: string | null;
}>();

defineEmits<{
  select: [tag: string | null];
}>();
</script>

<template>
  <div class="tag-list" role="group" aria-label="Filter posts by tag">
    <button
      class="tag-list-btn"
      :class="{ active: !selected }"
      :aria-pressed="!selected"
      @click="$emit('select', null)"
    >
      All posts
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      class="tag-list-btn"
      :class="{ active: selected === tag }"
      :aria-pressed="selected === tag"
      @click="$emit('select', selected === tag ? null : tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
