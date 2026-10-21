# Química en Juego (Godot 4.3)

Juego educativo de química para Android (3.° y 4.° año de secundaria).
Orientación vertical 1080×1920, renderer **Compatibility**, GDScript puro y
sin dependencias externas.

## Contenido

| Nivel | Mecánica | Concepto |
|---|---|---|
| 1. Combustión del metano | `drag_drop` | Balanceo de ecuaciones: CH₄ + 2 O₂ → CO₂ + 2 H₂O |
| 2. ¿Qué une a la sal? | `multiple_choice` | Enlace iónico en NaCl y diferencia de electronegatividad |
| 3. El pH de un ácido fuerte | `slider` | pH de HCl 0,001 M (pH = 3) |

Cada nivel tiene 3 pistas escalonadas (cuestan 10, 15 y 25 puntos) y una
explicación específica para cada error frecuente: un elemento desbalanceado
(con el conteo de átomos), coeficientes que se pueden simplificar, cada
distractor de la opción múltiple, confundir pH con pOH, etc.

## Estructura

```
godot-quimica/
├── project.godot            # 1080×1920, canvas_items + expand, gl_compatibility, vertical
├── export_presets.cfg       # Preset "Android" (APK debug)
├── data/levels.json         # Definición declarativa de los niveles
├── scenes/
│   ├── Main.tscn            # Raíz: aplica el tema y cambia de pantalla
│   ├── MainMenu.tscn        # Jugar / exportar registro / borrar progreso
│   ├── LevelSelect.tscn     # Lista de niveles con estado y puntaje
│   ├── Level.tscn           # Contenedor de un nivel (enunciado + HUD + feedback)
│   ├── HUD.tscn             # Volver, título, puntaje, Pista, Comprobar
│   ├── FeedbackPanel.tscn   # Panel modal de éxito/error/pista
│   └── mechanics/           # Una escena por mecánica, reutilizable
│       ├── DragDropLevel.tscn
│       ├── MultipleChoiceLevel.tscn
│       └── SliderLevel.tscn
├── scripts/
│   ├── autoload/
│   │   ├── GameState.gd     # Niveles, progreso, puntaje, pistas usadas
│   │   ├── SaveSystem.gd    # user://save.json (escritura atómica)
│   │   └── Analytics.gd     # Registro local de intentos y exportación
│   ├── core/LevelRepository.gd  # Carga y valida levels.json; registro de mecánicas
│   ├── levels/
│   │   ├── BaseLevel.gd     # validate(), show_hint(), on_success(), on_error(reason)
│   │   ├── DragDropLevel.gd
│   │   ├── MultipleChoiceLevel.gd
│   │   └── SliderLevel.gd
│   ├── ui/                  # AppTheme, StatusIcon, Tile, Slot, ScaleBar
│   └── Main.gd, MainMenu.gd, LevelSelect.gd, Level.gd, HUD.gd, FeedbackPanel.gd
└── tests/smoke_test.gd      # Recorre los 3 niveles sin interfaz
```

### Decisiones de diseño

- **Feedback siempre explicativo.** `BaseLevel.on_error(reason)` busca
  `explicaciones[reason]` en `levels.json` y, si no existe, usa
  `explicaciones.default`. `LevelRepository` descarta cualquier nivel que no
  tenga `default`, así que nunca aparece un "incorrecto" a secas. Las
  explicaciones aceptan marcadores como `{izq}`, `{der}`, `{mcd}` o `{valor}`.
- **Respuesta incompleta ≠ error.** Si falta completar, se explica qué falta
  y no se descuentan puntos.
- **Color + ícono + texto.** Todos los estados (correcto, error, pista,
  bloqueado, elegida, descartada) usan `StatusIcon` (tilde, cruz, lamparita,
  candado, punto) y un texto. La escala de pH lleva números del 0 al 14 y las
  zonas ÁCIDO / NEUTRO / BÁSICO.
- **Táctil.** Todo control tocable mide al menos 132 px de viewport
  (≈ 48 dp en un teléfono de 1080 px de ancho). Las fichas se arrastran o se
  tocan (ficha → ranura), y el deslizador tiene botones ±0,1 y escala tocable.
- **Guardado automático** al completar cada nivel (`GameState.complete_level`).
- **Botón atrás de Android** manejado por cada pantalla (`handle_back()`).

## Agregar un nivel

Sumá un objeto a `niveles` en `data/levels.json`:

```jsonc
{
  "id": "n4_algo",                 // único
  "titulo": "…",
  "concepto": "…",
  "enunciado": "…",
  "mecanica": "drag_drop | multiple_choice | slider",
  "puntaje_base": 100,
  "puntaje_minimo": 10,
  "penalizacion_pista": [10, 15, 25],
  "penalizacion_error": 5,
  "config": { /* depende de la mecánica, ver abajo */ },
  "respuesta_correcta": …,
  "pistas": ["…", "…", "…"],       // exactamente 3, de la más general a la más concreta
  "explicaciones": { "incompleto": "…", "<razon>": "…", "default": "…" },
  "explicacion_exito": "…"
}
```

**drag_drop** — `config.modo: "balanceo"` cuenta átomos por elemento y genera
las razones `desbalance_<Elemento>` (datos `{izq}`, `{der}`) y `no_minimos`
(dato `{mcd}`). Con `modo: "exacto"` se compara contra `respuesta_correcta`
(`{"ranura": "valor"}`) y se pueden declarar `reglas_error`:
`[{"si": {"a": "2"}, "razon": "mi_error"}]`.

**multiple_choice** — `config.opciones: [{"id", "texto"}]`, `mezclar: true`.
`respuesta_correcta` es un id; cada distractor tiene su explicación con su id
como clave en `explicaciones`.

**slider** — `config`: `min`, `max`, `paso`, `decimales`, `valor_inicial`,
`etiqueta`, `unidad`, `escala` (`"ph"` o `"lineal"`) y `rangos_error`
(`[{"min", "max", "razon"}]`; gana el primero que coincida).
`respuesta_correcta: {"valor": 3.0, "tolerancia": 0.2}`.

Para una mecánica nueva: creá `scenes/mechanics/X.tscn` con un script que
herede de `BaseLevel` (implementando `_build()`, `_evaluate()` y
`get_answer()`) y registrala en `LevelRepository.MECHANIC_SCENES`.

## Registro de intentos (Analytics)

Cada evento (`nivel_iniciado`, `intento`, `pista`, `nivel_completado`,
`nivel_abandonado`) se guarda en `user://analytics_log.json` con fecha,
sesión, nivel, respuesta, razón del error y puntaje.

**Menú → Exportar registro de intentos** escribe
`quimica_en_juego_registro_AAAAMMDD_HHMMSS.json` en la carpeta **Documentos**
del dispositivo (`/storage/emulated/0/Documents`). En Android 10 o anterior
la app pide el permiso de almacenamiento al abrir. Si el sistema no deja
escribir en Documentos, el archivo queda en la carpeta interna de la app y la
pantalla muestra la ruta exacta.

## Probar

1. Abrí Godot 4.3 → **Importar** → elegí `godot-quimica/project.godot`.
2. **F5** para jugar. La ventana del editor arranca en 540×960 (la mitad);
   el juego escala a cualquier pantalla vertical.
3. Prueba de humo sin interfaz (ojo: borra el progreso guardado en esta PC):

   ```bash
   godot --headless --path . -s res://tests/smoke_test.gd
   ```

## Exportar el APK de Android (debug)

### 1. Plantillas de exportación

- **Desde el editor:** *Editor → Administrar plantillas de exportación →
  Descargar e instalar*. Tienen que ser de la misma versión (4.3.stable).
- **Sin conexión:** descargá `Godot_v4.3-stable_export_templates.tpz` de
  <https://godotengine.org/download/archive/4.3-stable/> y en la misma
  ventana usá *Instalar desde archivo*. Quedan en:
  - Linux: `~/.local/share/godot/export_templates/4.3.stable/`
  - Windows: `%APPDATA%\Godot\export_templates\4.3.stable\`
  - macOS: `~/Library/Application Support/Godot/export_templates/4.3.stable/`

### 2. JDK 17

Godot 4.3 necesita **OpenJDK 17** (por ejemplo, Eclipse Temurin 17).
Verificá con `java -version`.

### 3. Android SDK

**Opción A: Android Studio.** Instalalo y en *SDK Manager* marcá Android SDK
Platform 34, Android SDK Build-Tools 34, Android SDK Platform-Tools y Android
SDK Command-line Tools.

**Opción B: sólo línea de comandos.** Descargá las *command line tools* de
<https://developer.android.com/studio#command-tools>, descomprimilas en
`<SDK>/cmdline-tools/latest/` y ejecutá:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
  "platform-tools" "build-tools;34.0.0" "platforms;android-34" "cmdline-tools;latest"
```

### 4. Configurar Godot

*Editor → Configuración del editor → Exportar → Android*:

- **Java SDK Path:** carpeta del JDK 17.
- **Android SDK Path:** la carpeta del SDK (`$ANDROID_HOME`).
- **Debug Keystore:** si el exportador avisa que falta, crealo y cargalo con
  usuario `androiddebugkey` y contraseña `android`:

  ```bash
  keytool -keyalg RSA -genkeypair -alias androiddebugkey -keypass android \
    -keystore debug.keystore -storepass android \
    -dname "CN=Android Debug,O=Android,C=US" -validity 9999 -deststoretype pkcs12
  ```

### 5. Exportar

- **Editor:** *Proyecto → Exportar… → Android → Exportar proyecto* y dejá
  marcado *Exportar con depuración*. Sale `build/QuimicaEnJuego-debug.apk`.
- **Línea de comandos:**

  ```bash
  mkdir -p build
  godot --headless --path . --export-debug "Android" build/QuimicaEnJuego-debug.apk
  ```

Para instalarlo, activá la *Depuración USB* en el teléfono y ejecutá
`adb install -r build/QuimicaEnJuego-debug.apk`, o copiá el APK al teléfono y
abrilo (hay que permitir *instalar apps de origen desconocido*). También
podés usar el botón **Implementación remota** (ícono de Android) del editor
con el teléfono conectado.

El preset exporta para `arm64-v8a` y `armeabi-v7a`, incluye `data/*.json`
y deja afuera `tests/` y los `.md`.
