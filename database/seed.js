import { fakerES_MX as faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Faltan las variables VITE_SUPABASE_URL o SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const seedPisos = async (num) => {
  console.log(`🏢 Insertando ${num} pisos...`);
  const pisos = Array.from({ length: num }, (_, i) => ({
    numero: i + 1,
  }));

  const { data, error } = await supabase.from("Piso").insert(pisos).select("id_piso");
  if (error) throw error;
  console.log(`✅ ${data.length} pisos insertados.`);
  return data;
};

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
        caracteristicas: faker.helpers.arrayElements(caracteristicas, { min: 1, max: 3 }),
        estados: faker.helpers.arrayElement(["disponible", "ocupado"]),
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

const seedHuespedes = async (num) => {
  console.log(`👤 Insertando ${num} huéspedes...`);
  const huespedes = Array.from({ length: num }, () => ({
    nombre: faker.person.fullName(),
    dni: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
  }));

  const { data, error } = await supabase.from("Huesped").insert(huespedes).select("id_huesped");
  if (error) throw error;
  console.log(`✅ ${data.length} huéspedes insertados.`);
  return data;
};

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

    return {
      huesped_id: huesped.id_huesped,
      cuarto_id: cuarto.id_cuarto,
      fecha_entrada: fechaEntrada.toISOString().split("T")[0],
      fecha_salida: fechaSalida.toISOString().split("T")[0],
      total,
    };
  });

  reservas.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime());

  const { data, error } = await supabase.from("Reserva").insert(reservas).select("id_reserva");
  if (error) throw error;
  console.log(`✅ ${data.length} reservas insertadas (ordenadas por fecha de entrada).`);
  return data;
};

(async () => {
  try {
    console.log("🧹 Limpiando tablas existentes...");
    await supabase.from("Reserva").delete().neq("id_reserva", 0);
    await supabase.from("Cuarto").delete().neq("id_cuarto", 0);
    await supabase.from("Huesped").delete().neq("id_huesped", 0);
    await supabase.from("Piso").delete().neq("id_piso", 0);

    console.log("🔄 Iniciando nuevo seed...");
    const pisos = await seedPisos(3);
    const cuartos = await seedCuartos(pisos);
    const huespedes = await seedHuespedes(50);
    await seedReservas(100, huespedes, cuartos);

    console.log("🎉 Seed completado correctamente.");
  } catch (error) {
    console.error(`🚨 Error en el seed: ${error.message}`);
    process.exit(1);
  }
})();
