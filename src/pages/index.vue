<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <nav class="links">
      <RouterLink :to="{ name: '/ventas/' }" class="btn">
        Ir a ventas
      </RouterLink>

      <div class="buscador">
        <input v-model.number="ventaId" type="number" min="1" placeholder="Ingrese número de venta" class="input" />
        <RouterLink v-if="ventaId" :to="{ name: '/ventas/[id]', params: { id: ventaId } }" class="btn">
          Ir a la venta {{ ventaId }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const ventaId = ref<number | null>(null);
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.buscador {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.input {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  text-align: center;
  width: 220px;
}

.btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s;
  width: 220px;
  text-align: center;
}

.btn:hover {
  background-color: #2563eb;
}
</style>
