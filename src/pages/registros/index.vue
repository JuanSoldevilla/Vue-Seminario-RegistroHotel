<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col items-center text-center space-y-4">
      <h1 class="text-2xl font-semibold">Reservas del Hotel</h1>
      <Router-link to="/">
        <Button class="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition cursor-pointer">
          Ir al Dashboard
        </Button>
      </Router-link>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-8">
      Cargando reservas...
    </div>

    <div v-else-if="reservas.length === 0" class="text-center text-gray-500 py-8">
      No hay reservas registradas.
    </div>

    <div v-else class="overflow-x-auto">
      <Table class="table-fixed w-full border-1">
        <TableHeader class="bg-blue-600 hover:bg-blue-700">
          <TableRow>
            <TableHead class="text-white w-16 text-center">N°</TableHead>
            <TableHead class="text-white w-50 text-center">Huésped</TableHead>
            <TableHead class="text-white w-40 text-center">DNI</TableHead>
            <TableHead class="text-white w-20 text-center">Cuarto</TableHead>
            <TableHead class="text-white w-20 text-center">Piso</TableHead>
            <TableHead class="text-white w-30 text-center">Entrada</TableHead>
            <TableHead class="text-white w-30 text-center">Salida</TableHead>
            <TableHead class="text-white w-30 text-center">Total</TableHead>
            <TableHead class="text-white w-50 text-center">Funciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="(reserva, index) in reservas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)"
            :key="reserva.id_reserva" class="hover:bg-muted/50 transition-colors border-t">
            <!-- Mostrar número de fila, no id -->
            <TableCell class="font-medium text-center">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </TableCell>

            <TableCell class="truncate text-center">{{ reserva.Huesped?.nombre }}</TableCell>
            <TableCell class="truncate text-center">{{ reserva.Huesped?.dni }}</TableCell>
            <TableCell class="truncate text-center">#{{ reserva.Cuarto?.numero }}</TableCell>
            <TableCell class="truncate text-center">Piso #{{ reserva.Cuarto?.Piso?.numero }}</TableCell>
            <TableCell class="truncate text-center">{{ reserva.fecha_entrada }}</TableCell>
            <TableCell class="truncate text-center">{{ reserva.fecha_salida }}</TableCell>

            <TableCell class="font-semibold truncate text-center">
              ${{ reserva.total.toFixed(2) }}
            </TableCell>

            <TableCell class="text-center">
              <Button variant="destructive" class="m-2 cursor-pointer">
                <Icon icon="tdesign:delete-filled"></Icon>
              </Button>
              <Button variant="secondary" class="m-2 cursor-pointer">
                <Icon icon="oui:document-edit"></Icon>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Paginación -->
    <Pagination v-model:page="currentPage" :items-per-page="itemsPerPage" :total="reservas.length">
      <PaginationContent>
        <PaginationPrevious class="cursor-pointer" :disabled="currentPage === 1" />

        <template v-for="p in totalPages" :key="p">
          <PaginationItem class="cursor-pointer" :value="p" :is-active="p === currentPage">
            {{ p }}
          </PaginationItem>
        </template>

        <PaginationNext class="cursor-pointer" :disabled="currentPage === totalPages" />
      </PaginationContent>
    </Pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

interface Reserva {
  id_reserva: number
  fecha_entrada: string
  fecha_salida: string
  total: number
  Huesped?: { nombre: string; dni: string }
  Cuarto?: { numero: number; Piso?: { numero: number } }
}

const reservas = ref<Reserva[]>([])
const loading = ref(true)
const itemsPerPage = 10
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(reservas.value.length / itemsPerPage))

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('Reserva')
      .select(`
        id_reserva, fecha_entrada, fecha_salida, total,
        Huesped ( nombre, dni ),
        Cuarto ( numero, Piso ( numero ) )
      `).order('id_reserva', { ascending: false })

    if (error) {
      console.error('❌ Error al cargar reservas:', error.message)
    } else {
      reservas.value = (data ?? []) as Reserva[]
    }
  } catch (err) {
    console.error('⚠️ Error inesperado:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped></style>
