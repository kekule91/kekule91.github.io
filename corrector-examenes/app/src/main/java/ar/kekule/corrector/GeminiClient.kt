package ar.kekule.corrector

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

enum class TipoReferencia(val etiqueta: String) {
    CLAVE("Clave de corrección"),
    PRUEBA_EN_BLANCO("Prueba en blanco"),
}

class GeminiClient(private val apiKey: String, private val modelo: String) {

    private val http = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(300, TimeUnit.SECONDS)
        .writeTimeout(120, TimeUnit.SECONDS)
        .build()

    private val json = Json { ignoreUnknownKeys = true; isLenient = true; coerceInputValues = true }

    suspend fun corregir(
        referencia: List<String>,
        tipoReferencia: TipoReferencia,
        examen: List<String>,
        idioma: Idioma,
        indicacionesExtra: String,
    ): ResultadoCorreccion = withContext(Dispatchers.IO) {
        val partes = buildJsonArray {
            add(texto(instrucciones(tipoReferencia, idioma, indicacionesExtra)))
            add(texto("=== REFERENCIA (${tipoReferencia.etiqueta}): ${referencia.size} imagen(es) ==="))
            referencia.forEach { add(imagen(it)) }
            add(texto("=== EXAMEN DEL ALUMNO: ${examen.size} imagen(es), en orden de páginas ==="))
            examen.forEach { add(imagen(it)) }
        }
        val cuerpo = buildJsonObject {
            put("contents", buildJsonArray {
                add(buildJsonObject {
                    put("role", "user")
                    put("parts", partes)
                })
            })
            putJsonObject("generationConfig") {
                put("responseMimeType", "application/json")
                put("temperature", 0.1)
            }
        }
        val url = "https://generativelanguage.googleapis.com/v1beta/models/$modelo:generateContent"
        val request = Request.Builder()
            .url(url)
            .header("x-goog-api-key", apiKey)
            .post(cuerpo.toString().toRequestBody("application/json".toMediaType()))
            .build()

        http.newCall(request).execute().use { resp ->
            val texto = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IllegalStateException(mensajeError(resp.code, texto))
            val raiz = json.parseToJsonElement(texto).jsonObject
            val candidato = (raiz["candidates"] as? JsonArray)?.firstOrNull()?.jsonObject
                ?: throw IllegalStateException("Gemini no devolvió respuesta (¿bloqueo de contenido?).")
            val salida = candidato["content"]?.jsonObject?.get("parts")?.jsonArray
                ?.joinToString("") { it.jsonObject["text"]?.jsonPrimitive?.content.orEmpty() }
                .orEmpty()
            json.decodeFromString(ResultadoCorreccion.serializer(), limpiarJson(salida))
        }
    }

    private fun texto(t: String) = buildJsonObject { put("text", t) }

    private fun imagen(base64: String) = buildJsonObject {
        putJsonObject("inline_data") {
            put("mime_type", "image/jpeg")
            put("data", base64)
        }
    }

    private fun limpiarJson(s: String): String {
        val inicio = s.indexOf('{')
        val fin = s.lastIndexOf('}')
        if (inicio < 0 || fin <= inicio) throw IllegalStateException("La respuesta no tiene formato JSON:\n$s")
        return s.substring(inicio, fin + 1)
    }

    private fun mensajeError(codigo: Int, cuerpo: String): String {
        val detalle = runCatching {
            (json.parseToJsonElement(cuerpo) as JsonObject)["error"]!!.jsonObject["message"]!!.jsonPrimitive.content
        }.getOrDefault(cuerpo.take(300))
        return when (codigo) {
            400, 403 -> "API key o solicitud inválida ($codigo): $detalle"
            404 -> "Modelo \"$modelo\" no encontrado. Cambialo en Ajustes. ($detalle)"
            429 -> "Se alcanzó el límite gratuito de Gemini. Esperá un minuto y reintentá. ($detalle)"
            else -> "Error $codigo de Gemini: $detalle"
        }
    }

    private fun instrucciones(tipo: TipoReferencia, idioma: Idioma, extra: String): String {
        val referencia = when (tipo) {
            TipoReferencia.CLAVE ->
                "La REFERENCIA es la clave de corrección del docente: contiene las respuestas correctas y el puntaje de cada ítem. " +
                    "Usá exactamente esos puntajes y criterios."
            TipoReferencia.PRUEBA_EN_BLANCO ->
                "La REFERENCIA es la prueba en blanco (sin resolver) con el puntaje impreso de cada ítem. " +
                    "Resolvé vos cada ítem para obtener la respuesta esperada y usá los puntajes impresos. " +
                    "Si algún ítem no tiene puntaje visible, repartí el total de forma razonable y avisalo en 'advertencias'."
        }
        return """
Sos un docente de Química/Fisicoquímica de secundaria en Argentina que corrige exámenes de alumnos extranjeros.
El examen del alumno está escrito A MANO en ${idioma.descripcion} (puede mezclar castellano, fórmulas químicas, números y dibujos).

$referencia

Tareas:
1. Transcribí con cuidado la letra manuscrita del alumno (cirílico o caracteres chinos) y traducila al castellano rioplatense neutro.
   Respetá fórmulas, unidades y números tal cual. No corrijas ni mejores la respuesta del alumno al traducir.
2. Corregí ítem por ítem según la referencia. Otorgá puntaje parcial cuando el razonamiento sea correcto aunque haya errores menores.
   Evaluá el contenido químico, no la calidad del idioma. Si una parte es ilegible, marcá "dudoso": true y explicalo.
3. Escribí una devolución breve y constructiva para el alumno en castellano y la misma devolución en el idioma del alumno.
${if (extra.isNotBlank()) "\nIndicaciones adicionales del docente: $extra\n" else ""}
Respondé SOLO con un objeto JSON con esta forma exacta:
{
  "idioma_detectado": "ruso" | "chino" | "otro",
  "alumno": "nombre si aparece en la hoja, si no vacío",
  "traduccion_completa": "traducción al castellano de todo lo que escribió el alumno, organizada por ítem",
  "items": [
    {
      "numero": "1a",
      "consigna": "resumen de la consigna en castellano",
      "respuesta_original": "transcripción literal del alumno en su idioma",
      "respuesta_traducida": "traducción al castellano",
      "respuesta_esperada": "respuesta correcta según la referencia",
      "puntaje_obtenido": 0.0,
      "puntaje_maximo": 0.0,
      "justificacion": "por qué se asignó ese puntaje",
      "dudoso": false
    }
  ],
  "devolucion_castellano": "...",
  "devolucion_idioma_alumno": "...",
  "advertencias": "problemas de legibilidad, páginas faltantes o dudas de corrección; vacío si no hay"
}
""".trimIndent()
    }
}
