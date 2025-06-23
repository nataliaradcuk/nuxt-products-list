<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const schema = z.object({
  author: z.string().min(1, 'Введіть автора'),
  title: z.string().min(1, 'Введіть заголовок'),
  publication_date: z.string().min(1, 'Введіть дату публікації'),
  category: z.object({ label: z.string(), value: z.number() }).nullable()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  author: '',
  title: '',
  publication_date: '',
  category: null
})

const categoryOptions = ref<{ label: string; value: number }[]>([])

const fetchCategories = async () => {
  const res = await $fetch(`${config.public.apiBase}/blog/categories`)
  categoryOptions.value = res.data.map((cat: any) => ({
    label: cat.title,
    value: cat.id
  }))
}

onMounted(fetchCategories)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await $fetch(`${config.public.apiBase}/blog/posts`, {
    method: 'POST',
    body: {
      author: event.data.author,
      title: event.data.title,
      publication_date: event.data.publication_date,
      category_id: event.data.category?.value ?? null
    }
  })
  toast.add({ title: 'Пост створено', color: 'success' })
  router.push('/BlogPostsUi')
}
</script>
<template>
  <div class="max-w-xl mx-auto py-10 space-y-6">
    <h1 class="text-3xl font-bold">Створити новий пост</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit" class="space-y-4">
      <UFormField name="author" label="Автор">
        <UInput v-model="state.author" class="w-full" />
      </UFormField>

      <UFormField name="title" label="Заголовок">
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField name="publication_date" label="Дата публікації">
        <UInput v-model="state.publication_date" type="date" class="w-full" />
      </UFormField>

      <UFormField name="category" label="Категорія">
        <USelectMenu
            v-model="state.category"
            :items="categoryOptions"
            placeholder="Оберіть категорію"
            clearable
            class="w-full"
        />
      </UFormField>

      <UButton type="submit" label="Створити пост" />
    </UForm>
  </div>
</template>
