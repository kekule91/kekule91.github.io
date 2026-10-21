extends Control
## Menú principal: jugar, exportar el registro de intentos y borrar progreso.

signal play_requested

@onready var play_button: Button = %PlayButton
@onready var export_button: Button = %ExportButton
@onready var reset_button: Button = %ResetButton
@onready var status_row: HBoxContainer = %StatusRow
@onready var status_icon: StatusIcon = %StatusIcon
@onready var status_label: Label = %StatusLabel

var _reset_armed := false


func _ready() -> void:
	play_button.pressed.connect(play_requested.emit)
	export_button.pressed.connect(_on_export_pressed)
	reset_button.pressed.connect(_on_reset_pressed)
	status_row.visible = false
	play_button.grab_focus()
	# En Android viejos (< 10) escribir en Documentos requiere permiso explícito.
	if OS.get_name() == "Android":
		OS.request_permissions()


func _on_export_pressed() -> void:
	var result := Analytics.export_to_documents()
	_show_status("success" if result.ok else "info", result.mensaje)


## Borrar pide confirmación con un segundo toque.
func _on_reset_pressed() -> void:
	if not _reset_armed:
		_reset_armed = true
		reset_button.text = "Tocá de nuevo para confirmar"
		_show_status("info", "Se va a borrar el progreso y el puntaje. El registro de intentos se conserva.")
		return
	_reset_armed = false
	reset_button.text = "Borrar progreso"
	GameState.reset_progress()
	Analytics.log_event("progreso_borrado")
	_show_status("success", "Progreso borrado.")


func _show_status(kind: String, message: String) -> void:
	status_row.visible = true
	status_icon.kind = kind
	status_label.text = message


func handle_back() -> bool:
	return false  # En el menú, "atrás" cierra la app.
