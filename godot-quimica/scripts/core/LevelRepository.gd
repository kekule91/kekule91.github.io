class_name LevelRepository
extends RefCounted
## Carga y valida data/levels.json.
##
## Para sumar una mecánica nueva: crear su escena en scenes/mechanics/ con un
## script que herede de BaseLevel y registrarla en MECHANIC_SCENES.

const MECHANIC_SCENES := {
	"drag_drop": "res://scenes/mechanics/DragDropLevel.tscn",
	"multiple_choice": "res://scenes/mechanics/MultipleChoiceLevel.tscn",
	"slider": "res://scenes/mechanics/SliderLevel.tscn",
}

const MECHANIC_NAMES := {
	"drag_drop": "Arrastrar fichas",
	"multiple_choice": "Opción múltiple",
	"slider": "Deslizador",
}

const REQUIRED_FIELDS := ["id", "concepto", "titulo", "enunciado", "mecanica", "respuesta_correcta", "pistas", "explicaciones"]
const HINT_COUNT := 3


## Devuelve {"niveles": Array, "desbloqueo_secuencial": bool}.
## Los niveles con errores de formato se descartan y se informan por consola.
static func load_catalog(path: String) -> Dictionary:
	var catalog := {"niveles": [], "desbloqueo_secuencial": true}
	if not FileAccess.file_exists(path):
		push_error("LevelRepository: no existe %s" % path)
		return catalog
	var json := JSON.new()
	if json.parse(FileAccess.get_file_as_string(path)) != OK:
		push_error("LevelRepository: JSON inválido en línea %d: %s" % [json.get_error_line(), json.get_error_message()])
		return catalog
	if not json.data is Dictionary:
		push_error("LevelRepository: la raíz de %s debe ser un objeto" % path)
		return catalog

	var root: Dictionary = json.data
	catalog["desbloqueo_secuencial"] = bool(root.get("desbloqueo_secuencial", true))
	var seen := {}
	for raw: Variant in root.get("niveles", []):
		if not raw is Dictionary:
			push_error("LevelRepository: hay un nivel que no es un objeto")
			continue
		var level: Dictionary = raw
		var problems := validate_level(level)
		if seen.has(level.get("id")):
			problems.append("id repetido")
		if problems.is_empty():
			seen[level.get("id")] = true
			catalog["niveles"].append(level)
		else:
			push_error("LevelRepository: nivel '%s' descartado: %s" % [level.get("id", "?"), ", ".join(problems)])
	return catalog


## Devuelve la lista de problemas encontrados (vacía si el nivel es válido).
static func validate_level(level: Dictionary) -> PackedStringArray:
	var problems := PackedStringArray()
	for field: String in REQUIRED_FIELDS:
		if not level.has(field):
			problems.append("falta '%s'" % field)
	if not MECHANIC_SCENES.has(level.get("mecanica", "")):
		problems.append("mecánica desconocida '%s'" % level.get("mecanica", ""))
	var hints: Variant = level.get("pistas", [])
	if not hints is Array or hints.size() != HINT_COUNT:
		problems.append("debe tener exactamente %d pistas" % HINT_COUNT)
	var explanations: Variant = level.get("explicaciones", {})
	if not explanations is Dictionary or not explanations.has("default"):
		# Sin "default" podría quedar un error sin explicar.
		problems.append("'explicaciones' debe incluir la clave 'default'")
	return problems
