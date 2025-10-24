import {
  fakerES_MX as faker
} from "@faker-js/faker";
import {
  createClient
} from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
)

const seedCarreras = async (num) => {

  // Mensajes
  const log = (tablaName, error) => {
    console.error(
      `A ocurrido un error en la tabla ' ${tablaName}'con codigo ${error.code}: ${error.message}`
    )
    process.exit(1)
  }

  const mensaje = (stopMessage) => {
    console.log(stopMessage)
  }

  const enviando = async (num) => {
    mensaje('Enviando datos')
  }

  const carreras = []

  for (let i = 0; i < num; i++) {

    const name = faker.lorem.words(3)
    carreras.push({
      name: name,
      status: faker.helpers.arrayElement(['activo', 'inactivo', 'en reposo']),
      estudiantes: faker.helpers.arrayElements([1, 2, 3, 4]),
      anio: faker.date.past(),
      mes: faker.date.month()
    })
  }
  const {
    data,
    error
  } = await supabase.from('carrera').insert(carreras).select('id')
  if (error) return log('carrera', error)

  mensaje('Datos enviados correctamente')
  return data
}

const envioData = async (nume) => {
  await seedCarreras(nume)
}

const nume = 250

envioData(nume)
