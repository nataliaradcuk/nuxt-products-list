<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <h1 class="font-bold text-2xl text-(--ui-primary)">
      Nuxt UI - Starter
    </h1>

    <div class="flex flex-col gap-6">
      <UButton
          label="Blog Posts Table"
          icon="i-lucide-file-text"
          to="/BlogPosts"
      />
      <UButton
          label="Blog Posts (UI Table)"
          icon="i-lucide-layout-list"
          color="primary"
          variant="outline"
          to="/BlogPostsUi"
      />
      <UButton
          label="Categories"
          icon="i-lucide-tags"
          color="primary"
          variant="outline"
          to="/CategoriesUi"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
</script>
