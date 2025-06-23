<script setup lang="ts">
import { ref, computed } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import { h } from 'vue'

interface Category {
  id: number
  title: string
  description?: string
}

const { data: categoriesResponse, status } = await useFetch<{ data: Category[] }>('http://localhost/api/blog/categories', {
  key: 'table-categories'
})

const allCategories = computed(() =>
    categoriesResponse.value?.data.map(category => ({
      id: category.id,
      title: category.title,
      description: category.description ?? 'Без опису',
    })) ?? []
)

const columns: TableColumn<Category>[] = [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'title', header: 'Назва' },
  { accessorKey: 'description', header: 'Опис' },
  {
    accessorKey: 'title',
    header: 'Дія',
    cell: ({ row }) =>
        h(
            'a',
            {
              href: `/admin/blog/categories/${row.original.id}/edit`,
              class: 'text-blue-600 hover:text-blue-800 underline',
            },
            'Редагувати'
        )
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Категорії блогу</h1>
      <a
          href="/admin/blog/categories/create"
          class="btn btn-primary"
      >
        Додати категорію
      </a>
    </div>

    <UTable
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
          :default-page="pagination.pageIndex + 1"
          :items-per-page="pagination.pageSize"
          :total="allCategories.length"
          @update:page="p => pagination.pageIndex = p - 1"
      />
    </div>
  </div>
</template>
