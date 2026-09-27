package ar.kekule.corrector

import kotlinx.serialization.Serializable

enum class Idioma(val etiqueta: String, val descripcion: String) {
    AUTO("Detectar", "ruso o chino (detectalo)"),
    RUSO("Ruso", "ruso"),
    CHINO("Chino", "chino"),
}

@Serializable
data class ItemCorregido(
    val numero: String = "",
    val consigna: String = "",
    val respuesta_original: String = "",
    val respuesta_traducida: String = "",
    val respuesta_esperada: String = "",
    val puntaje_obtenido: Double = 0.0,
    val puntaje_maximo: Double = 0.0,
    val justificacion: String = "",
    val dudoso: Boolean = false,
)

@Serializable
data class ResultadoCorreccion(
    val idioma_detectado: String = "",
    val alumno: String = "",
    val traduccion_completa: String = "",
    val items: List<ItemCorregido> = emptyList(),
    val devolucion_castellano: String = "",
    val devolucion_idioma_alumno: String = "",
    val advertencias: String = "",
) {
    val total: Double get() = items.sumOf { it.puntaje_obtenido }
    val maximo: Double get() = items.sumOf { it.puntaje_maximo }
}
