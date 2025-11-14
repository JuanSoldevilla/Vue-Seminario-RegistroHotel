import { fakerES_MX as faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Faltan las variables VITE_SUPABASE_URL o SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/* ---------- PISOS ---------- */
const seedPisos = async (num) => {
  console.log(`🏢 Insertando ${num} pisos...`);
  const pisos = Array.from({ length: num }, (_, i) => ({
    numero: i + 1,
  }));

  const { data, error } = await supabase
    .from("Piso")
    .insert(pisos)
    .select("id_piso");

  if (error) throw error;
  console.log(`✅ ${data.length} pisos insertados.`);
  return data;
};

/* ---------- CUARTOS ---------- */
const seedCuartos = async (pisos) => {
  console.log(`🛏️ Insertando cuartos...`);
  const caracteristicas = ["tv", "wifi", "aire_acondicionado", "baño_privado", "jacuzzi"];
  const cuartos = [];

  pisos.forEach((piso) => {
    const numCuartos = faker.number.int({ min: 5, max: 10 });
    for (let i = 0; i < numCuartos; i++) {
      const precio = Number(
        faker.number.float({ min: 100, max: 300, precision: 0.01 }).toFixed(2)
      );

      cuartos.push({
        numero: faker.number.int({ min: 100, max: 999 }),
        piso_id: piso.id_piso,
        caracteristicas: faker.helpers.arrayElements(caracteristicas, {
          min: 1,
          max: 3,
        }),
        precio_por_noche: precio,
      });
    }
  });

  const { data, error } = await supabase
    .from("Cuarto")
    .insert(cuartos)
    .select("id_cuarto, precio_por_noche");

  if (error) throw error;
  console.log(`✅ ${data.length} cuartos insertados.`);
  return data;
};

/* ---------- HUESPEDES ---------- */
const seedHuespedes = async (num) => {
  console.log(`👤 Insertando ${num} huéspedes...`);
  const huespedes = Array.from({ length: num }, () => ({
    nombre: faker.person.fullName(),
    dni: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
  }));

  const { data, error } = await supabase
    .from("Huesped")
    .insert(huespedes)
    .select("id_huesped");

  if (error) throw error;
  console.log(`✅ ${data.length} huéspedes insertados.`);
  return data;
};

/* ---------- PRODUCTOS ---------- */
const seedProductos = async () => {
  console.log("🛒 Insertando productos de minibar...");

  const productosBase = [
    {
      nombre: "Gaseosa personal",
      precio_unitario: 3.5,
      descripcion: "Gaseosa personal 350 ml",
    },
    {
      nombre: "Galletas",
      precio_unitario: 2.0,
      descripcion: "Paquete de galletas dulces",
    },
    {
      nombre: "Agua mineral",
      precio_unitario: 2.5,
      descripcion: "Botella de agua sin gas 500 ml",
    },
    {
      nombre: "Cerveza",
      precio_unitario: 6.0,
      descripcion: "Cerveza en botella 355 ml",
    },
    {
      nombre: "Snack salado",
      precio_unitario: 3.0,
      descripcion: "Bolsa de papas / snacks",
    },
  ];

  // Productos extra generados con faker
  const productosExtras = Array.from({ length: 5 }, () => ({
    nombre: faker.commerce.productName(),
    precio_unitario: Number(
      faker.number.float({ min: 2, max: 15, precision: 0.01 }).toFixed(2)
    ),
    descripcion: faker.commerce.productDescription(),
  }));

  const productos = [...productosBase, ...productosExtras];

  const { data, error } = await supabase
    .from("Producto")
    .insert(productos)
    .select("id_producto, nombre, precio_unitario");

  if (error) throw error;
  console.log(`✅ ${data.length} productos insertados.`);
  return data;
};

/* ---------- RESERVAS ---------- */
const seedReservas = async (num, huespedes, cuartos) => {
  console.log(`🧾 Insertando ${num} reservas...`);

  const reservas = Array.from({ length: num }, () => {
    const huesped = faker.helpers.arrayElement(huespedes);
    const cuarto = faker.helpers.arrayElement(cuartos);

    const fechaEntrada = faker.date.between({
      from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      to: new Date(),
    });

    const dias = faker.number.int({ min: 1, max: 10 });
    const fechaSalida = new Date(fechaEntrada);
    fechaSalida.setDate(fechaEntrada.getDate() + dias);

    const total = Number((cuarto.precio_por_noche * dias).toFixed(2));
    const estado = fechaSalida < new Date() ? "finalizado" : "en_curso";

    return {
      huesped_id: huesped.id_huesped,
      cuarto_id: cuarto.id_cuarto,
      fecha_entrada: fechaEntrada.toISOString().split("T")[0],
      fecha_salida: fechaSalida.toISOString().split("T")[0],
      total,
      estado,
    };
  });

  reservas.sort(
    (a, b) =>
      new Date(a.fecha_entrada).getTime() -
      new Date(b.fecha_entrada).getTime()
  );

  const { data, error } = await supabase
    .from("Reserva")
    .insert(reservas)
    .select("id_reserva");

  if (error) throw error;
  console.log(`✅ ${data.length} reservas insertadas (ordenadas por fecha de entrada).`);

  return data;
};

/* ---------- RESERVA DETALLE (NUEVO) ---------- */
const seedReservaDetalles = async (reservas, productos) => {
  console.log("🧾 Insertando detalles de reserva (productos consumidos)...");

  const detalles = [];

  reservas.forEach((reserva) => {
    // Algunas reservas pueden no tener consumos
    const numDetalles = faker.number.int({ min: 0, max: 4 });

    for (let i = 0; i < numDetalles; i++) {
      const producto = faker.helpers.arrayElement(productos);
      const cantidad = faker.number.int({ min: 1, max: 4 });
      const precio_unitario = Number(producto.precio_unitario);
      const subtotal = Number((precio_unitario * cantidad).toFixed(2));

      detalles.push({
        reserva_id: reserva.id_reserva,
        producto_id: producto.id_producto,
        cantidad,
        precio_unitario,
        subtotal,
      });
    }
  });

  if (detalles.length === 0) {
    console.log("ℹ️ No se generaron detalles (numDetalles = 0 para todas).");
    return;
  }

  const { data, error } = await supabase
    .from("ReservaDetalle")
    .insert(detalles)
    .select("id_detalle");

  if (error) throw error;
  console.log(`✅ ${data.length} detalles de reserva insertados.`);
};

/* ---------- ACTUALIZAR ESTADO DE CUARTOS ---------- */
const actualizarCuartosOcupados = async () => {
  console.log("🔄 Actualizando estados de cuartos según reservas en curso...");

  const { data: reservasEnCurso, error: errorReservas } = await supabase
    .from("Reserva")
    .select("cuarto_id")
    .eq("estado", "en_curso");

  if (errorReservas) throw errorReservas;

  const cuartoIds = reservasEnCurso.map((r) => r.cuarto_id);

  if (cuartoIds.length === 0) {
    console.log("✅ No hay cuartos con reservas en curso.");
    return;
  }

  const { data, error } = await supabase
    .from("Cuarto")
    .update({ estados: "ocupado" })
    .in("id_cuarto", cuartoIds)
    .select("id_cuarto, estados");

  if (error) throw error;

  console.log(`✅ ${data.length} cuartos actualizados a 'ocupado'.`);
};

/* ---------- EJECUCIÓN PRINCIPAL ---------- */
(async () => {
  try {
    console.log("🧹 Limpiando tablas existentes...");
    await supabase.from("ReservaDetalle").delete().neq("id_detalle", 0);
    await supabase.from("Reserva").delete().neq("id_reserva", 0);
    await supabase.from("Cuarto").delete().neq("id_cuarto", 0);
    await supabase.from("Huesped").delete().neq("id_huesped", 0);
    await supabase.from("Piso").delete().neq("id_piso", 0);
    await supabase.from("Producto").delete().neq("id_producto", 0);

    console.log("🔄 Iniciando nuevo seed...");
    const pisos = await seedPisos(3);
    const cuartos = await seedCuartos(pisos);
    const huespedes = await seedHuespedes(50);
    const productos = await seedProductos(); // 👈 guardamos productos
    const reservas = await seedReservas(100, huespedes, cuartos);
    await seedReservaDetalles(reservas, productos); // 👈 generamos detalles
    await actualizarCuartosOcupados();

    console.log("🎉 Seed completado correctamente.");
  } catch (error) {
    console.error(`🚨 Error en el seed: ${error.message}`);
    process.exit(1);
  }
})();
