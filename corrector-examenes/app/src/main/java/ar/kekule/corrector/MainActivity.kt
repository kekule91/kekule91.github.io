package ar.kekule.corrector

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage

private val Azul = Color(0xFF1F4E9C)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Azul)) {
                App()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(vm: CorrectorViewModel = viewModel()) {
    var mostrarAjustes by remember { mutableStateOf(vm.prefs.apiKey.isBlank()) }
    val resultado = vm.resultado

    BackHandler(enabled = resultado != null) { vm.resultado = null }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (resultado == null) "Corrector de exámenes" else "Resultado") },
                navigationIcon = {
                    if (resultado != null) IconButton(onClick = { vm.resultado = null }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = { mostrarAjustes = true }) { Icon(Icons.Default.Settings, "Ajustes") }
                },
            )
        },
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            if (resultado == null) PantallaCarga(vm) else PantallaResultado(vm, resultado)
            if (vm.procesando) {
                Surface(Modifier.fillMaxSize(), color = Color.Black.copy(alpha = 0.4f)) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                        CircularProgressIndicator(color = Color.White)
                        Spacer(Modifier.height(12.dp))
                        Text("Leyendo, traduciendo y corrigiendo…", color = Color.White)
                        Text("Puede tardar hasta un minuto", color = Color.White)
                    }
                }
            }
        }
    }

    if (mostrarAjustes) DialogoAjustes(vm.prefs) { mostrarAjustes = false }

    vm.error?.let { msg ->
        AlertDialog(
            onDismissRequest = { vm.error = null },
            confirmButton = { TextButton(onClick = { vm.error = null }) { Text("OK") } },
            title = { Text("Atención") },
            text = { Text(msg) },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PantallaCarga(vm: CorrectorViewModel) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Seccion("1. Referencia de corrección") {
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                TipoReferencia.entries.forEachIndexed { i, t ->
                    SegmentedButton(
                        selected = vm.tipoReferencia == t,
                        onClick = { vm.tipoReferencia = t },
                        shape = SegmentedButtonDefaults.itemShape(i, TipoReferencia.entries.size),
                    ) { Text(t.etiqueta) }
                }
            }
            Text(
                if (vm.tipoReferencia == TipoReferencia.CLAVE)
                    "Foto de la clave con respuestas y puntaje por ítem. Se conserva para corregir a varios alumnos."
                else "Foto de la prueba sin resolver con los puntajes impresos. La IA resuelve la prueba.",
                style = MaterialTheme.typography.bodySmall,
            )
            SelectorFotos(vm.fotosReferencia)
        }

        Seccion("2. Idioma del alumno") {
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                Idioma.entries.forEachIndexed { i, idioma ->
                    SegmentedButton(
                        selected = vm.idioma == idioma,
                        onClick = { vm.idioma = idioma },
                        shape = SegmentedButtonDefaults.itemShape(i, Idioma.entries.size),
                    ) { Text(idioma.etiqueta) }
                }
            }
        }

        Seccion("3. Examen del alumno (todas las páginas, en orden)") {
            SelectorFotos(vm.fotosExamen)
        }

        OutlinedTextField(
            value = vm.indicaciones,
            onValueChange = { vm.indicaciones = it },
            label = { Text("Indicaciones extra (opcional)") },
            placeholder = { Text("Ej.: no descontar por unidades en el ítem 3") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )

        Button(
            onClick = vm::corregir,
            enabled = !vm.procesando,
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) {
            Icon(Icons.Default.AutoFixHigh, null)
            Spacer(Modifier.width(8.dp))
            Text("Traducir y corregir")
        }
    }
}

@Composable
private fun Seccion(titulo: String, contenido: @Composable ColumnScope.() -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(titulo, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            contenido()
        }
    }
}

@Composable
private fun SelectorFotos(fotos: MutableList<Uri>) {
    val context = LocalContext.current
    var pendiente by remember { mutableStateOf<Uri?>(null) }

    val camara = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok ->
        pendiente?.let { if (ok) fotos.add(it) }
        pendiente = null
    }
    val galeria = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(20)) { uris ->
        fotos.addAll(uris)
    }

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedButton(onClick = {
            val uri = Imagenes.nuevaUriFoto(context)
            pendiente = uri
            camara.launch(uri)
        }) { Icon(Icons.Default.PhotoCamera, null); Spacer(Modifier.width(6.dp)); Text("Cámara") }
        OutlinedButton(onClick = {
            galeria.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
        }) { Icon(Icons.Default.PhotoLibrary, null); Spacer(Modifier.width(6.dp)); Text("Galería") }
    }
    if (fotos.isNotEmpty()) {
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            itemsIndexed(fotos.toList()) { i, uri ->
                Box {
                    AsyncImage(
                        model = uri,
                        contentDescription = "Página ${i + 1}",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.size(90.dp, 120.dp).clip(RoundedCornerShape(8.dp)),
                    )
                    Text(
                        "${i + 1}",
                        color = Color.White,
                        modifier = Modifier.align(Alignment.BottomStart).padding(4.dp),
                        fontWeight = FontWeight.Bold,
                    )
                    IconButton(
                        onClick = { fotos.removeAt(i) },
                        modifier = Modifier.align(Alignment.TopEnd).size(28.dp),
                        colors = IconButtonDefaults.iconButtonColors(containerColor = Color.Black.copy(alpha = 0.5f)),
                    ) { Icon(Icons.Default.Close, "Quitar", tint = Color.White, modifier = Modifier.size(16.dp)) }
                }
            }
        }
    }
}

@Composable
private fun PantallaResultado(vm: CorrectorViewModel, r: ResultadoCorreccion) {
    val context = LocalContext.current
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Card(colors = CardDefaults.cardColors(containerColor = Azul, contentColor = Color.White)) {
            Column(Modifier.fillMaxWidth().padding(16.dp)) {
                if (r.alumno.isNotBlank()) Text(r.alumno, style = MaterialTheme.typography.titleMedium)
                Text("Nota: ${fmt(vm.nota(r))}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Puntaje: ${fmt(r.total)} / ${fmt(r.maximo)}  ·  Idioma: ${r.idioma_detectado}")
            }
        }

        if (r.advertencias.isNotBlank()) {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3CD))) {
                Row(Modifier.padding(12.dp)) {
                    Icon(Icons.Default.Warning, null, tint = Color(0xFF8A6D00))
                    Spacer(Modifier.width(8.dp))
                    Text(r.advertencias)
                }
            }
        }

        Text("Ítems (podés ajustar el puntaje)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        r.items.forEachIndexed { i, item -> TarjetaItem(item) { vm.ajustarPuntaje(i, it) } }

        Seccion("Devolución") {
            Text(r.devolucion_castellano)
            HorizontalDivider()
            Text(r.devolucion_idioma_alumno)
        }

        var verTraduccion by remember { mutableStateOf(false) }
        Seccion("Traducción completa") {
            TextButton(onClick = { verTraduccion = !verTraduccion }) {
                Text(if (verTraduccion) "Ocultar" else "Mostrar")
            }
            if (verTraduccion) Text(r.traduccion_completa)
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, vm.textoParaCompartir(r))
                }
                context.startActivity(Intent.createChooser(intent, "Compartir corrección"))
            }, modifier = Modifier.weight(1f)) { Icon(Icons.Default.Share, null); Spacer(Modifier.width(6.dp)); Text("Compartir") }
            Button(onClick = vm::siguienteAlumno, modifier = Modifier.weight(1f)) {
                Text("Siguiente alumno")
            }
        }
    }
}

@Composable
private fun TarjetaItem(item: ItemCorregido, onPuntaje: (Double) -> Unit) {
    var texto by remember(item.puntaje_obtenido) { mutableStateOf(fmt(item.puntaje_obtenido)) }
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Ítem ${item.numero}", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                if (item.dudoso) AssistChip(onClick = {}, label = { Text("Revisar") },
                    leadingIcon = { Icon(Icons.Default.Visibility, null, Modifier.size(16.dp)) })
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(
                    value = texto,
                    onValueChange = { nuevo ->
                        texto = nuevo
                        nuevo.replace(',', '.').toDoubleOrNull()?.let(onPuntaje)
                    },
                    modifier = Modifier.width(80.dp),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                )
                Text(" / ${fmt(item.puntaje_maximo)}")
            }
            if (item.consigna.isNotBlank()) Text(item.consigna, style = MaterialTheme.typography.bodySmall)
            Etiqueta("Original", item.respuesta_original)
            Etiqueta("Traducción", item.respuesta_traducida)
            Etiqueta("Esperado", item.respuesta_esperada)
            Etiqueta("Criterio", item.justificacion)
        }
    }
}

@Composable
private fun Etiqueta(titulo: String, valor: String) {
    if (valor.isBlank()) return
    Text("$titulo: ", style = MaterialTheme.typography.labelMedium, color = Azul)
    Text(valor, style = MaterialTheme.typography.bodyMedium)
}

@Composable
private fun DialogoAjustes(prefs: Prefs, onCerrar: () -> Unit) {
    var key by remember { mutableStateOf(prefs.apiKey) }
    var modelo by remember { mutableStateOf(prefs.modelo) }
    var notaMax by remember { mutableStateOf(fmt(prefs.notaMaxima)) }
    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onCerrar,
        title = { Text("Ajustes") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("API key gratuita de Google AI Studio:", style = MaterialTheme.typography.bodySmall)
                TextButton(onClick = {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://aistudio.google.com/apikey")))
                }) { Text("Obtener API key") }
                OutlinedTextField(key, { key = it }, label = { Text("API key") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation())
                OutlinedTextField(modelo, { modelo = it }, label = { Text("Modelo") }, singleLine = true)
                OutlinedTextField(notaMax, { notaMax = it }, label = { Text("Nota máxima") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            }
        },
        confirmButton = {
            TextButton(onClick = {
                prefs.apiKey = key
                prefs.modelo = modelo
                notaMax.replace(',', '.').toDoubleOrNull()?.takeIf { it > 0 }?.let { prefs.notaMaxima = it }
                onCerrar()
            }) { Text("Guardar") }
        },
        dismissButton = { TextButton(onClick = onCerrar) { Text("Cancelar") } },
    )
}
