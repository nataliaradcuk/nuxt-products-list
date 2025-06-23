<script setup lang="ts">
import { ref, computed, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'
import type { DropdownMenuItem } from '@nuxt/ui'

const router = useRouter()
const toast = useToast()

const table = ref()

interface Category {
  id: number
  title: string
  parent?: { id: number, title: string } | null
}

interface CategoryRow {
  id: number
  title: string
  parentTitle: string
}

const { data: categoriesResponse, status } = await useFetch<{ data: Category[] }>(
    'http://localhost/api/blog/categories',
    { key: 'table-categories' }
)

const allCategories = computed<CategoryRow[]>(() =>
    categoriesResponse.value?.data.map(category => ({
      id: category.id,
      title: category.title,
      parentTitle: category.parent?.title ?? '—'
    })) ?? []
)

const columns: TableColumn<CategoryRow>[] = [
  { accessorKey: 'id', header: '#' },
  {
    accessorKey: 'title',
    header: 'Назва',
    cell: ({ row }) =>
        h(
            'a',
            {
              href: `http://localhost:3001/categories/${row.original.id}`,
              class: 'text-blue-600 hover:text-blue-800 underline'
            },
            row.original.title
        )
  },
  { accessorKey: 'parentTitle', header: 'Батьківська категорія' },
  {
    id: 'actions',
    header: 'Дії',
    cell: ({ row }) =>
        h(resolveComponent('UDropdownMenu'), {
          items: getDropdownItems(row.original),
          popper: { placement: 'bottom-end' }
        }, {
          default: () => h(resolveComponent('UButton'), {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            'aria-label': 'Actions'
          })
        })
  }

]
function getDropdownItems(category: CategoryRow): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Редагувати',
        icon: 'i-lucide-edit',
        onSelect: () => router.push(`/admin/blog/categories/${category.id}/edit`)
      }
    ],
    [
      {
        label: 'Видалити',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: async () => {
          const confirmed = confirm(`Видалити категорію «${category.title}»?`)
          if (!confirmed) return

          await $fetch(`/api/blog/categories/${category.id}`, { method: 'DELETE' })
          categoriesResponse.value!.data = categoriesResponse.value!.data.filter(
              c => c.id !== category.id
          )

          toast.add({ title: 'Категорію видалено', color: 'success' })
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
      <h1 class="text-3xl font-bold">Категорії</h1>
      <UButton
          as="a"
          href="/admin/blog/categories/create"
          color="primary"
          icon="i-heroicons-plus"
      >
        Додати категорію
      </UButton>
    </div>

    <UCard>
      <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="allCategories"
          :columns="columns"
          :loading="status === 'pending'"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          stripe
          row-key="id"
          class="w-full"
      />

      <div class="flex justify-center border-t border-default pt-4">
        <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </UCard>
  </div>
</template>
