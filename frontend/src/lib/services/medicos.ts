export interface Medico {
  nombre: string;
  especialidad: string;
  identificacion: string;
  correo: string;
}

export const LISTA_MEDICOS: Medico[] = [
  { nombre: "DR. MARCO VINICIO CRUZ TUFIÑO", especialidad: "TRAUMATOLOGO", identificacion: "1707188726", correo: "vinicioc35@hotmail.com" },
  { nombre: "DR. JOSE SANTIAGO CAMPUZANO TUBAY", especialidad: "CIRUGIA GENERAL Y LAPAROSCOPICA", identificacion: "1305173237", correo: "nhpanamericano.vlc@gmail.com" },
  { nombre: "DRA. YADIRA LILIANA QUIZHPE REQUELME", especialidad: "MEDICO INTERNISTA", identificacion: "1103505507", correo: "yaliq@yahoo.es" },
  { nombre: "DR. ALEX AUGUSTO NAVARRETE MONTERO", especialidad: "PEDIATRA", identificacion: "1711723211", correo: "jesse9045@hotmail.com" },
  { nombre: "DRA. MARIA ISABEL QUIMBA ÑACATO", especialidad: "MEDICO GENERAL", identificacion: "1723765564", correo: "mabel_1595@hotmail.com" },
  { nombre: "MD. CARLOS GABRIEL FLORES ENDERICA", especialidad: "MÉDICO ESPECIALISTA EN NEUROCIRUGÍA", identificacion: "0103769113", correo: "gabrielfloresneurocx@outlook.com" },
  { nombre: "DR. JOSÉ ANDRÉS CALDERÓN RAMOS", especialidad: "MEDICO RESIDENTE", identificacion: "1003683248", correo: "caldernjose@gmail.com" },
  { nombre: "DRA. KARLA IVETH CUCHIPE ASTUDILLO", especialidad: "MEDICO GENERAL", identificacion: "1718353558", correo: "kariveth200@gmail.com" },
  { nombre: "DRA. ALVAREZ JAQUE MONICA ELIZABETH", especialidad: "PEDIATRIA/ NEONATOLOGIA", identificacion: "1708297369", correo: "dra.monicaalvarez@hotmail.com" },
  { nombre: "DR. JORGE PATRICIO ALDAZ JORDAN", especialidad: "UROLOGO", identificacion: "1802776748", correo: "patodos21@yahoo.com" },
  { nombre: "DR. LLANGARI PAGUAY MILTON IVAN", especialidad: "UROLOGO", identificacion: "1709893919", correo: "drmiltonllangari@yahoo.com" },
  { nombre: "DR. FLAVIO JOSE NAVARRETE YANEZ", especialidad: "GINECÓLOGO – OBSTETRA", identificacion: "1713212122", correo: "fjny_patron@hotmail.com" },
  { nombre: "Dr. TORRES MANZANO FRANCISCO JAVIER", especialidad: "GINECOLOGO – OBSTETRA", identificacion: "1707137228", correo: "nhpanamericano.vlc@gmail.com" },
  { nombre: "Dr. GONZALO ROBERTO PALOMO ALLAUCA", especialidad: "GINECOLOGO – OBSTETRA", identificacion: "1713628434", correo: "gpalomoallauca@yahoo.es" },
  { nombre: "DR. PILATASIG LEMA LUIS RAMIRO", especialidad: "GINECOLOGÍA Y OBSTETRICIA", identificacion: "1706378534", correo: "rpmedical@hotmail.com" },
  { nombre: "DRA. ESPINOZA MEJIA ANGELITA JANNETH", especialidad: "DERMATOLOGIA", identificacion: "2100050190", correo: "dra.aespinoza@gmail.com" }
];

export async function buscarMedicos(q: string): Promise<Medico[]> {
  if (!q) return [];
  const query = q.toLowerCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(LISTA_MEDICOS.filter(m => 
        m.nombre.toLowerCase().includes(query) ||
        m.especialidad.toLowerCase().includes(query) ||
        m.identificacion.includes(query)
      ));
    }, 50); // slight debounce delay matching CIE-10
  });
}
