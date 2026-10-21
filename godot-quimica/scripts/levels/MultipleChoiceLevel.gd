extends BaseLevel
## Mecánica "multiple_choice": opciones con explicación específica por distractor.
##
## config:
##   opciones: [{"id": "a", "texto": "..."}]
##   mezclar: true para desordenar las opciones en cada partida
## respuesta_correcta: id de la opción correcta
## explicaciones: una entrada por id de distractor (+ "incompleto" y "default")

@onready var options_box: VBoxContainer = %Options

const LETTERS := "ABCDEFGH"

var buttons: Dictionary = {}  # id -> Button
var icons: Dictionary = {}  # id -> StatusIcon
var option_texts: Dictionary = {}  # id -> texto con letra
var selected_id := ""
var discarded: Array[String] = []
var _group := ButtonGroup.new()


func _build() -> void:
	var options: Array = get_config().get("opciones", []).duplicate()
	if bool(get_config().get("mezclar", false)):
		options.shuffle()
	for i in options.size():
		var option: Dictionary = options[i]
		var id := str(option.get("id"))
		option_texts[id] = "%s.  %s" % [LETTERS[i], option.get("texto", "")]
		options_box.add_child(_make_option(id))


func _make_option(id: String) -> Button:
	var button := Button.new()
	button.toggle_mode = true
	button.button_group = _group
	button.text = option_texts[id]
	button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.custom_minimum_size.y = AppTheme.MIN_TOUCH + 20
	# Espacio a la derecha para el ícono de estado.
	for state: String in ["normal", "hover", "pressed", "hover_pressed", "disabled", "focus"]:
		var style: StyleBox = get_theme_stylebox(state, "Button").duplicate()
		style.content_margin_right = 140
		button.add_theme_stylebox_override(state, style)
	button.toggled.connect(_on_option_toggled.bind(id))

	var icon := StatusIcon.new()
	icon.kind = "pending"
	icon.custom_minimum_size = Vector2(72, 72)
	icon.set_anchors_and_offsets_preset(Control.PRESET_CENTER_RIGHT)
	icon.offset_left = -112
	icon.offset_right = -40
	icon.offset_top = -36
	icon.offset_bottom = 36
	button.add_child(icon)
	buttons[id] = button
	icons[id] = icon
	return button


func _on_option_toggled(on: bool, id: String) -> void:
	if on:
		selected_id = id
	_refresh_icons()


## Ícono + texto por estado: elegida (punto), descartada (cruz), correcta (tilde).
func _refresh_icons() -> void:
	for id: String in buttons:
		var icon: StatusIcon = icons[id]
		if id in discarded:
			icon.kind = "error"
		elif solved and id == selected_id:
			icon.kind = "success"
		elif id == selected_id:
			icon.kind = "selected"
		else:
			icon.kind = "pending"


func get_answer() -> Variant:
	return selected_id


func _evaluate() -> Dictionary:
	if selected_id == "":
		return {"ok": false, "razon": REASON_INCOMPLETE}
	if selected_id == str(data.get("respuesta_correcta", "")):
		return {"ok": true}
	# La razón es el id del distractor: cada uno tiene su explicación.
	return {"ok": false, "razon": selected_id}


func _on_error_shown(reason: String) -> void:
	if buttons.has(reason) and not discarded.has(reason):
		discarded.append(reason)
		var button: Button = buttons[reason]
		button.text = option_texts[reason] + "\n(descartada)"
		button.set_pressed_no_signal(false)
		button.disabled = true
		selected_id = ""
	_refresh_icons()


func _on_success_shown() -> void:
	if buttons.has(selected_id):
		buttons[selected_id].text = option_texts[selected_id] + "\n(correcta)"
	_refresh_icons()


func _set_interactive(enabled: bool) -> void:
	for id: String in buttons:
		buttons[id].disabled = not enabled or id in discarded
