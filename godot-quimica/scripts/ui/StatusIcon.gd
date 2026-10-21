class_name StatusIcon
extends Control
## Ícono de estado dibujado por código. Acompaña siempre a los colores para
## que la información no dependa de distinguir colores.
##   success: tilde | error: cruz | hint: lamparita | info: "i"
##   locked: candado | pending: anillo vacío | selected: punto (opción elegida)

@export_enum("success", "error", "hint", "info", "locked", "pending", "selected") var kind: String = "info":
	set(value):
		kind = value
		queue_redraw()


func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	if custom_minimum_size == Vector2.ZERO:
		custom_minimum_size = Vector2(72, 72)


func _draw() -> void:
	var s := minf(size.x, size.y)
	var c := size * 0.5
	var r := s * 0.5
	var fg := Color.WHITE
	var w := maxf(3.0, s * 0.09)
	draw_circle(c, r, AppTheme.color_for(kind))
	match kind:
		"success":
			draw_polyline(PackedVector2Array([c + Vector2(-0.45, 0.02) * r, c + Vector2(-0.12, 0.36) * r, c + Vector2(0.48, -0.32) * r]), fg, w, true)
		"error":
			draw_line(c + Vector2(-0.36, -0.36) * r, c + Vector2(0.36, 0.36) * r, fg, w, true)
			draw_line(c + Vector2(0.36, -0.36) * r, c + Vector2(-0.36, 0.36) * r, fg, w, true)
		"hint":
			draw_circle(c + Vector2(0, -0.14) * r, 0.36 * r, fg)
			draw_rect(Rect2(c + Vector2(-0.17, 0.18) * r, Vector2(0.34, 0.34) * r), fg)
			draw_line(c + Vector2(-0.17, 0.36) * r, c + Vector2(0.17, 0.36) * r, AppTheme.color_for(kind), w * 0.5)
		"info":
			draw_circle(c + Vector2(0, -0.42) * r, w * 0.75, fg)
			draw_line(c + Vector2(0, -0.14) * r, c + Vector2(0, 0.52) * r, fg, w, true)
		"locked":
			draw_arc(c + Vector2(0, -0.1) * r, 0.25 * r, PI, TAU, 20, fg, w * 0.8, true)
			draw_rect(Rect2(c + Vector2(-0.4, -0.1) * r, Vector2(0.8, 0.6) * r), fg)
		"pending":
			draw_arc(c, 0.55 * r, 0.0, TAU, 40, fg, w * 0.6, true)
		"selected":
			draw_arc(c, 0.58 * r, 0.0, TAU, 40, fg, w * 0.6, true)
			draw_circle(c, 0.32 * r, fg)
