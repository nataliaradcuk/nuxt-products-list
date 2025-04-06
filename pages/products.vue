<template>
  <div>
    <h1>Список продуктів</h1>
    <ul>
      <li v-for="product in products" :key="product.id">{{ product.name }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const products = [
  { id: 1, name: 'Молоко' },
  { id: 2, name: 'Хліб' },
  { id: 3, name: 'Яблука' }
]
</script>
