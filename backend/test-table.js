const htmlToDocx = require('html-to-docx');
const fs = require('fs');

async function test() {
  try {
    const html = `<div style="font-family: Arial; font-size: 12pt;">
  <p style="text-align: center;"><strong>CUIDADOS Y VACIAMENTO DE DRENAJE JACKSON PRATT</strong></p>
  <p>Un drenaje JP se usa para eliminar los l&iacute;quidos que se acumulan en un &aacute;rea de su cuerpo despu&eacute;s de una cirug&iacute;a</p>
  
  <p><strong>&iquest;C&oacute;mo se cambia las gasas alrededor del drenaje?</strong></p>
  <p>Realizar la curaci&oacute;n, una vez al d&iacute;a o cambiar las gasas si se mojan.</p>
  <ol>
    <li>Primero: L&aacute;vese las manos con agua y jab&oacute;n.</li>
    <br>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" width="200" height="200" />
    <br>
    <li>Retire las gasas: H&aacute;galo con suavidad. Si est&aacute; muy pegado, humedezca un poco con agua limpia.</li>
    <li>Limpia en espiral: Moje una gasa est&eacute;ril con agua y jab&oacute;n neutro (o soluci&oacute;n salina). Limpia dibujando c&iacute;rculos comenzando donde sale el tubo y movi&eacute;ndose hacia afuera. No vuelva a tocar el centro con la misma gasa.</li>
    <li>Seque por completo: D&eacute; toques muy suaves con una gasa limpia y seca.</li>
    <li>Coloque un parche nuevo: Ponga una gasa limpia sobre el orificio y suj&eacute;tala a la piel con esparadrapo.</li>
  </ol>
  
  <p><strong>&iquest;C&oacute;mo se vac&iacute;a el drenaje?</strong></p>
  <p>Vac&iacute;e la bombilla cuando est&eacute; a la mitad de llena o cada 24 horas.</p>
  <ol>
    <li>L&aacute;vese las manos: Frota con agua y jab&oacute;n por 20 segundos antes de comenzar.</li>
    <li>Abra el tap&oacute;n: Quita la tapa de pl&aacute;stico de la pera sin tocar la boquilla interna.</li>
    <li>Vac&iacute;e el l&iacute;quido: Voltee la pera y apri&eacute;tela suavemente.</li>
    <li>Reactiva la succi&oacute;n: Con el tap&oacute;n abierto, aplaste la pera en el centro.</li>
    <li>Cierre el tap&oacute;n: Mantenga la pera aplastada y vuelve a colocar el tap&oacute;n. Debe quedar aplastada para seguir aspirando.</li>
    <li>Anote los datos: Mide la cantidad de l&iacute;quido (en mililitros o cc) y apunte la hora y el color en una libreta.</li>
  </ol>
  
  <ul>
    <li><strong>SIGNOS DE ALARMA:</strong> Cambio de color rosa claro a rojo oscuro, si su drenaje se rompe o se sale, si hay secreci&oacute;n turbia de color amarillo, mal olor; dolor intenso en sitio de drenaje.</li>
  </ul>
  
  <p style="text-align: center;">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" width="200" height="200" />
  </p>

  <table border="1" style="width: 100%; border-collapse: collapse; border: 1px solid #000000;">
    <tbody>
      <tr>
        <th style="border: 1px solid #000000; padding: 8px; text-align: center;"><strong>Fecha</strong></th>
        <th style="border: 1px solid #000000; padding: 8px; text-align: center;"><strong>Cantidad</strong></th>
      </tr>
      <tr><td style="border: 1px solid #000000; padding: 8px;"><p></p></td><td style="border: 1px solid #000000; padding: 8px;"><p></p></td></tr>
      <tr><td style="border: 1px solid #000000; padding: 8px;"><p></p></td><td style="border: 1px solid #000000; padding: 8px;"><p></p></td></tr>
      <tr><td style="border: 1px solid #000000; padding: 8px;"><p></p></td><td style="border: 1px solid #000000; padding: 8px;"><p></p></td></tr>
      <tr><td style="border: 1px solid #000000; padding: 8px;"><p></p></td><td style="border: 1px solid #000000; padding: 8px;"><p></p></td></tr>
      <tr><td style="border: 1px solid #000000; padding: 8px;"><p></p></td><td style="border: 1px solid #000000; padding: 8px;"><p></p></td></tr>
    </tbody>
  </table>
</div>`;
    await htmlToDocx(html);
    console.log('Success full template');
  } catch (e) {
    console.error('Error full template:', e);
  }
}
test();
