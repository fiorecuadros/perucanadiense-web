function envolver({ titulo, cuerpo, pie }) {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f4f3f8;font-family:Arial,sans-serif;color:#44425a">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f8;padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e7e6f0">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;color:#ff6600;font-weight:700">
                  IESPP PERUANO CANADIENSE
                </p>
                <h1 style="margin:0 0 16px;font-size:20px;color:#44425a">${titulo}</h1>
                ${cuerpo}
                <p style="margin:24px 0 0;font-size:12px;color:#6c6a74">${pie}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** El texto del panel llega crudo: en un correo HTML hay que neutralizarlo. */
function escapar(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fila(etiqueta, valor) {
  if (valor === undefined || valor === null || valor === '') return '';
  return `<tr>
    <td style="padding:6px 0;color:#6c6a74;width:160px;vertical-align:top">${etiqueta}</td>
    <td style="padding:6px 0;color:#44425a">${escapar(valor)}</td>
  </tr>`;
}

function tabla(filas) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filas}</table>`;
}

function acuseMesa({ codigo, datos }) {
  const cuerpo = `
    <p>Hemos recibido su documento por la Mesa de Partes Virtual.</p>
    <p style="font-size:22px;font-weight:700;margin:12px 0">Código ${codigo}</p>
    ${tabla(
      fila('Remitente', datos.nombres) +
        fila('DNI', datos.dni) +
        fila('Asunto', datos.asunto) +
        fila('Tipo de documento', datos.tipoDoc),
    )}
    <p style="margin-top:16px">Conserve este código para el seguimiento. El trámite se atiende en el horario institucional.</p>
  `;
  return envolver({
    titulo: 'Acuse de recibo — Mesa de partes',
    cuerpo,
    pie: 'Este mensaje es automático. No responda a este correo.',
  });
}

function avisoMesa({ codigo, datos }) {
  const cuerpo = `
    <p>Ingresó un trámite por la Mesa de Partes Virtual.</p>
    <p style="font-size:22px;font-weight:700;margin:12px 0">${codigo}</p>
    ${tabla(
      fila('Remitente', datos.nombres) +
        fila('Condición', datos.condicion) +
        fila('DNI', datos.dni) +
        fila('Correo', datos.correo) +
        fila('Teléfono', datos.telefono) +
        fila('Documento', datos.tipoDoc) +
        fila('Folios', datos.folios) +
        fila('Asunto', datos.asunto) +
        fila('Mensaje', datos.mensaje),
    )}
  `;
  return envolver({
    titulo: 'Nuevo trámite en mesa de partes',
    cuerpo,
    pie: 'Ábralo desde /admin/mesa-de-partes.',
  });
}

function acuseReclamo({ codigo, datos }) {
  const cuerpo = `
    <p>Su hoja de reclamación quedó registrada. El plazo máximo de respuesta es de 30 días calendario.</p>
    <p style="font-size:22px;font-weight:700;margin:12px 0">Código ${codigo}</p>
    ${tabla(
        fila('Nombre', `${datos.nombres || ''} ${datos.apellidos || ''}`.trim()) +
        fila('Tipo', datos.tipoReclamo) +
        fila('Bien', datos.tipoBien) +
        fila('Documento', `${datos.tipoDocumento || ''} ${datos.numeroDocumento || ''}`.trim()),
    )}
  `;
  return envolver({
    titulo: 'Libro de reclamaciones — acuse',
    cuerpo,
    pie: 'Este mensaje es automático. Conservé su código.',
  });
}

function avisoReclamo({ codigo, datos }) {
  const cuerpo = `
    <p>Ingresó una hoja al Libro de Reclamaciones.</p>
    <p style="font-size:22px;font-weight:700;margin:12px 0">${codigo}</p>
    ${tabla(
        fila('Nombre', `${datos.nombres || ''} ${datos.apellidos || ''}`.trim()) +
        fila('Tipo', datos.tipoReclamo) +
        fila('Bien', datos.tipoBien) +
        fila('Descripción del bien', datos.descripcionBien) +
        fila('Documento', `${datos.tipoDocumento || ''} ${datos.numeroDocumento || ''}`.trim()) +
        fila('Correo', datos.email) +
        fila('Teléfono', datos.telefono) +
        fila('Dirección', datos.direccion) +
        fila('Detalle', datos.detalleReclamo) +
        fila('Pedido', datos.pedido),
    )}
  `;
  return envolver({
    titulo: 'Nuevo reclamo',
    cuerpo,
    pie: 'Ábralo desde /admin/reclamaciones.',
  });
}

/**
 * Respuesta del instituto a un trámite. Es el único correo que sale del panel
 * (los demás los dispara el propio ciudadano al registrar): lo manda un humano
 * a propósito, marcando la casilla del detalle, no el sistema por su cuenta.
 */
function respuestaTramite({ codigo, etiqueta, nombre, estado, respuesta }) {
  const cuerpo = `
    <p>${nombre ? `Estimado(a) ${escapar(nombre)}:` : 'Estimado(a) solicitante:'}</p>
    <p>Su solicitud registrada en <strong>${escapar(etiqueta)}</strong> fue atendida.</p>
    ${tabla(fila('Código', codigo) + fila('Estado', estado))}
    ${
      respuesta
        ? `<p style="margin:20px 0 6px;font-weight:700">Respuesta del instituto</p>
           <div style="padding:14px 16px;background:#f4f3f8;border-left:3px solid #ff6600;border-radius:6px;white-space:pre-wrap">${escapar(
             respuesta,
           )}</div>`
        : ''
    }
    <p style="margin-top:20px">Puede consultar el estado en el portal con su código ${escapar(codigo)}.</p>
  `;
  return envolver({
    titulo: `${etiqueta} — respuesta a su solicitud ${codigo}`,
    cuerpo,
    pie: 'Este mensaje es automático. Si necesita ampliar su caso, presente una nueva solicitud citando este código.',
  });
}

function textoPlano(datos) {
  return Object.entries(datos)
    .map(([campo, valor]) => `${campo}: ${valor ?? ''}`)
    .join('\n');
}

module.exports = { acuseMesa, avisoMesa, acuseReclamo, avisoReclamo, respuestaTramite, textoPlano };
