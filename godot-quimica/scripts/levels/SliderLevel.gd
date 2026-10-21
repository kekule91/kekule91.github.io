extends BaseLevel
## Mecánica "slider": ubicar un valor continuo (pH, temperatura...) con tolerancia.
##
## config:
##   min, max, paso, valor_inicial, decimales, etiqueta ("pH"), unidad (" °C"),
##   escala: "ph" (colores del indicador universal) o "lineal"
##   rangos_error: [{"min": 10.5, "max": 11.5, "razon": "confunde_poh"}]  (gana el primero que coincida)
## respuesta_correcta: {"valor": 3.0, "tolerancia": 0.2}
## En las explicaciones se puede usar {valor} para citar lo que eligió el alumno.

@onready var value_label: Label = %ValueLabel
@onready var scale_bar: ScaleBar = %ScaleBar
@onready var slider: HSlider = %Slider
@onready var minus_button: Button = %MinusButton
@onready var plus_button: Button = %PlusButton

var decimals := 1


func _build() -> void:
	var cfg := get_config()
	decimals = int(cfg.get("decimales", 1))
	slider.min_value = float(cfg.get("min", 0.0))
	slider.max_value = float(cfg.get("max", 14.0))
	slider.step = float(cfg.get("paso", 0.1))
	scale_bar.configure(slider.min_value, slider.max_value, str(cfg.get("escala", "lineal")))
	var step_text := "%s" % _fmt(slider.step)
	minus_button.text = "-" + step_text
	plus_button.text = "+" + step_text
	minus_button.tooltip_text = "Restar %s" % step_text
	plus_button.tooltip_text = "Sumar %s" % step_text

	slider.value_changed.connect(_on_value_changed)
	scale_bar.value_picked.connect(func(v: float) -> void: slider.value = v)
	minus_button.pressed.connect(func() -> void: slider.value -= slider.step)
	plus_button.pressed.connect(func() -> void: slider.value += slider.step)
	slider.value = float(cfg.get("valor_inicial", (slider.min_value + slider.max_value) / 2.0))
	_on_value_changed(slider.value)


func _on_value_changed(v: float) -> void:
	scale_bar.set_value(v)
	var cfg := get_config()
	var text := "%s = %s%s" % [cfg.get("etiqueta", "Valor"), _fmt(v), cfg.get("unidad", "")]
	if str(cfg.get("escala", "")) == "ph":
		text += "  ·  " + _ph_zone(v)
	value_label.text = text


func _ph_zone(v: float) -> String:
	if v < 6.95:
		return "ácido"
	if v > 7.05:
		return "básico"
	return "neutro"


## Número con coma decimal, como se escribe en Argentina.
func _fmt(v: float) -> String:
	return (("%." + str(decimals) + "f") % v).replace(".", ",")


func get_answer() -> Variant:
	return snappedf(slider.value, slider.step)


func _evaluate() -> Dictionary:
	var v := snappedf(slider.value, slider.step)
	var expected: Dictionary = data.get("respuesta_correcta", {})
	var target := float(expected.get("valor", 0.0))
	var tolerance := float(expected.get("tolerancia", 0.0))
	var details := {"valor": _fmt(v), "correcto": _fmt(target)}
	# Pequeño margen para errores de redondeo de punto flotante.
	if absf(v - target) <= tolerance + 0.0001:
		return {"ok": true, "datos": details}
	for range_rule: Dictionary in get_config().get("rangos_error", []):
		if v >= float(range_rule.get("min", -INF)) and v <= float(range_rule.get("max", INF)):
			return {"ok": false, "razon": str(range_rule.get("razon", REASON_DEFAULT)), "datos": details}
	return {"ok": false, "razon": REASON_DEFAULT, "datos": details}


func _set_interactive(enabled: bool) -> void:
	slider.editable = enabled
	scale_bar.enabled = enabled
	minus_button.disabled = not enabled
	plus_button.disabled = not enabled
