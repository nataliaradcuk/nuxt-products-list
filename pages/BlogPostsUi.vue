<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'
import type { DropdownMenuItem } from '@nuxt/ui'

const table = ref()

interface Blog {
  id: number
  title: string
  published_at: string | null
  user?: { name: string }
  category?: { title: string }
}

interface PostTableRow {
  id: number
  title: string
  author: string
  category: string
  publishedAt: string
}


const { data: postsResponse, status } = await useFetch<{ data: Blog[] }>('http://localhost/api/blog/posts', {
  key: 'table-posts'
})

const allPosts = computed<PostTableRow[]>(() =>
    postsResponse.value?.data.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.user?.name ?? 'Невідомо',
      category: post.category?.title ?? 'Без категорії',
      publishedAt: post.published_at
          ? new Date(post.published_at).toLocaleDateString('uk-UA')
          : 'Не опубліковано'
    })) ?? []
)
const router = useRouter()
const toast  = useToast()

const columns: TableColumn<PostTableRow>[] = [
  {
    accessorKey: 'id',
    header: '#'
  },
  {
    accessorKey: 'author',
    header: 'Автор'
  },
  {
    accessorKey: 'category',
    header: 'Категорія'
  },
  {
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }) =>
        h(
            'a',
            {
              href: `http://localhost:3001/posts/${row.original.id}`,
              class: 'text-blue-600 hover:text-blue-800 underline'
            },
            row.original.title
        )
  },
  {
    accessorKey: 'publishedAt',
    header: 'Дата публікації'
  },

  {
    id: 'actions',
    header: 'Дії',
    cell: ({ row }) =>
        h(
            resolveComponent('UDropdownMenu'),
            {
              items: getDropdownItems(row.original),
              popper: { placement: 'bottom-end' }
            },
            {
              default: () =>
                  h(resolveComponent('UButton'), {
                    icon: 'i-lucide-ellipsis-vertical',
                    color: 'neutral',
                    variant: 'ghost',
                    'aria-label': 'Actions'
                  })
            }
        )
  }

]
function getDropdownItems(post: PostTableRow): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Редагувати',
        icon: 'i-lucide-edit',
        onSelect: () => router.push(`/admin/blog/posts/${post.id}/edit`)
      }
    ],
    [
      {
        label: 'Видалити',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: async () => {
          const confirmed = confirm(`Видалити пост «${post.title}»?`)
          if (!confirmed) return

          await $fetch(`/api/blog/posts/${post.id}`, { method: 'DELETE' })
          postsResponse.value!.data = postsResponse.value!.data.filter(
              p => p.id !== post.id
          )

          toast.add({ title: 'Пост видалено', color: 'success' })
        }
      }
    ]
  ]
}


const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Блог пости</h1>
      <UButton
          as="a"
          href="/admin/blog/posts/create"
          color="primary"
          icon="i-heroicons-plus"
      >
        Додати пост
      </UButton>
    </div>

    <UCard>
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="allPosts"
          :columns="columns"
          :loading="status === 'pending'"
          :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
          stripe
          row-key="id"
          class="w-full"
      />

      <div class="flex justify-center border-t border-default pt-4">
        <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>

    </UCard>
  </div>
</template>