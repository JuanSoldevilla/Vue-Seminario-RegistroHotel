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

    <div class="flex justify-end mb-4">
      <Button class="bg-green-600 hover:bg-green-700 text-white cursor-pointer" @click="openForm()">
        + Agregar Reserva
      </Button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-8">
      Cargando reservas...
    </div>

    <div v-else-if="reservas.length === 0" class="text-center text-gray-500 py-8">
      No hay reservas registradas.
    </div>

    <div v-else class="overflow-x-auto">
      <Table class="table-fixed w-full">
        <TableHeader class="bg-blue-600 hover:bg-blue-700">
          <TableRow>
            <TableHead class="text-white text-center w-20">N°</TableHead>
            <TableHead class="text-white text-center w-80">Huésped</TableHead>
            <TableHead class="text-white text-center">DNI</TableHead>
            <TableHead class="text-white text-center">Piso - Cuarto</TableHead>
            <TableHead class="text-white text-center">Entrada</TableHead>
            <TableHead class="text-white text-center">Salida</TableHead>
            <TableHead class="text-white text-center">Total</TableHead>
            <TableHead class="text-white text-center">Estado</TableHead>
            <TableHead class="text-white text-center w-80">Funciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(reserva, index) in reservasPaginated" :key="reserva.id_reserva"
            class="hover:bg-muted/50 border-t">
            <TableCell class="text-center">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </TableCell>
            <TableCell class="text-center">
              {{ reserva.Huesped?.nombre }}
            </TableCell>
            <TableCell class="text-center">
              {{ reserva.Huesped?.dni }}
            </TableCell>
            <TableCell class="text-center">
              Piso #{{ reserva.Cuarto?.Piso?.numero }}
              Cuarto #{{ reserva.Cuarto?.numero }}
            </TableCell>
            <TableCell class="text-center">
              {{ reserva.fecha_entrada }}
            </TableCell>
            <TableCell class="text-center">
              {{ reserva.fecha_salida }}
            </TableCell>

            <TableCell class="font-semibold text-center">
              ${{ reserva.total?.toFixed(2) }}
            </TableCell>

            <TableCell class="text-center">
              {{ formatEstado(reserva.estado) }}
            </TableCell>

            <TableCell class="text-center">
              <!-- Eliminar -->
              <Button variant="destructive" class="m-2 cursor-pointer" @click="deleteReserva(reserva)"
                :disabled="reserva.estado === 'finalizado'">
                <Icon icon="tdesign:delete-filled" />
              </Button>

              <!-- Editar -->
              <Button variant="secondary" class="m-2 cursor-pointer" @click="openForm(reserva)"
                :disabled="reserva.estado === 'finalizado'">
                <Icon icon="oui:document-edit" />
              </Button>
              <!-- NUEVO: Añadir consumo / detalle de reserva -->
              <Button variant="outline" class="m-2 cursor-pointer" @click="openDetalleForm(reserva)"
                :disabled="reserva.estado === 'finalizado'">
                <Icon icon="mdi:cart-plus" />
              </Button>

              <!-- Cerrar reserva -->
              <Button v-if="reserva.estado !== 'finalizado'" variant="default" class="m-2 cursor-pointer"
                @click="closeReserva(reserva)">
                <Icon icon="oui:check-in-circle-empty" />
              </Button>

              <!-- Ver boleta -->
              <RouterLink v-if="reserva.estado === 'finalizado'" :to="`/registros/boleta/${reserva.id_reserva}`">
                <Button variant="default" class="m-2 cursor-pointer">
                  <Icon icon="oui:page-select" />
                </Button>
              </RouterLink>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Pagination v-model:page="currentPage" :items-per-page="itemsPerPage" :total="reservas.length">
      <PaginationContent>
        <PaginationPrevious :disabled="currentPage === 1" />
        <PaginationItem v-for="p in totalPages" :key="p" :value="p" :is-active="p === currentPage">
          {{ p }}
        </PaginationItem>
        <PaginationNext :disabled="currentPage === totalPages" />
      </PaginationContent>
    </Pagination>

    <!-- MODAL RESERVA -->
    <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg text-black relative">

        <h2 class="text-xl text-center font-bold mb-4">
          {{ isEdit ? "Editar Reserva" : "Agregar Reserva" }}
        </h2>

        <form @submit.prevent="saveReserva">
          <div class="space-y-4">

            <!-- DNI + búsqueda de huésped -->
            <div class="relative">
              <label class="block font-medium">DNI</label>
              <input type="text" v-model="dniInput" @input="filterHuespedes" @focus="showDropdown = true"
                @blur="hideDropdown" class="border p-2 rounded w-full" placeholder="Escribe un DNI o selecciona uno" />

              <ul v-if="showDropdown && filteredHuespedes.length"
                class="border rounded mt-1 max-h-40 overflow-auto bg-white z-10 absolute w-full shadow-lg">
                <li v-for="h in filteredHuespedes" :key="h.dni" class="p-2 hover:bg-blue-100 cursor-pointer"
                  @mousedown.prevent="selectHuesped(h)">
                  {{ h.dni }} — {{ h.nombre }}
                </li>
              </ul>

              <div v-if="dniInput && !existingDNI(dniInput)" class="mt-1 text-sm text-gray-500">
                DNI no existe, se creará uno nuevo con nombre:
                <input v-model="newNombre" placeholder="Nombre del huésped" class="border p-2 rounded w-full" />
              </div>
            </div>

            <!-- Cuarto -->
            <div>
              <label class="block font-medium">Cuarto</label>
              <select v-model.number="form.cuarto" class="border p-2 rounded w-full" required>
                <option disabled :value="null">Seleccione un cuarto</option>
                <option v-for="cuarto in cuartos" :key="cuarto.id_cuarto" :value="cuarto.id_cuarto"
                  :disabled="cuarto.estados === 'ocupado'"
                  :style="{ color: cuarto.estados === 'ocupado' ? 'red' : 'black' }">
                  #{{ cuarto.numero }} — ${{ cuarto.precio_por_noche }} / noche
                  {{ cuarto.estados === "ocupado" ? " (Ocupado)" : "" }}
                </option>
              </select>
            </div>

            <!-- Fechas -->
            <div>
              <label class="block font-medium">Fecha Entrada</label>
              <input v-model="form.fecha_entrada" type="date" class="border p-2 rounded w-full" required />
            </div>

            <div>
              <label class="block font-medium">Fecha Salida</label>
              <input v-model="form.fecha_salida" type="date" class="border p-2 rounded w-full" required />
            </div>

            <!-- Total -->
            <div>
              <label class="block font-medium">Total</label>
              <input class="border p-2 rounded w-full bg-gray-100" :value="calculatedTotal" disabled />
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" type="button" class="cursor-pointer" @click="closeForm">
              Cancelar
            </Button>
            <Button type="submit" class="bg-blue-600 text-white hover:bg-blue-500 cursor-pointer">
              {{ isEdit ? "Guardar Cambios" : "Agregar" }}
            </Button>
          </div>
        </form>

      </div>
    </div>

    <!-- MODAL DETALLE RESERVA (PRODUCTO) -->
    <div v-if="showDetalleForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-black relative">
        <h2 class="text-xl text-center font-bold mb-4">
          Añadir consumo a la reserva N° {{ detalleForm.reservaId }}
        </h2>

        <form @submit.prevent="saveDetalle">
          <div class="space-y-4">
            <!-- Producto -->
            <div>
              <label class="block font-medium mb-1">Producto</label>
              <select v-model.number="detalleForm.productoId" class="border p-2 rounded w-full" required>
                <option disabled :value="null">Seleccione un producto</option>
                <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
                  {{ p.nombre }} — S/ {{ p.precio_unitario.toFixed(2) }}
                </option>
              </select>
            </div>

            <!-- Cantidad -->
            <div>
              <label class="block font-medium mb-1">Cantidad</label>
              <input type="number" min="1" v-model.number="detalleForm.cantidad" class="border p-2 rounded w-full"
                required />
            </div>

            <!-- Precio unitario / Subtotal -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-medium mb-1">Precio unitario</label>
                <input class="border p-2 rounded w-full bg-gray-100" :value="precioDetalle.toFixed(2)" disabled />
              </div>
              <div>
                <label class="block font-medium mb-1">Subtotal</label>
                <input class="border p-2 rounded w-full bg-gray-100" :value="subtotalDetalle.toFixed(2)" disabled />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" type="button" class="cursor-pointer" @click="closeDetalleForm">
              Cancelar
            </Button>
            <Button type="submit" class="bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer">
              Guardar consumo
            </Button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface Cuarto {
  id_cuarto: number;
  numero: number;
  precio_por_noche: number;
  estados: "disponible" | "ocupado";
}

interface Huesped {
  id_huesped: number;
  dni: string;
  nombre: string;
}

interface Reserva {
  id_reserva: number;
  fecha_entrada: string | null;
  fecha_salida: string | null;
  total: number | null;
  estado: "en_curso" | "finalizado";
  Huesped?: Huesped | null;
  Cuarto?: {
    id_cuarto?: number;
    numero: number | null;
    Piso?: { numero: number | null } | null;
  } | null;
}

interface Producto {
  id_producto: number;
  nombre: string;
  precio_unitario: number;
}

/* STATE */
const reservas = ref<Reserva[]>([]);
const cuartos = ref<Cuarto[]>([]);
const huespedes = ref<Huesped[]>([]);
const productos = ref<Producto[]>([]);
const loading = ref(true);

const itemsPerPage = 10;
const currentPage = ref(1);

/* PAGINACIÓN */
const reservasPaginated = computed(() =>
  reservas.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
);

const totalPages = computed(() =>
  Math.ceil(reservas.value.length / itemsPerPage)
);

/* FORMULARIO RESERVA */
const showForm = ref(false);
const isEdit = ref(false);

const form = ref({
  id_reserva: null as number | null,
  huesped_id: null as number | null,
  huesped: "",
  dni: "",
  cuarto: null as number | null,
  fecha_entrada: "",
  fecha_salida: ""
});

const dniInput = ref("");
const newNombre = ref("");
const showDropdown = ref(false);
const filteredHuespedes = ref<Huesped[]>([]);

/* FORMULARIO DETALLE (CONSUMO) */
const showDetalleForm = ref(false);
const detalleForm = ref({
  reservaId: null as number | null,
  productoId: null as number | null,
  cantidad: 1
});

/* FILTRAR HUÉSPEDES POR DNI */
function filterHuespedes() {
  const term = dniInput.value.toLowerCase();
  filteredHuespedes.value = huespedes.value.filter((h) =>
    h.dni.toLowerCase().includes(term)
  );
}

function selectHuesped(h: Huesped) {
  dniInput.value = h.dni;
  form.value.huesped = h.nombre;
  form.value.huesped_id = h.id_huesped;
  showDropdown.value = false;
}

function formatEstado(c: string): string {
  if (!c) return "";
  const texto = c.replace(/_/g, " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function hideDropdown() {
  setTimeout(() => (showDropdown.value = false), 200);
}

function existingDNI(dni: string) {
  return huespedes.value.some((h) => h.dni === dni);
}

/* TOTAL CALCULADO RESERVA */
const calculatedTotal = computed(() => {
  if (!form.value.cuarto || !form.value.fecha_entrada || !form.value.fecha_salida)
    return 0;

  const cuarto = cuartos.value.find(
    (c) => c.id_cuarto === form.value.cuarto
  );
  if (!cuarto) return 0;

  const dias =
    (new Date(form.value.fecha_salida).getTime() -
      new Date(form.value.fecha_entrada).getTime()) /
    (1000 * 60 * 60 * 24);

  return dias > 0
    ? Number((dias * cuarto.precio_por_noche).toFixed(2))
    : 0;
});

/* PRECIO / SUBTOTAL DETALLE */
const precioDetalle = computed(() => {
  if (!detalleForm.value.productoId) return 0;
  const prod = productos.value.find(
    (p) => p.id_producto === detalleForm.value.productoId
  );
  return prod ? prod.precio_unitario : 0;
});

const subtotalDetalle = computed(() => {
  return Number(detalleForm.value.cantidad || 0) * precioDetalle.value;
});

/* ACTUALIZAR ESTADO DEL CUARTO */
async function setEstadoCuarto(
  cuartoId: number,
  estado: "disponible" | "ocupado"
) {
  if (!cuartoId) return;

  const { error } = await supabase
    .from("Cuarto")
    .update({ estados: estado })
    .eq("id_cuarto", cuartoId);

  if (error) {
    console.error("Error al actualizar estado del cuarto:", error.message);
  }
}

/* ABRIR FORMULARIO RESERVA */
function openForm(reserva?: Reserva) {
  if (reserva) {
    isEdit.value = true;
    dniInput.value = reserva.Huesped?.dni ?? "";
    newNombre.value = "";
    form.value = {
      id_reserva: reserva.id_reserva,
      huesped_id: reserva.Huesped ? reserva.Huesped.id_huesped : null,
      huesped: reserva.Huesped?.nombre ?? "",
      dni: reserva.Huesped?.dni ?? "",
      cuarto: reserva.Cuarto?.id_cuarto ?? null,
      fecha_entrada: reserva.fecha_entrada ?? "",
      fecha_salida: reserva.fecha_salida ?? ""
    };
  } else {
    isEdit.value = false;
    dniInput.value = "";
    newNombre.value = "";
    form.value = {
      id_reserva: null,
      huesped_id: null,
      huesped: "",
      dni: "",
      cuarto: null,
      fecha_entrada: "",
      fecha_salida: ""
    };
  }
  showForm.value = true;
}

const closeForm = () => (showForm.value = false);

/* ABRIR / CERRAR FORM DETALLE */
function openDetalleForm(reserva: Reserva) {
  detalleForm.value = {
    reservaId: reserva.id_reserva,
    productoId: null,
    cantidad: 1
  };
  showDetalleForm.value = true;
}

function closeDetalleForm() {
  showDetalleForm.value = false;
}

/* CARGAR HUÉSPEDES */
async function loadHuespedes() {
  const { data } = await supabase
    .from("Huesped")
    .select("id_huesped, dni, nombre");

  type HuespedRow = {
    id_huesped: number;
    dni: string | null;
    nombre: string | null;
  };

  const rows = (data ?? []) as HuespedRow[];

  huespedes.value = rows.map((h) => ({
    id_huesped: h.id_huesped,
    dni: h.dni ?? "",
    nombre: h.nombre ?? ""
  }));
}

/* CARGAR PRODUCTOS */
async function loadProductos() {
  const { data, error } = await supabase
    .from("Producto")
    .select("id_producto, nombre, precio_unitario");

  if (error) {
    console.error("Error al cargar productos:", error.message);
    productos.value = [];
    return;
  }

  type ProductoRow = {
    id_producto: number;
    nombre: string | null;
    precio_unitario: number | null;
  };

  const rows = (data ?? []) as ProductoRow[];

  productos.value = rows.map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre ?? "",
    precio_unitario: p.precio_unitario ?? 0
  }));
}

/* GUARDAR / EDITAR RESERVA */
async function saveReserva() {
  if (!dniInput.value) {
    alert("El DNI del huésped es obligatorio");
    return;
  }
  if (!existingDNI(dniInput.value) && !newNombre.value) {
    alert("Debe ingresar el nombre del nuevo huésped");
    return;
  }
  if (!form.value.cuarto) {
    alert("Debe seleccionar un cuarto");
    return;
  }
  if (!form.value.fecha_entrada || !form.value.fecha_salida) {
    alert("Debe ingresar fecha de entrada y salida");
    return;
  }

  const entrada = new Date(form.value.fecha_entrada);
  const salida = new Date(form.value.fecha_salida);
  if (salida <= entrada) {
    alert("La fecha de salida debe ser posterior a la fecha de entrada");
    return;
  }

  if (calculatedTotal.value <= 0) {
    alert("El total calculado debe ser mayor a 0");
    return;
  }

  // Crear huésped si no existe
  if (!existingDNI(dniInput.value)) {
    const { data: newHuesped, error } = await supabase
      .from("Huesped")
      .insert({ dni: dniInput.value, nombre: newNombre.value })
      .select("id_huesped, dni")
      .single();

    if (error) {
      alert("Error al crear huésped: " + error.message);
      return;
    }

    form.value.huesped_id = newHuesped.id_huesped;
  }

  const payload = {
    huesped_id: form.value.huesped_id,
    cuarto_id: Number(form.value.cuarto),
    fecha_entrada: form.value.fecha_entrada,
    fecha_salida: form.value.fecha_salida,
    total: calculatedTotal.value
  };

  let errorOp = null;

  if (isEdit.value && form.value.id_reserva !== null) {
    const { error } = await supabase
      .from("Reserva")
      .update(payload)
      .eq("id_reserva", form.value.id_reserva);
    errorOp = error;
  } else {
    const { error } = await supabase.from("Reserva").insert(payload);
    errorOp = error;
  }

  if (errorOp) {
    alert("Error al guardar la reserva: " + errorOp.message);
    return;
  }

  await setEstadoCuarto(payload.cuarto_id, "ocupado");

  await loadReservas();
  await loadCuartos();
  await loadHuespedes();
  closeForm();
}

/* GUARDAR DETALLE (CONSUMO) */
async function saveDetalle() {
  if (!detalleForm.value.reservaId) {
    alert("Reserva no válida");
    return;
  }
  if (!detalleForm.value.productoId) {
    alert("Debe seleccionar un producto");
    return;
  }
  if (!detalleForm.value.cantidad || detalleForm.value.cantidad <= 0) {
    alert("La cantidad debe ser mayor a 0");
    return;
  }

  const precio = precioDetalle.value;
  const subtotal = subtotalDetalle.value;

  const payload = {
    reserva_id: detalleForm.value.reservaId,
    producto_id: detalleForm.value.productoId,
    cantidad: detalleForm.value.cantidad,
    precio_unitario: precio,
    subtotal
  };

  const { error } = await supabase
    .from("ReservaDetalle")
    .insert(payload);

  if (error) {
    console.error("Error al guardar detalle:", error.message);
    alert("Error al guardar el consumo");
    return;
  }

  closeDetalleForm();
}

/* ELIMINAR RESERVA + LIBERAR CUARTO */
async function deleteReserva(reserva: Reserva) {
  await supabase
    .from("Reserva")
    .delete()
    .eq("id_reserva", reserva.id_reserva);

  if (reserva.Cuarto?.id_cuarto) {
    await setEstadoCuarto(reserva.Cuarto.id_cuarto, "disponible");
  }

  reservas.value = reservas.value.filter(
    (r) => r.id_reserva !== reserva.id_reserva
  );
}

/* CERRAR RESERVA (estado = finalizado en BD + liberar cuarto) */
async function closeReserva(reserva: Reserva) {
  if (!reserva.id_reserva) return;

  const { error } = await supabase
    .from("Reserva")
    .update({ estado: "finalizado" })
    .eq("id_reserva", reserva.id_reserva);

  if (error) {
    console.error("Error al cerrar la reserva:", error.message);
    return;
  }

  if (reserva.Cuarto?.id_cuarto) {
    await setEstadoCuarto(reserva.Cuarto.id_cuarto, "disponible");
  }

  await loadReservas();
  await loadCuartos();
}

/* CARGAR CUARTOS */
async function loadCuartos() {
  const { data } = await supabase
    .from("Cuarto")
    .select("id_cuarto, numero, precio_por_noche, estados");

  type CuartoRow = {
    id_cuarto: number;
    numero: number | null;
    precio_por_noche: number | null;
    estados: "disponible" | "ocupado" | null;
  };

  const rows = (data ?? []) as CuartoRow[];

  cuartos.value = rows.map((c) => ({
    id_cuarto: c.id_cuarto,
    numero: c.numero ?? 0,
    precio_por_noche: c.precio_por_noche ?? 0,
    estados: (c.estados ?? "disponible") as "disponible" | "ocupado"
  }));
}

/* CARGAR RESERVAS CON RELACIONES */
async function loadReservas() {
  const { data } = await supabase
    .from("Reserva")
    .select(
      `
      id_reserva, fecha_entrada, fecha_salida, total, estado,
      Huesped ( id_huesped, nombre, dni ),
      Cuarto ( id_cuarto, numero, Piso ( numero ) )
    `
    )
    .order("id_reserva", { ascending: false });

  type HuespedRow = {
    id_huesped: number;
    dni: string | null;
    nombre: string | null;
  };

  type PisoRow = {
    numero: number | null;
  };

  type CuartoRow = {
    id_cuarto: number;
    numero: number | null;
    Piso: PisoRow | null;
  };

  type ReservaRow = {
    id_reserva: number;
    fecha_entrada: string | null;
    fecha_salida: string | null;
    total: number | null;
    estado: "en_curso" | "finalizado" | null;
    Huesped: HuespedRow | null;
    Cuarto: CuartoRow | null;
  };

  const rows = (data ?? []) as unknown as ReservaRow[];

  reservas.value = rows.map((r) => ({
    id_reserva: r.id_reserva,
    fecha_entrada: r.fecha_entrada,
    fecha_salida: r.fecha_salida,
    total: r.total,
    estado: (r.estado ?? "en_curso") as "en_curso" | "finalizado",
    Huesped: r.Huesped
      ? {
        id_huesped: r.Huesped.id_huesped,
        dni: r.Huesped.dni ?? "",
        nombre: r.Huesped.nombre ?? ""
      }
      : null,
    Cuarto: r.Cuarto
      ? {
        id_cuarto: r.Cuarto.id_cuarto,
        numero: r.Cuarto.numero ?? 0,
        Piso: r.Cuarto.Piso
          ? { numero: r.Cuarto.Piso.numero ?? 0 }
          : null
      }
      : null
  }));
}

/* ON MOUNT */
onMounted(async () => {
  await loadCuartos();
  await loadHuespedes();
  await loadProductos();
  await loadReservas();
  loading.value = false;
});
</script>

<style scoped></style>
