<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6 bg-slate-100 min-h-screen print:bg-white">

    <!-- Título + botones -->
    <div class="flex items-center justify-between gap-4 print:hidden">
      <h1 class="text-black text-2xl font-semibold">
        Boleta de reserva N° {{ route.params.id }}
      </h1>

      <div class="flex gap-3">
        <Button
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md cursor-pointer"
          @click="printBoleta"
        >
          🖨 Imprimir boleta
        </Button>

        <RouterLink to="/registros">
          <Button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition cursor-pointer">
            ← Volver a reservas
          </Button>
        </RouterLink>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-8">
      Cargando reserva...
    </div>

    <!-- BOLETA -->
    <Card
      v-else-if="reserva"
      class="text-black p-6 shadow-lg border border-gray-300 bg-white mx-auto print:shadow-none print:border-black print:text-black"
    >
      <!-- Encabezado de la boleta -->
      <div class="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
        <div>
          <h2 class="text-xl font-bold">Hospedaje El Descanso</h2>
          <p class="text-sm">Jr. Ayacucho 123 – Ayacucho</p>
          <p class="text-sm">RUC: 12345678901</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">BOLETA DE RESERVA</p>
          <p class="text-sm">N° {{ route.params.id }}</p>
          <p class="text-xs mt-2">Fecha de emisión: {{ fechaEmision }}</p>
        </div>
      </div>

      <!-- Datos del huésped -->
      <div class="space-y-1 text-sm mb-4">
        <p>
          <span class="font-semibold">Huésped:</span>
          {{ reserva.Huesped?.nombre || "-" }}
        </p>
        <p>
          <span class="font-semibold">DNI:</span>
          {{ reserva.Huesped?.dni || "-" }}
        </p>
        <p>
          <span class="font-semibold">Habitación:</span>
          #{{ reserva.Cuarto?.numero || "-" }} – Piso {{ reserva.Cuarto?.Piso?.numero || "-" }}
        </p>
        <p>
          <span class="font-semibold">Fecha de entrada:</span>
          {{ reserva.fecha_entrada || "-" }}
        </p>
        <p>
          <span class="font-semibold">Fecha de salida:</span>
          {{ reserva.fecha_salida || "-" }}
        </p>
        <p>
          <span class="font-semibold">Noches:</span>
          {{ noches || "-" }}
        </p>
      </div>

      <!-- Detalle del alojamiento -->
      <div class="mt-4">
        <h3 class="text-sm font-semibold mb-1">Detalle de alojamiento</h3>
        <table class="w-full text-sm border-t border-b border-gray-300">
          <thead>
            <tr>
              <th class="text-left py-2 px-2">Descripción</th>
              <th class="text-center py-2 px-2">Cantidad de días</th>
              <th class="text-right py-2 px-2">Precio unit.</th>
              <th class="text-right py-2 px-2">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 px-2">
                Alojamiento habitación #{{ reserva.Cuarto?.numero || "-" }}
              </td>
              <td class="text-center py-2 px-2">
                {{ noches }}
              </td>
              <td class="text-right py-2 px-2">
                S/ {{ precioNoche.toFixed(2) }}
              </td>
              <td class="text-right py-2 px-2">
                S/ {{ (reserva.total ?? 0).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detalle de productos / consumos -->
      <div v-if="detallesAgrupados.length" class="mt-6">
        <h3 class="text-sm font-semibold mb-1">Consumos (productos)</h3>
        <table class="w-full text-sm border-t border-b border-gray-300">
          <thead>
            <tr>
              <th class="text-left py-2 px-2">Producto</th>
              <th class="text-center py-2 px-2">Cantidad</th>
              <th class="text-right py-2 px-2">Precio unit.</th>
              <th class="text-right py-2 px-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detalle in detallesAgrupados" :key="detalle.nombre">
              <td class="py-2 px-2">
                {{ detalle.nombre }}
              </td>
              <td class="text-center py-2 px-2">
                {{ detalle.cantidad }}
              </td>
              <td class="text-right py-2 px-2">
                S/ {{ detalle.precio_unitario.toFixed(2) }}
              </td>
              <td class="text-right py-2 px-2">
                S/ {{ detalle.subtotal.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Características del cuarto (opcional) -->
      <div v-if="reserva.Cuarto?.caracteristicas?.length" class="mt-4 text-sm">
        <p class="font-semibold mb-1">Características de la habitación:</p>
        <ul class="list-disc pl-6">
          <li v-for="(c, i) in reserva.Cuarto.caracteristicas" :key="i">
            {{ formatCaracteristica(c) }}
          </li>
        </ul>
      </div>

      <!-- Totales -->
      <div class="mt-6 flex justify-end">
        <div class="text-right text-sm">
          <p>Alojamiento: S/ {{ (reserva.total ?? 0).toFixed(2) }}</p>
          <p v-if="detallesAgrupados.length">
            Consumos: S/ {{ consumoTotal.toFixed(2) }}
          </p>
          <p class="mt-1">IGV (incluido)</p>
          <p class="text-lg font-bold mt-1">
            TOTAL: S/ {{ totalGeneral.toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Pie de boleta -->
      <div class="mt-8 text-center text-xs text-gray-500">
        <p>Gracias por su preferencia.</p>
        <p>Este documento es una representación de la reserva.</p>
      </div>
    </Card>

    <p v-else class="text-center text-gray-500">
      No se encontró la reserva solicitada.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReservaCabecera {
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

interface DetalleProducto {
  id_detalle: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  Producto?: {
    nombre: string | null
  } | null
}

interface DetalleAgrupado {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

const route = useRoute()
const reserva = ref<ReservaCabecera | null>(null)
const detalles = ref<DetalleProducto[]>([])
const loading = ref(true)

const fechaEmision = new Date().toLocaleString('es-PE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

const noches = computed(() => {
  if (!reserva.value?.fecha_entrada || !reserva.value?.fecha_salida) return 0
  const entrada = new Date(reserva.value.fecha_entrada)
  const salida = new Date(reserva.value.fecha_salida)
  const diff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)
  return diff > 0 ? diff : 0
})

const precioNoche = computed(() => {
  if (!reserva.value?.total || noches.value === 0) return 0
  return Number((reserva.value.total / noches.value).toFixed(2))
})

/**
 * Agrupar detalles por producto (nombre)
 * Si hay varias líneas de "Cerveza", se suman cantidades y subtotales.
 */
const detallesAgrupados = computed<DetalleAgrupado[]>(() => {
  const mapa = new Map<string, DetalleAgrupado>()

  for (const d of detalles.value) {
    const nombre = d.Producto?.nombre ?? 'Producto'
    const precio = Number(d.precio_unitario ?? 0)
    const subtotal = Number(d.subtotal ?? 0)
    const cantidad = Number(d.cantidad ?? 0)

    if (!mapa.has(nombre)) {
      mapa.set(nombre, {
        nombre,
        cantidad,
        precio_unitario: precio,
        subtotal
      })
    } else {
      const existente = mapa.get(nombre)!
      existente.cantidad += cantidad
      existente.subtotal += subtotal
      // El precio_unitario lo dejamos igual (suponemos que es el mismo)
    }
  }

  return Array.from(mapa.values())
})

const consumoTotal = computed(() =>
  detallesAgrupados.value.reduce((acc, d) => acc + Number(d.subtotal ?? 0), 0)
)

const totalGeneral = computed(() =>
  (reserva.value?.total ?? 0) + consumoTotal.value
)

async function fetchReserva(idParam: string | string[]) {
  loading.value = true
  try {
    const id = Array.isArray(idParam) ? idParam[0] : idParam

    // Cabecera de reserva
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
      detalles.value = []
    } else {
      reserva.value = data as ReservaCabecera
      await fetchDetallesReserva(id)
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err)
    reserva.value = null
    detalles.value = []
  } finally {
    loading.value = false
  }
}

async function fetchDetallesReserva(id: string) {
  const { data, error } = await supabase
    .from('ReservaDetalle')
    .select(`
      id_detalle,
      cantidad,
      precio_unitario,
      subtotal,
      Producto (nombre)
    `)
    .eq('reserva_id', id)

  if (error) {
    console.error('❌ Error al cargar detalles de reserva:', error.message)
    detalles.value = []
    return
  }

  detalles.value = (data ?? []).map((d) => ({
    id_detalle: d.id_detalle,
    cantidad: d.cantidad ?? 0,
    precio_unitario: Number(d.precio_unitario ?? 0),
    subtotal: Number(d.subtotal ?? 0),
    Producto: d.Producto ?? null
  }))
}

function formatCaracteristica(c: string): string {
  if (!c) return ''
  const texto = c.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

function printBoleta() {
  window.print()
}

onMounted(() => {
  fetchReserva(route.params.id)
})

onBeforeRouteUpdate((to) => {
  fetchReserva(to.params.id)
})
</script>
