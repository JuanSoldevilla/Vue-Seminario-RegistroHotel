<template>
  <div>
    <div class="dashboard">
      <h1>Ventas</h1>
      <RouterLink to="/" class="btn">Ir al dashboard</RouterLink>
    </div>
    <div v-if="loading">Cargando ventas...</div>
    <div v-else-if="ventas.length === 0">No hay ventas registradas.</div>

    <ul v-else>
      <li v-for="venta in ventas" :key="venta.id">
        {{ venta.id }} | <strong>Cliente:</strong> {{ venta.cliente }} | <strong>Productos:</strong> {{ venta.productos.join(', ') }} | <strong>Fecha:</strong> {{ venta.fecha }}
      </li>
    </ul>
  </div>
</template>


<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient';
import { ref, onMounted } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ventas = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data, error } = await supabase.from('ventas').select('*');

    if (error) {
      console.error('❌ Error al cargar ventas:', error.message);
    } else {
      ventas.value = data ?? [];
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err);
  } finally {
    loading.value = false;
  }
});
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

ul {
  margin-top: 1rem;
  padding: 0;
}

li {
  margin-bottom: 0.3rem;
  padding: 0.3rem 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
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
