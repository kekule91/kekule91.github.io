package ar.kekule.corrector

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.util.Base64
import androidx.core.content.FileProvider
import java.io.ByteArrayOutputStream
import java.io.File

object Imagenes {
    private const val LADO_MAXIMO = 2048

    /** Decodifica (respetando la rotación EXIF), achica y devuelve JPEG en base64. */
    fun aBase64(context: Context, uri: Uri): String {
        val fuente = ImageDecoder.createSource(context.contentResolver, uri)
        val bitmap = ImageDecoder.decodeBitmap(fuente) { decoder, info, _ ->
            val (w, h) = info.size.width to info.size.height
            val escala = LADO_MAXIMO.toDouble() / maxOf(w, h)
            if (escala < 1) decoder.setTargetSize((w * escala).toInt(), (h * escala).toInt())
            decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
        }
        val salida = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, salida)
        return Base64.encodeToString(salida.toByteArray(), Base64.NO_WRAP)
    }

    /** Uri temporal donde la cámara guarda la foto. */
    fun nuevaUriFoto(context: Context): Uri {
        val dir = File(context.cacheDir, "fotos").apply { mkdirs() }
        val archivo = File.createTempFile("foto_", ".jpg", dir)
        return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", archivo)
    }
}
