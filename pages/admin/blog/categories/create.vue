<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const schema = z.object({
  title: z.string().min(1, 'Введіть назву категорії'),
  parent: z.object({
    label: z.string(),
    value: z.number()
  }).nullable()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: '',
  parent: null
})

const parentOptions = ref<{ label: string; value: number }[]>([])

const fetchParents = async () => {
  const res = await $fetch(`${config.public.apiBase}/blog/categories`)
  parentOptions.value = res.data.map((cat: any) => ({
    label: cat.title,
    value: cat.id
  }))
}

onMounted(fetchParents)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await $fetch(`${config.public.apiBase}/blog/categories`, {
    method: 'POST',
    body: {
      title: event.data.title,
      parent_id: event.data.parent?.value ?? null
    }
  })

  toast.add({ title: 'Категорію створено', color: 'success' })
  router.push('/categories')
}
</script>

<template>
  <div class="max-w-xl mx-auto py-10 space-y-6">
    <h1 class="text-3xl font-bold">Створити категорію</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit" class="space-y-4">
      <UFormField name="title" label="Назва категорії">
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField name="parent" label="Батьківська категорія">
        <USelectMenu
            v-model="state.parent"
            :items="parentOptions"
            placeholder="Оберіть батьківську категорію"
            clearable
            class="w-full"
        />
      </UFormField>

      <UButton type="submit" label="Зберегти" />
    </UForm>
  </div>
</template>
