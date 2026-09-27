package ar.kekule.corrector

import android.content.Context

class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("ajustes", Context.MODE_PRIVATE)

    var apiKey: String
        get() = sp.getString("api_key", "") ?: ""
        set(v) = sp.edit().putString("api_key", v.trim()).apply()

    var modelo: String
        get() = sp.getString("modelo", MODELO_POR_DEFECTO) ?: MODELO_POR_DEFECTO
        set(v) = sp.edit().putString("modelo", v.trim().ifEmpty { MODELO_POR_DEFECTO }).apply()

    var notaMaxima: Double
        get() = sp.getFloat("nota_max", 10f).toDouble()
        set(v) = sp.edit().putFloat("nota_max", v.toFloat()).apply()

    companion object {
        const val MODELO_POR_DEFECTO = "gemini-2.5-flash"
    }
}
