class_name AppTheme
extends RefCounted
## Paleta y tema visual generados por código (sin archivos de recursos externos).
##
## Regla de accesibilidad: ningún estado se comunica sólo con color; siempre
## va acompañado de un StatusIcon, un texto o un número.

## Alto/ancho mínimo de cualquier control tocable.
## Con viewport base de 1080 px de ancho, en un teléfono típico (~2,75 px/dp)
## 48 dp equivalen a unos 132 px de viewport.
const MIN_TOUCH := 132

const FONT_SIZE := 44
const FONT_SIZE_SMALL := 36
const FONT_SIZE_TITLE := 64

const COLOR_BG := Color("#10161f")
const COLOR_SURFACE := Color("#1b2430")
const COLOR_SURFACE_2 := Color("#263345")
const COLOR_TEXT := Color("#eef2f7")
const COLOR_TEXT_MUTED := Color("#aab5c3")
const COLOR_PRIMARY := Color("#3d8bfd")
const COLOR_SUCCESS := Color("#2fa86b")
const COLOR_ERROR := Color("#e0563b")
const COLOR_HINT := Color("#d99a1c")
const COLOR_INFO := Color("#5f7189")


## Color asociado a cada tipo de estado (siempre se usa junto a un ícono).
static func color_for(kind: String) -> Color:
	match kind:
		"success":
			return COLOR_SUCCESS
		"error":
			return COLOR_ERROR
		"hint":
			return COLOR_HINT
		"selected":
			return COLOR_PRIMARY
		_:
			return COLOR_INFO


static func build() -> Theme:
	var t := Theme.new()
	t.default_font_size = FONT_SIZE

	# Botones: márgenes internos generosos para superar el tamaño táctil mínimo.
	t.set_stylebox("normal", "Button", box(COLOR_SURFACE_2, COLOR_SURFACE_2.lightened(0.15), 2))
	t.set_stylebox("hover", "Button", box(COLOR_SURFACE_2.lightened(0.06), COLOR_PRIMARY, 2))
	t.set_stylebox("pressed", "Button", box(COLOR_PRIMARY.darkened(0.45), COLOR_PRIMARY, 6))
	t.set_stylebox("hover_pressed", "Button", box(COLOR_PRIMARY.darkened(0.4), COLOR_PRIMARY, 6))
	t.set_stylebox("disabled", "Button", box(COLOR_SURFACE.darkened(0.1), COLOR_SURFACE, 2))
	t.set_stylebox("focus", "Button", box(Color.TRANSPARENT, COLOR_TEXT, 4))
	for c: String in ["font_color", "font_hover_color", "font_pressed_color", "font_hover_pressed_color", "font_focus_color"]:
		t.set_color(c, "Button", COLOR_TEXT)
	t.set_color("font_disabled_color", "Button", COLOR_TEXT_MUTED)

	t.set_color("font_color", "Label", COLOR_TEXT)
	t.set_stylebox("panel", "PanelContainer", box(COLOR_SURFACE, COLOR_SURFACE_2, 2, 28, 32))

	# Deslizador grueso con perilla grande.
	var track := box(COLOR_SURFACE_2, Color.TRANSPARENT, 0, 16, 0)
	track.content_margin_top = 14
	track.content_margin_bottom = 14
	t.set_stylebox("slider", "HSlider", track)
	var filled := box(COLOR_PRIMARY, Color.TRANSPARENT, 0, 16, 0)
	t.set_stylebox("grabber_area", "HSlider", filled)
	t.set_stylebox("grabber_area_highlight", "HSlider", filled)
	t.set_icon("grabber", "HSlider", circle_texture(88, COLOR_TEXT))
	t.set_icon("grabber_highlight", "HSlider", circle_texture(88, COLOR_TEXT))

	# Barra de desplazamiento ancha para dedos.
	var bar := box(COLOR_SURFACE, Color.TRANSPARENT, 0, 12, 0)
	bar.content_margin_left = 14
	bar.content_margin_right = 14
	t.set_stylebox("scroll", "VScrollBar", bar)
	t.set_stylebox("grabber", "VScrollBar", box(COLOR_SURFACE_2.lightened(0.2), Color.TRANSPARENT, 0, 12, 0))
	return t


## StyleBox redondeado con borde.
static func box(bg: Color, border: Color = Color.TRANSPARENT, border_width: int = 0, radius: int = 24, padding: int = 36) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(border_width)
	s.set_corner_radius_all(radius)
	s.content_margin_left = padding
	s.content_margin_right = padding
	s.content_margin_top = padding * 0.75
	s.content_margin_bottom = padding * 0.75
	s.anti_aliasing = true
	return s


## Aplica el mismo StyleBox a todos los estados de un botón.
static func style_button(button: Button, style: StyleBox) -> void:
	for state: String in ["normal", "hover", "pressed", "hover_pressed", "focus", "disabled"]:
		button.add_theme_stylebox_override(state, style)


## Garantiza el tamaño táctil mínimo de un control.
static func ensure_touch_size(control: Control) -> void:
	control.custom_minimum_size = Vector2(maxf(control.custom_minimum_size.x, MIN_TOUCH), maxf(control.custom_minimum_size.y, MIN_TOUCH))


static func circle_texture(diameter: int, color: Color) -> ImageTexture:
	var img := Image.create(diameter, diameter, false, Image.FORMAT_RGBA8)
	var r := diameter / 2.0
	for y in diameter:
		for x in diameter:
			var d := Vector2(x + 0.5 - r, y + 0.5 - r).length()
			var alpha := clampf(r - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(color, color.a * alpha))
	return ImageTexture.create_from_image(img)
