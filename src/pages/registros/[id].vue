<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-2xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-semibold text-center">
      Reserva número {{ route.params.id }}
    </h1>

    <div v-if="loading" class="text-center text-gray-500 py-8">
      Cargando reserva...
    </div>

    <Card v-else-if="reserva" class="p-6 shadow-md border border-border">
      <div class="space-y-3">
        <p>
          <strong>Huésped:</strong>
          {{ reserva.Huesped?.nombre }}
          (DNI: {{ reserva.Huesped?.dni }})
        </p>

        <p>
          <strong>Cuarto:</strong> #{{ reserva.Cuarto?.numero }}
        </p>

        <p>
          <strong>Piso:</strong> {{ reserva.Cuarto?.Piso?.numero }}
        </p>

        <p>
          <strong>Fecha de entrada:</strong> {{ reserva.fecha_entrada }}
        </p>

        <p>
          <strong>Fecha de salida:</strong> {{ reserva.fecha_salida }}
        </p>

        <p>
          <strong>Total: </strong>
          <span class="font-semibold">${{ reserva.total?.toFixed(2) }}</span>
        </p>

        <div v-if="reserva.Cuarto?.caracteristicas?.length">
          <strong>Características del cuarto:</strong>
          <ul class="list-disc pl-6">
            <li v-for="(c, i) in reserva.Cuarto.caracteristicas" :key="i">
              {{ formatCaracteristica(c) }}
            </li>
          </ul>
        </div>

        <p>
          <strong>Estado actual:</strong> {{ reserva.Cuarto?.estados }}
        </p>
      </div>
    </Card>

    <p v-else class="text-center text-gray-500">
      No se encontró la reserva solicitada.
    </p>

    <div class="text-center">
      <RouterLink to="/">
        <Button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition cursor-pointer">
          ← Volver al Dashboard
        </Button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReservaDetalle {
  id_reserva: number
  fecha_entrada: string | null
  fecha_salida: string | null
  total: number | null
  Huesped?: {
    nombre: string | null
    dni: string | null
  } | null
  Cuarto?: {
    numero: number | null
    caracteristicas: string[] | null
    estados: string | null
    Piso?: {
      numero: number | null
    } | null
  } | null
}

const route = useRoute()
const reserva = ref<ReservaDetalle | null>(null)
const loading = ref(true)

async function fetchReserva(id: string | string[]) {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('Reserva')
      .select(`
        id_reserva,
        fecha_entrada,
        fecha_salida,
        total,
        Huesped (nombre, dni),
        Cuarto (
          numero,
          caracteristicas,
          estados,
          Piso (numero)
        )
      `)
      .eq('id_reserva', id)
      .single()

    if (error) {
      console.error('❌ Error al cargar la reserva:', error.message)
      reserva.value = null
    } else {
      reserva.value = data
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err)
    reserva.value = null
  } finally {
    loading.value = false
  }
}

function formatCaracteristica(c: string): string {
  if (!c) return ''
  const texto = c.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

onMounted(() => {
  fetchReserva(route.params.id)
})

onBeforeRouteUpdate((to) => {
  fetchReserva(to.params.id)
})
</script>
