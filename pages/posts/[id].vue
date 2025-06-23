<script setup lang="ts">
import { useRoute } from '#app'
import { ref, computed } from 'vue'

interface Blog {
  id: number
  title: string
  body?: string
  published_at: string | null
  user?: { name: string }
  category?: { title: string }
}

const route = useRoute()
const postId = route.params.id as string

const { data: postResponse, status } =
    await useFetch<{ data: Blog }>(`http://localhost/api/blog/posts/${postId}`, {
      key: `post-${postId}`
    })

const post = computed(() => postResponse.value?.data)
const publishedAt = computed(() =>
    post.value?.published_at
        ? new Date(post.value.published_at).toLocaleDateString('uk-UA')
        : 'Не опубліковано'
)
</script>

<template>
  <div class="container mx-auto p-4">
    <UButton
        as="NuxtLink"
        to="/BlogPostsUi"
        variant="outline"
        icon="i-heroicons-arrow-left"
        class="mb-4"
    >
      До всіх постів
    </UButton>

    <div v-if="status === 'pending'" class="text-center text-gray-500">
      Завантаження…
    </div>
    <div v-else-if="status === 'error'" class="text-red-500">
      Помилка при завантаженні поста
    </div>

    <UCard v-else-if="post" class="space-y-4">
      <h1 class="text-3xl font-bold">{{ post.title }}</h1>

      <div class="text-sm text-gray-500 flex flex-col gap-1">
        <span><b>Автор:</b> {{ post.user?.name ?? 'Невідомо' }}</span>
        <span><b>Категорія:</b> {{ post.category?.title ?? 'Без категорії' }}</span>
        <span><b>Опубліковано:</b> {{ publishedAt }}</span>
      </div>

      <p v-if="post.body" class="prose dark:prose-invert">
        {{ post.body }}
      </p>
    </UCard>
  </div>
</template>