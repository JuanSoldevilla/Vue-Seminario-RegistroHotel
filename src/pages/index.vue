<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-col items-center p-8 space-y-8">
    <h1 class="text-3xl font-semibold">Dashboard</h1>

    <nav class="flex flex-col items-center gap-6">

      <RouterLink to="/registros">
        <Button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition cursor-pointer">
          Ir a reservas
        </Button>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'

</script>
