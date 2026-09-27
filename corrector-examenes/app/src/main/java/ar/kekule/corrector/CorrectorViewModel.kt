package ar.kekule.corrector

import android.app.Application
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.math.round

class CorrectorViewModel(app: Application) : AndroidViewModel(app) {
    val prefs = Prefs(app)

    val fotosReferencia = mutableStateListOf<Uri>()
    val fotosExamen = mutableStateListOf<Uri>()
    var tipoReferencia by mutableStateOf(TipoReferencia.CLAVE)
    var idioma by mutableStateOf(Idioma.RUSO)
    var indicaciones by mutableStateOf("")

    var procesando by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
    var resultado by mutableStateOf<ResultadoCorreccion?>(null)

    fun corregir() {
        if (prefs.apiKey.isBlank()) { error = "Cargá tu API key de Gemini en Ajustes."; return }
        if (fotosReferencia.isEmpty()) { error = "Agregá al menos una foto de la clave o de la prueba en blanco."; return }
        if (fotosExamen.isEmpty()) { error = "Agregá las fotos del examen del alumno."; return }
        procesando = true
        error = null
        viewModelScope.launch {
            try {
                val ctx = getApplication<Application>()
                val (ref, exa) = withContext(Dispatchers.Default) {
                    fotosReferencia.map { Imagenes.aBase64(ctx, it) } to fotosExamen.map { Imagenes.aBase64(ctx, it) }
                }
                resultado = GeminiClient(prefs.apiKey, prefs.modelo)
                    .corregir(ref, tipoReferencia, exa, idioma, indicaciones)
            } catch (e: Exception) {
                error = e.message ?: e.toString()
            } finally {
                procesando = false
            }
        }
    }

    /** El docente puede ajustar a mano el puntaje que propuso la IA. */
    fun ajustarPuntaje(indice: Int, valor: Double) {
        val r = resultado ?: return
        val item = r.items[indice]
        val nuevo = valor.coerceIn(0.0, item.puntaje_maximo)
        resultado = r.copy(items = r.items.toMutableList().also { it[indice] = item.copy(puntaje_obtenido = nuevo) })
    }

    /** Nota proporcional al puntaje, redondeada a 0,5. */
    fun nota(r: ResultadoCorreccion): Double =
        if (r.maximo <= 0) 0.0 else round(r.total / r.maximo * prefs.notaMaxima * 2) / 2

    /** Mantiene la clave para corregir al siguiente alumno. */
    fun siguienteAlumno() {
        fotosExamen.clear()
        resultado = null
        error = null
    }

    fun textoParaCompartir(r: ResultadoCorreccion): String = buildString {
        appendLine("CORRECCIÓN${if (r.alumno.isNotBlank()) " – ${r.alumno}" else ""}")
        appendLine("Puntaje: ${fmt(r.total)} / ${fmt(r.maximo)} — Nota: ${fmt(nota(r))}")
        appendLine()
        r.items.forEach {
            appendLine("Ítem ${it.numero}: ${fmt(it.puntaje_obtenido)}/${fmt(it.puntaje_maximo)}${if (it.dudoso) " (revisar)" else ""}")
            appendLine("  Respuesta: ${it.respuesta_traducida}")
            appendLine("  ${it.justificacion}")
        }
        appendLine()
        appendLine("Devolución:")
        appendLine(r.devolucion_castellano)
        appendLine()
        appendLine(r.devolucion_idioma_alumno)
    }
}

fun fmt(x: Double): String =
    if (x == x.toLong().toDouble()) x.toLong().toString() else "%.2f".format(x).trimEnd('0').replace('.', ',')
