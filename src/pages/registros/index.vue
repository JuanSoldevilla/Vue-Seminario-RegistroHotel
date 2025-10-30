<template>
  <div>
    <div class="dashboard">
      <h1>Reservas del Hotel</h1>
      <RouterLink to="/" class="btn">Ir al Dashboard</RouterLink>
    </div>

    <div v-if="loading">Cargando reservas...</div>
    <div v-else-if="reservas.length === 0">No hay reservas registradas.</div>

    <ul v-else>
      <li v-for="reserva in reservas" :key="reserva.id_reserva">
        <strong>ID:</strong> {{ reserva.id_reserva }} |
        <strong>Huésped:</strong> {{ reserva.Huesped?.nombre }} (DNI: {{ reserva.Huesped?.dni }}) |
        <strong>Cuarto:</strong> #{{ reserva.Cuarto?.numero }} (Piso {{ reserva.Cuarto?.Piso?.numero }}) |
        <strong>Entrada:</strong> {{ reserva.fecha_entrada }} |
        <strong>Salida:</strong> {{ reserva.fecha_salida }} |
        <strong>Total:</strong> ${{ reserva.total.toFixed(2) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

interface Reserva {
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
    Piso?: {
      numero: number
    }
  }
}

const reservas = ref<Reserva[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('Reserva')
      .select(`
        id_reserva,
        fecha_entrada,
        fecha_salida,
        total,
        Huesped (
          nombre,
          dni
        ),
        Cuarto (
          numero,
          Piso (
            numero
          )
        )
      `)
      .order('id_reserva', { ascending: true })

    if (error) {
      console.error('❌ Error al cargar reservas:', error.message)
    } else {
      reservas.value = data ?? []
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err)
  } finally {
    loading.value = false
  }
})
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

ul {
  margin-top: 1rem;
  padding: 0;
  list-style-type: none;
}

li {
  margin-bottom: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 0.95rem;
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
