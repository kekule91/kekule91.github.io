extends Control
## Lista de niveles con estado (bloqueado / pendiente / completado + puntaje).

signal level_chosen(level_id: String)
signal back_requested

@onready var back_button: Button = %BackButton
@onready var total_label: Label = %TotalLabel
@onready var list: VBoxContainer = %List


func _ready() -> void:
	back_button.pressed.connect(back_requested.emit)
	total_label.text = "Puntaje total: %d · Pistas usadas: %d" % [GameState.get_total_score(), GameState.total_hints_used]
	for i in GameState.levels.size():
		list.add_child(_make_card(i, GameState.levels[i]))
	if GameState.levels.is_empty():
		var empty := Label.new()
		empty.text = "No se encontraron niveles válidos en data/levels.json."
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		list.add_child(empty)


func _make_card(index: int, level: Dictionary) -> Button:
	var level_id := str(level.get("id"))
	var unlocked := GameState.is_unlocked(level_id)
	var completed := GameState.is_completed(level_id)
	var progress := GameState.get_level_progress(level_id)

	var status_text := "Pendiente"
	var kind := "pending"
	if completed:
		status_text = "Completado · Mejor puntaje: %d de %d" % [int(progress.get("mejor_puntaje", 0)), int(level.get("puntaje_base", 100))]
		kind = "success"
	elif not unlocked:
		status_text = "Bloqueado: completá el nivel anterior"
		kind = "locked"

	var card := Button.new()
	card.text = "%d. %s\n%s · %s\n%s" % [
		index + 1, level.get("titulo", ""), level.get("concepto", ""),
		LevelRepository.MECHANIC_NAMES.get(level.get("mecanica"), ""), status_text,
	]
	card.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	card.alignment = HORIZONTAL_ALIGNMENT_LEFT
	card.disabled = not unlocked
	card.custom_minimum_size.y = 240
	for state: String in ["normal", "hover", "pressed", "hover_pressed", "disabled", "focus"]:
		var style: StyleBox = get_theme_stylebox(state, "Button").duplicate()
		style.content_margin_right = 150
		card.add_theme_stylebox_override(state, style)
	card.pressed.connect(level_chosen.emit.bind(level_id))

	var icon := StatusIcon.new()
	icon.kind = kind
	icon.custom_minimum_size = Vector2(88, 88)
	icon.set_anchors_and_offsets_preset(Control.PRESET_CENTER_RIGHT)
	icon.offset_left = -124
	icon.offset_right = -36
	icon.offset_top = -44
	icon.offset_bottom = 44
	card.add_child(icon)
	return card


func handle_back() -> bool:
	back_requested.emit()
	return true
