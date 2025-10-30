<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <h1>Reserva número {{ route.params.id }}</h1>

    <div v-if="loading" class="loading">Cargando reserva...</div>

    <div v-else-if="reserva" class="reserva-detalle">
      <p><strong>Huésped:</strong> {{ reserva.Huesped?.nombre }} (DNI: {{ reserva.Huesped?.dni }})</p>
      <p><strong>Cuarto:</strong> #{{ reserva.Cuarto?.numero }}</p>
      <p><strong>Piso:</strong> {{ reserva.Cuarto?.Piso?.numero }}</p>
      <p><strong>Fecha de entrada:</strong> {{ reserva.fecha_entrada }}</p>
      <p><strong>Fecha de salida:</strong> {{ reserva.fecha_salida }}</p>
      <p><strong>Total:</strong> ${{ reserva.total?.toFixed(2) }}</p>

      <div v-if="reserva.Cuarto?.caracteristicas?.length">
        <p><strong>Características del cuarto:</strong></p>
        <ul>
          <li v-for="(c, i) in reserva.Cuarto.caracteristicas" :key="i">{{ c }}</li>
        </ul>
      </div>

      <p><strong>Estado actual:</strong> {{ reserva.Cuarto?.estados }}</p>
    </div>

    <p v-else class="no-reserva">No se encontró la reserva solicitada.</p>

    <RouterLink to="/" class="btn">← Volver al Dashboard</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

interface ReservaDetalle {
  id_reserva: number
  fecha_entrada: string
  fecha_salida: string
  total: number
  Huesped?: {
    nombre: string
    dni: string
  }
  Cuarto?: {
    numero: number
    caracteristicas: string[]
    estados: string
    Piso?: {
      numero: number
    }
  }
}

const route = useRoute()
const reserva = ref<ReservaDetalle | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id
  try {
    const { data, error } = await supabase
      .from('Reserva')
      .select(`id_reserva, fecha_entrada, fecha_salida, total, Huesped(nombre, dni), Cuarto (numero, caracteristicas, estados, Piso (numero))`)
      .eq('id_reserva', id)
      .single()

    if (error) {
      console.error('❌ Error al cargar la reserva:', error.message)
    } else {
      reserva.value = data
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err)
  } finally {
    loading.value = false
  }
})
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
  text-align: center;
}

.reserva-detalle p {
  margin: 0.4rem 0;
  line-height: 1.5;
}

ul {
  padding-left: 1.2rem;
}

.loading,
.no-reserva {
  color: #666;
  margin: 1rem 0;
  text-align: center;
}

.btn {
  display: inline-block;
  margin-top: 1.5rem;
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
