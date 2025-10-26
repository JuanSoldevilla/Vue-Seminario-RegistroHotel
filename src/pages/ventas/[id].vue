<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <h1>Venta número {{ route.params.id }}</h1>

    <div v-if="loading" class="loading">Cargando venta...</div>

    <div v-else-if="venta" class="venta-detalle">
      <p><strong>Cliente:</strong> {{ venta.cliente }}</p>
      <p><strong>Productos:</strong> {{ venta.productos.join(', ') }}</p>
      <p><strong>Fecha:</strong> {{ venta.fecha }}</p>
      <p v-if="venta.mascota"><strong>Mascota:</strong> {{ venta.mascota }}</p>
      <p v-if="venta.pago"><strong>Pago:</strong> {{ venta.pago }}</p>
      <p v-if="venta.total !== undefined"><strong>Total:</strong> ${{ venta.total.toFixed(2) }}</p>
      <p v-if="venta.comentarios"><strong>Comentarios:</strong> {{ venta.comentarios }}</p>
    </div>

    <p v-else class="no-venta">No se encontró la venta solicitada.</p>

    <RouterLink to="/" class="btn">← Ir al dashboard</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';

const route = useRoute();
const venta = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  const id = route.params.id;
  try {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) console.error('❌ Error al cargar la venta:', error.message);
    else venta.value = data;
  } catch (err) {
    console.error('⚠️ Error inesperado:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 1.5rem;
}

.venta-detalle p {
  margin: 0.4rem 0;
  line-height: 1.5;
}

.loading,
.no-venta {
  color: #666;
  margin: 1rem 0;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #2563eb;
}
</style>
