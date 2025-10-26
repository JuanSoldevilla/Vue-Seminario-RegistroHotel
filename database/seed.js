import { fakerES_MX as faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Faltan las variables VITE_SUPABASE_URL o SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const seedVentas = async (num) => {
  try {
    console.log(`🔄 Enviando ${num} registros a la tabla 'ventas'...`);
    const ventas = Array.from({ length: num }, () => {
      const fechaAleatoria = faker.date.between({
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        to: new Date()
      });
      return {
        status: faker.helpers.arrayElement(["pendiente", "pagado", "cancelado"]),
        cliente: faker.person.fullName(),
        fecha: fechaAleatoria.toISOString().split("T")[0],
        productos: faker.helpers.arrayElements(
          ["Pizza", "Refresco", "Combo Familiar", "Postre", "Entrada"],
          { min: 1, max: 3 }
        ),
      };
    });
    const { data, error } = await supabase
      .from("ventas")
      .insert(ventas)
      .select("id");

    if (error) throw error;

    console.log(`✅ ${data.length} registros insertados correctamente.`);
    return data;
  } catch (error) {
    console.error(`🚨 Error al insertar datos: ${error.message}`);
    process.exit(1);
  }
};

const numRegistros = 250;
seedVentas(numRegistros);
