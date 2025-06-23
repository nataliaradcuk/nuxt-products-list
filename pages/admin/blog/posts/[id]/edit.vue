<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter, useRoute } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const toast = useToast()

interface Category {
  id: number
  title: string
}

interface Post {
  author: string
  title: string
  published_at: string
  category?: { id: number }
}

const schema = z.object({
  author: z.string().min(1, 'Введіть автора'),
  title: z.string().min(1, 'Введіть заголовок'),
  published_at: z.string().min(1, 'Введіть дату публікації'),
  category: z.object({ label: z.string(), value: z.number() }).nullable()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  author: '',
  title: '',
  published_at: '',
  category: null
})

const categoryOptions = ref<{ label: string; value: number }[]>([])

const fetchCategories = async () => {
  const res = await $fetch<{ data: Category[] }>(`${config.public.apiBase}/blog/categories`)
  categoryOptions.value = res.data.map(cat => ({
    label: cat.title,
    value: cat.id
  }))
}

const fetchPost = async () => {
  const postId = Number(route.params.id)
  const post = await $fetch<Post>(`${config.public.apiBase}/blog/posts/${postId}`)

  if (!categoryOptions.value.length) {
    await fetchCategories()
  }

  state.author = post.author ?? ''
  state.title = post.title ?? ''
  state.published_at = post.published_at?.slice(0, 10) ?? '' // обрізаємо до yyyy-mm-dd
  state.category = categoryOptions.value.find(cat => cat.value === post.category?.id) ?? null
}

onMounted(async () => {
  await fetchCategories()
  await fetchPost()
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const postId = Number(route.params.id)
  await $fetch(`${config.public.apiBase}/blog/posts/${postId}`, {
    method: 'PUT',
    body: {
      author: event.data.author,
      title: event.data.title,
      published_at: event.data.published_at,
      category_id: event.data.category?.value ?? null
    }
  })

  toast.add({ title: 'Пост оновлено', color: 'success' })
  router.push('/BlogPostsUi')
}
</script>
\<template>
  <div class="max-w-xl mx-auto py-10 space-y-6">
    <h1 class="text-3xl font-bold">Редагувати пост</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit" class="space-y-4">
      <UFormField name="author" label="Автор">
        <UInput v-model="state.author" class="w-full" />
      </UFormField>

      <UFormField name="title" label="Заголовок">
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField name="published_at" label="Дата публікації">
        <UInput v-model="state.published_at" type="date" class="w-full" />
      </UFormField>

      <UFormField name="category" label="Категорія">
        <USelectMenu
            v-model="state.category"
            :items="categoryOptions.value"
            placeholder="Оберіть категорію"
            clearable
            class="w-full"
        />
      </UFormField>

      <UButton type="submit" label="Оновити пост" />
    </UForm>
  </div>
</template>
