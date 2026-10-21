class_name Tile
extends Button
## Ficha arrastrable (coeficiente, átomo, ion...).
## Se puede arrastrar a una Slot o tocar para seleccionarla y después tocar la ranura.

var value := ""


func setup(tile_value: String) -> void:
	value = tile_value
	text = tile_value
	toggle_mode = true
	tooltip_text = "Ficha %s" % tile_value
	add_theme_font_size_override("font_size", 60)
	custom_minimum_size = Vector2(AppTheme.MIN_TOUCH + 24, AppTheme.MIN_TOUCH + 24)


func _get_drag_data(_at_position: Vector2) -> Variant:
	set_drag_preview(_make_preview())
	return {"tipo": "ficha", "valor": value}


func _make_preview() -> Control:
	# La vista previa se centra bajo el dedo para que no la tape.
	var holder := Control.new()
	var chip := Label.new()
	chip.text = value
	chip.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	chip.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	chip.add_theme_font_size_override("font_size", 60)
	chip.add_theme_stylebox_override("normal", AppTheme.box(AppTheme.COLOR_PRIMARY, AppTheme.COLOR_TEXT, 4, 24, 0))
	chip.size = size
	chip.position = -size * 0.5 - Vector2(0, size.y * 0.6)
	chip.modulate.a = 0.9
	holder.add_child(chip)
	return holder
