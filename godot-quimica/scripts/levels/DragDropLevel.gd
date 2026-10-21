extends BaseLevel
## Mecánica "drag_drop": arrastrar fichas a ranuras.
##
## config:
##   modo: "balanceo" (cuenta átomos) o "exacto" (compara con respuesta_correcta)
##   fichas: ["1", "2", ...]  (reutilizables)
##   ecuacion: lista de partes; cada una es {"texto": "+"} o
##             {"ranura": "a", "especie": "CH₄", "atomos": {"C": 1, "H": 4}, "lado": "reactivos"}
##   reglas_error (modo exacto): [{"si": {"a": "2"}, "razon": "..."}]

@onready var equation_flow: HFlowContainer = %EquationFlow
@onready var palette: HFlowContainer = %Palette

var slots: Dictionary = {}  # id -> Slot
var tiles: Array[Tile] = []
var selected_tile: Tile = null


func _build() -> void:
	var cfg := get_config()
	for part: Dictionary in cfg.get("ecuacion", []):
		if part.has("ranura"):
			equation_flow.add_child(_make_slot_group(part))
		elif part.has("texto"):
			equation_flow.add_child(_make_label(str(part["texto"]), 56))
	for v: Variant in cfg.get("fichas", []):
		var tile := Tile.new()
		tile.setup(str(v))
		tile.toggled.connect(_on_tile_toggled.bind(tile))
		palette.add_child(tile)
		tiles.append(tile)


func _make_slot_group(part: Dictionary) -> Control:
	var group := HBoxContainer.new()
	group.add_theme_constant_override("separation", 8)
	var slot := Slot.new()
	slot.setup(str(part["ranura"]))
	slot.pressed.connect(_on_slot_pressed.bind(slot))
	slot.value_dropped.connect(_on_slot_filled)
	slots[slot.slot_id] = slot
	group.add_child(slot)
	if part.has("especie"):
		group.add_child(_make_label(str(part["especie"]), 56))
	return group


func _make_label(text: String, font_size: int) -> Label:
	var label := Label.new()
	label.text = text
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.custom_minimum_size.y = AppTheme.MIN_TOUCH
	label.add_theme_font_size_override("font_size", font_size)
	return label


# --- Interacción -------------------------------------------------------------

func _on_tile_toggled(on: bool, tile: Tile) -> void:
	if on:
		for other in tiles:
			if other != tile:
				other.set_pressed_no_signal(false)
		selected_tile = tile
	elif selected_tile == tile:
		selected_tile = null


func _on_slot_pressed(slot: Slot) -> void:
	if selected_tile != null:
		slot.set_value(selected_tile.value)
		_on_slot_filled(slot)
	elif not slot.is_empty():
		slot.clear()


func _on_slot_filled(_slot: Slot) -> void:
	if selected_tile != null:
		selected_tile.set_pressed_no_signal(false)
		selected_tile = null


func _set_interactive(enabled: bool) -> void:
	for slot: Slot in slots.values():
		slot.set_locked(not enabled)
	for tile in tiles:
		tile.disabled = not enabled


func get_answer() -> Variant:
	var answer := {}
	for id: String in slots:
		answer[id] = slots[id].value
	return answer


# --- Validación ------------------------------------------------------------

func _evaluate() -> Dictionary:
	for slot: Slot in slots.values():
		if slot.is_empty():
			return {"ok": false, "razon": REASON_INCOMPLETE}
	if str(get_config().get("modo", "exacto")) == "balanceo":
		return _evaluate_balance()
	return _evaluate_exact()


## Cuenta átomos de cada elemento a ambos lados de la flecha.
func _evaluate_balance() -> Dictionary:
	var left := {}
	var right := {}
	var element_order: Array[String] = []
	var coefficients: Array[int] = []
	for part: Dictionary in get_config().get("ecuacion", []):
		if not part.has("ranura"):
			continue
		var coef := int(slots[str(part["ranura"])].value)
		coefficients.append(coef)
		var side := left if part.get("lado", "reactivos") == "reactivos" else right
		var atoms: Dictionary = part.get("atomos", {})
		for element: String in atoms:
			if not element_order.has(element):
				element_order.append(element)
			side[element] = int(side.get(element, 0)) + coef * int(atoms[element])

	for element in element_order:
		var l := int(left.get(element, 0))
		var r := int(right.get(element, 0))
		if l != r:
			return {"ok": false, "razon": "desbalance_" + element,
				"datos": {"elemento": element, "izq": l, "der": r}}

	var divisor := coefficients[0]
	for c in coefficients:
		divisor = _gcd(divisor, c)
	if divisor > 1:
		return {"ok": false, "razon": "no_minimos", "datos": {"mcd": divisor}}
	return {"ok": true}


## Compara con respuesta_correcta y busca reglas de error frecuentes.
func _evaluate_exact() -> Dictionary:
	var answer: Dictionary = get_answer()
	var expected: Dictionary = data.get("respuesta_correcta", {})
	var all_match := true
	for id: String in expected:
		if str(answer.get(id, "")) != str(expected[id]):
			all_match = false
			break
	if all_match:
		return {"ok": true}
	for rule: Dictionary in get_config().get("reglas_error", []):
		var conditions: Dictionary = rule.get("si", {})
		var matches := true
		for id: String in conditions:
			if str(answer.get(id, "")) != str(conditions[id]):
				matches = false
				break
		if matches:
			return {"ok": false, "razon": str(rule.get("razon", REASON_DEFAULT))}
	return {"ok": false, "razon": REASON_DEFAULT}


func _gcd(a: int, b: int) -> int:
	while b != 0:
		var t := b
		b = a % b
		a = t
	return absi(a)
