<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <h1 class="font-bold text-2xl text-(--ui-primary)">
      Nuxt UI - Starter
    </h1>

    <div class="flex items-center gap-2">
      <UButton
          label="Blog Posts Table"
          icon="i-lucide-table"
          to="/BlogPosts"
      />

      <UButton
          label="Blog Posts (UI Table)"
          icon="i-lucide-layout-grid"
          color="primary"
          variant="outline"
          to="/BlogPostsUi"
      />
    </div>
  </div>
</template>
