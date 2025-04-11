<script setup lang="ts">
import { h, resolveComponent, onMounted, computed, ref } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'

useHead({
  title: 'Список продуктів'
})

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const ULoading = resolveComponent('ULoading') // Для завантажувального індикатора

const toast = useToast()

type Product = {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

const data = ref<Product[]>([])
const loading = ref(true)
const progress = ref(0)
const progressInterval = ref<number | null>(null)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const rowsPerPageOptions = [5, 10, 20, 50]

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return data.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(data.value.length / rowsPerPage.value))
function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function updateRowsPerPage(newRowsPerPage: number | string) {
  rowsPerPage.value = Number(newRowsPerPage)
  currentPage.value = 1
}

async function fetchProducts() {
  loading.value = true
  progress.value = 0

  progressInterval.value = window.setInterval(() => {
    progress.value += Math.random() * 10
    if (progress.value >= 90) {
      progress.value = 90
      if (progressInterval.value !== null) {
        clearInterval(progressInterval.value)
      }
    }
  }, 200)

  try {
    const response = await fetch('https://dummyjson.com/products?limit=100')
    const result = await response.json()
    data.value = result.products

    progress.value = 100
    setTimeout(() => {
      loading.value = false
    }, 300)
  } catch (error) {
    console.error('Error fetching products:', error)
    toast.add({
      title: 'Помилка завантаження',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
    loading.value = false
  } finally {
    if (progressInterval.value !== null) {
      clearInterval(progressInterval.value)
    }
  }
}

onMounted(() => {
  fetchProducts()
})


const columns: TableColumn<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => h(UCheckbox, {
      'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'aria-label': 'Select all'
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
      'aria-label': 'Select row'
    }),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: 'Назва',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('title'))
  },
  {
    accessorKey: 'description',
    header: 'Опис',
    cell: ({ row }) => h('div', { class: 'max-w-md truncate' }, row.getValue('description'))
  },
  {
    accessorKey: 'price',
    header: 'Ціна',
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
      return h('div', { class: 'font-medium' }, formatted)
    }
  },
  {
    accessorKey: 'rating',
    header: 'Оцінка',
    cell: ({ row }) => {
      const rating = Number(row.getValue('rating'))
      const textColor = rating >= 4.5 ? 'text-green-500' : 'text-red-500'
      return h('div', { class: `font-medium ${textColor}` }, rating.toFixed(1))
    }
  },
  {
    accessorKey: 'brand',
    header: 'Бренд',
    cell: ({ row }) => h('div', {}, row.getValue('brand'))
  },
  {
    accessorKey: 'category',
    header: 'Категорія',
    cell: ({ row }) => h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'info' }, () => row.getValue('category'))
  },
  {
    accessorKey: 'thumbnail', // Фотографії
    header: 'Фото',
    cell: ({ row }) => h('img', {
      src: row.getValue('thumbnail'),
      alt: row.getValue('title'),
      class: 'w-24 h-24 object-cover rounded',
      style: 'width: 100px; height: 100px;'
    }),
    enableSorting: false
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const items = [
        { type: 'label', label: 'Дії' },
        {
          label: 'Копіювати ID',
          onSelect() {
            navigator.clipboard.writeText(row.original.id.toString())
            toast.add({
              title: 'ID скопійовано!',
              color: 'success',
              icon: 'i-lucide-circle-check'
            })
          }
        },
        {
          label: row.getIsExpanded() ? 'Згорнути' : 'Розгорнути',
          onSelect() {
            row.toggleExpanded()
          }
        },
        { type: 'separator' },
        { label: 'Переглянути деталі' },
        { label: 'Додати в кошик' }
      ]

      return h('div', { class: 'text-right' }, h(UDropdownMenu, {
        'content': { align: 'end' },
        items,
        'aria-label': 'Actions dropdown'
      }, () => h(UButton, {
        'icon': 'i-lucide-ellipsis-vertical',
        'color': 'neutral',
        'variant': 'ghost',
        'class': 'ml-auto',
        'aria-label': 'Actions dropdown'
      })))
    }
  }
]

const table = useTemplateRef('table')

function randomize() {
  data.value = [...data.value].sort(() => Math.random() - 0.5)
}

function reloadData() {
  fetchProducts()
}

const skeletonRows = Array(10).fill(0).map((_, i) => i)
</script>

<template>
  <div class="flex-1 divide-y divide-pink-200 w-full h-screen bg-pink-50 dark:bg-pink-100">
    <div v-if="loading" class="w-full h-1 bg-pink-200 dark:bg-pink-300 fixed top-0 left-0 z-50">
      <div class="h-1 bg-pink-500 transition-all duration-300 ease-out rounded-full" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="flex items-center gap-3 px-4 py-4 overflow-x-auto bg-pink-100 dark:bg-pink-200 shadow-sm rounded-b-xl">
      <UInput
          :model-value="(table?.tableApi?.getColumn('title')?.getFilterValue() as string)"
          class="max-w-sm min-w-[12ch] rounded-xl shadow"
          placeholder="🔍 Пошук за назвою..."
          @update:model-value="table?.tableApi?.getColumn('title')?.setFilterValue($event)"
      />
      <UButton color="pink" label="🎲 Випадково" @click="randomize" variant="soft" />
      <UButton color="pink" label="Оновити" icon="i-lucide-refresh-cw" @click="reloadData" variant="soft" />

      <select
          v-model="rowsPerPage"
          @change="updateRowsPerPage(($event.target as HTMLSelectElement).value)"
          class="border border-pink-300 text-pink-700 bg-pink-50 dark:bg-pink-100 rounded-xl px-3 py-1 text-sm shadow-sm focus:ring-pink-400"
      >
        <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
          {{ option }} рядків
        </option>
      </select>

      <UDropdownMenu
          :items="table?.tableApi?.getAllColumns().filter(column => column.getCanHide()).map(column => ({
          label: upperFirst(column.id),
          type: 'checkbox' as const,
          checked: column.getIsVisible(),
          onUpdateChecked(checked: boolean) {
            table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
          },
          onSelect(e?: Event) {
            e?.preventDefault()
          }
        }))"
          :content="{ align: 'end' }"
      >
        <UButton
            label="Колонки"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            class="ml-auto"
            aria-label="Columns select dropdown"
        />
      </UDropdownMenu>
    </div>

    <div v-if="loading" class="relative w-full h-full">
      <div class="absolute inset-0 flex flex-col items-center justify-center bg-pink-50 dark:bg-pink-100 bg-opacity-90 dark:bg-opacity-90 z-10">
        <ULoading size="lg" class="mb-4 text-pink-500" />
        <p class="text-sm text-pink-700 dark:text-pink-800 font-medium">Завантаження даних про продукти...</p>
        <p class="text-xs text-pink-600 dark:text-pink-700 mt-1 italic">{{ Math.round(progress) }}% завершено</p>
      </div>
      <table class="w-full table-auto">
        <thead>
        <tr class="border-b border-pink-200 dark:border-pink-300">
          <th class="p-3 text-left" colspan="9">
            <div class="flex justify-between">
              <div class="h-5 w-5 bg-pink-200 dark:bg-pink-300 rounded-full"></div>
              <div class="h-5 w-24 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-24 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-32 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-16 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-16 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-20 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-24 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
              <div class="h-5 w-24 bg-pink-200 dark:bg-pink-300 rounded-lg"></div>
            </div>
          </th>
        </tr>

        </thead>
        <tbody>
        <tr v-for="index in skeletonRows" :key="index" class="border-b border-pink-200 dark:border-pink-300">
          <td class="p-3">
            <div class="h-5 w-5 bg-pink-100 dark:bg-pink-200 rounded-full"></div>
          </td>
          <td class="p-3">
            <div class="h-24 w-24 bg-pink-100 dark:bg-pink-200 rounded-xl shadow-sm"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-32 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-48 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-16 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-10 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-24 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-24 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
          <td class="p-3">
            <div class="h-5 w-24 bg-pink-100 dark:bg-pink-200 rounded-lg"></div>
          </td>
        </tr>
        </tbody>

      </table>
    </div>

    <UTable
        v-else
        ref="table"
        :data="paginatedData"
        :columns="columns"
        sticky
        class="h-full"
    >
      <template #expanded="{ row }">
        <div class="p-4 bg-pink-50 dark:bg-pink-100 rounded-2xl shadow-md transition-all">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex space-x-3 overflow-x-auto">
              <img
                  v-for="(image, idx) in row.original.images.slice(0, 3)"
                  :key="idx"
                  :src="image"
                  :alt="`${row.original.title} - image ${idx + 1}`"
                  class="w-32 h-32 object-cover rounded-xl border-2 border-pink-200 shadow-sm"
              />
            </div>
            <div>
              <h3 class="text-xl font-bold text-pink-700">{{ row.original.title }}</h3>
              <p class="text-sm text-pink-600 dark:text-pink-700 mt-1 italic">{{ row.original.description }}</p>
              <div class="mt-3 flex flex-wrap gap-3">
                <div class="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm shadow">
                  💖 <span class="font-medium">Знижка:</span> {{ row.original.discountPercentage }}%
                </div>
                <div
                    :class="[
              'px-3 py-1 rounded-full text-sm shadow',
              row.original.stock > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            ]"
                >
                  📦 <span class="font-medium">Залишок:</span> {{ row.original.stock }} шт.
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTable>

    <div class="flex justify-between items-center px-4 py-3 bg-pink-50 dark:bg-pink-100 rounded-b-xl shadow-inner">
  <span class="text-sm text-pink-700 dark:text-pink-800 font-medium">
    📄 Сторінка {{ currentPage }} з {{ totalPages }}
  </span>
      <div class="flex items-center gap-2">
        <UButton
            :disabled="currentPage === 1"
            color="pink"
            variant="soft"
            icon="lucide:chevron-left"
            label="Попередня"
            @click="changePage(currentPage - 1)"
        />
        <UButton
            :disabled="currentPage === totalPages"
            color="pink"
            variant="soft"
            icon="lucide:chevron-right"
            iconRight
            label="Наступна"
            @click="changePage(currentPage + 1)"
        />
      </div>
    </div>

    <div class="px-4 py-3.5 text-sm text-pink-600 dark:text-pink-700 italic">
      💗 {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} з
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} рядків вибрано.
    </div>

  </div>
</template>