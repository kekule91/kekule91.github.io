class_name ScaleBar
extends Control
## Escala numérica con marcador. En modo "ph" pinta los colores del
## indicador universal, pero cada tramo lleva su número y el nombre de la zona
## (ácido / neutro / básico), así que no depende del color.
## Tocar la escala mueve el valor a ese punto.

signal value_picked(value: float)

var min_value := 0.0
var max_value := 14.0
var value := 7.0
var mode := "ph"
var enabled := true

const PH_COLORS := [
	"#e31a1c", "#ef3b2c", "#f46d43", "#fb8d3d", "#fdae61", "#fee08b", "#d9ef8b",
	"#a6d96a", "#66bd63", "#1a9850", "#35978f", "#3288bd", "#5e4fa2", "#6a3d9a", "#4a1486",
]
const BAR_TOP := 56.0
const BAR_HEIGHT := 64.0


func _init() -> void:
	custom_minimum_size = Vector2(0, 250)


func configure(min_v: float, max_v: float, scale_mode: String) -> void:
	min_value = min_v
	max_value = max_v
	mode = scale_mode
	queue_redraw()


func set_value(v: float) -> void:
	value = v
	queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if not enabled:
		return
	var pressed: bool = event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT
	var dragged: bool = event is InputEventMouseMotion and (event.button_mask & MOUSE_BUTTON_MASK_LEFT) != 0
	if pressed or dragged:
		value_picked.emit(_value_for(event.position.x))
		accept_event()


func _left() -> float:
	return 24.0


func _right() -> float:
	return size.x - 24.0


## En modo pH cada entero ocupa un tramo de color y su valor cae en el centro
## del tramo; en los demás modos la escala es lineal de borde a borde.
func _is_segmented() -> bool:
	return mode == "ph" and int(round(max_value - min_value)) == 14


func _x_for(v: float) -> float:
	if _is_segmented():
		return _left() + (v - min_value + 0.5) * (_right() - _left()) / 15.0
	return lerpf(_left(), _right(), inverse_lerp(min_value, max_value, v))


func _value_for(x: float) -> float:
	var v: float
	if _is_segmented():
		v = min_value + (x - _left()) / ((_right() - _left()) / 15.0) - 0.5
	else:
		v = lerpf(min_value, max_value, (x - _left()) / (_right() - _left()))
	return clampf(v, min_value, max_value)


func _draw() -> void:
	var font := get_theme_default_font()
	var width := _right() - _left()
	var integer_steps := int(round(max_value - min_value))

	# Barra (por tramos en pH, gradiente simple en otros modos).
	if _is_segmented():
		var seg := width / 15.0
		for i in 15:
			draw_rect(Rect2(_left() + i * seg, BAR_TOP, seg + 1.0, BAR_HEIGHT), Color(PH_COLORS[i]))
	else:
		draw_rect(Rect2(_left(), BAR_TOP, width, BAR_HEIGHT), AppTheme.COLOR_SURFACE_2)
	draw_rect(Rect2(_left(), BAR_TOP, width, BAR_HEIGHT), AppTheme.COLOR_TEXT, false, 2.0)

	# Números bajo la barra.
	var step := 1 if integer_steps <= 20 else int(ceil(integer_steps / 10.0))
	var n := int(min_value)
	while n <= int(max_value):
		var x := _x_for(n)
		draw_string(font, Vector2(x - 30, BAR_TOP + BAR_HEIGHT + 44), str(n), HORIZONTAL_ALIGNMENT_CENTER, 60, 32, AppTheme.COLOR_TEXT)
		n += step

	if mode == "ph":
		var y := BAR_TOP + BAR_HEIGHT + 96
		draw_string(font, Vector2(_left(), y), "ÁCIDO", HORIZONTAL_ALIGNMENT_LEFT, -1, 30, AppTheme.COLOR_TEXT_MUTED)
		draw_string(font, Vector2(_x_for(7.0) - 100, y), "NEUTRO", HORIZONTAL_ALIGNMENT_CENTER, 200, 30, AppTheme.COLOR_TEXT_MUTED)
		draw_string(font, Vector2(_right() - 200, y), "BÁSICO", HORIZONTAL_ALIGNMENT_RIGHT, 200, 30, AppTheme.COLOR_TEXT_MUTED)

	# Marcador del valor actual: triángulo + línea.
	var mx := _x_for(value)
	draw_colored_polygon(PackedVector2Array([Vector2(mx - 22, 8), Vector2(mx + 22, 8), Vector2(mx, BAR_TOP - 4)]), AppTheme.COLOR_TEXT)
	draw_line(Vector2(mx, BAR_TOP - 4), Vector2(mx, BAR_TOP + BAR_HEIGHT + 4), AppTheme.COLOR_TEXT, 6.0)
	draw_line(Vector2(mx, BAR_TOP), Vector2(mx, BAR_TOP + BAR_HEIGHT), AppTheme.COLOR_BG, 2.0)
