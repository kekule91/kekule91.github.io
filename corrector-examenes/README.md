# Corrector de exámenes (Android)

App para fotografiar exámenes manuscritos en **ruso o chino**, traducirlos al castellano
y corregirlos según la clave de corrección o la prueba en blanco con los puntajes.
Usa la API de **Gemini** (nivel gratuito de Google AI Studio).

## Abrir y compilar
1. Android Studio → *Open* → elegir la carpeta `corrector-examenes/`.
2. Esperar la sincronización de Gradle y tocar ▶ con el celular conectado (depuración USB),
   o *Build → Build APK(s)*.

## Primer uso
1. Crear una API key gratuita en https://aistudio.google.com/apikey.
2. En la app: ⚙ Ajustes → pegar la API key. Modelo por defecto: `gemini-2.5-flash`
   (si Google lo cambia, escribir el nombre nuevo acá). Nota máxima: 10.

## Flujo
1. **Referencia**: foto de la *clave de corrección* (respuestas + puntajes) o de la *prueba en blanco*
   (la IA la resuelve y usa los puntajes impresos). Se conserva entre alumnos.
2. **Idioma**: ruso, chino o detectar.
3. **Examen**: todas las páginas del alumno, en orden (cámara o galería).
4. **Traducir y corregir** → puntaje por ítem con justificación, nota proporcional (redondeada a 0,5),
   traducción completa y devolución en castellano y en el idioma del alumno.
5. Los puntajes se pueden **ajustar a mano**; los ítems poco legibles aparecen con "Revisar".
6. *Compartir* envía la corrección como texto (WhatsApp, mail, Classroom…). *Siguiente alumno* mantiene la clave.

## Notas
- Las fotos se envían a Google para procesarlas. En el nivel gratuito Google puede usar los datos
  para mejorar sus productos; evitar datos personales sensibles o usar una cuenta con facturación.
- El límite gratuito tiene cupo por minuto y por día; si aparece "límite", esperar y reintentar.
- La IA puede equivocarse al leer letra manuscrita: revisar siempre los ítems marcados y la nota final.
