class_name Slot
extends Button
## Ranura que recibe una ficha (por arrastre o tocando ficha y luego ranura).
## Vacía muestra "?"; llena muestra el valor. Tocarla llena la vacía.

signal value_dropped(slot: Slot)

const EMPTY_TEXT := "?"

var slot_id := ""
var value := ""
var locked := false


func setup(id: String) -> void:
	slot_id = id
	add_theme_font_size_override("font_size", 60)
	custom_minimum_size = Vector2(AppTheme.MIN_TOUCH, AppTheme.MIN_TOUCH)
	_refresh()


func set_value(new_value: String) -> void:
	value = new_value
	_refresh()


func clear() -> void:
	set_value("")


func is_empty() -> bool:
	return value == ""


func set_locked(is_locked: bool) -> void:
	locked = is_locked
	disabled = is_locked


func _can_drop_data(_at_position: Vector2, data: Variant) -> bool:
	return not locked and data is Dictionary and data.get("tipo", "") == "ficha"


func _drop_data(_at_position: Vector2, data: Variant) -> void:
	set_value(str(data["valor"]))
	value_dropped.emit(self)


func _refresh() -> void:
	# Vacía: borde punteado simulado con borde grueso azul + "?"; llena: valor.
	text = EMPTY_TEXT if is_empty() else value
	tooltip_text = "Ranura vacía" if is_empty() else "Ranura con %s (tocá para vaciar)" % value
	var style := AppTheme.box(AppTheme.COLOR_BG, AppTheme.COLOR_PRIMARY, 5, 20, 24) if is_empty() \
		else AppTheme.box(AppTheme.COLOR_SURFACE_2, AppTheme.COLOR_TEXT, 3, 20, 24)
	AppTheme.style_button(self, style)
	add_theme_color_override("font_color", AppTheme.COLOR_TEXT_MUTED if is_empty() else AppTheme.COLOR_TEXT)
