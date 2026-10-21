extends Node
## Estado global del juego: niveles cargados, progreso, puntaje y pistas.
##
## El progreso se guarda automáticamente (vía SaveSystem) cada vez que se
## completa un nivel.

signal progress_changed

const LEVELS_PATH := "res://data/levels.json"

## Lista de niveles tal como vienen de levels.json (ya validados).
var levels: Array = []
## Si es true, cada nivel se habilita al completar el anterior.
var sequential_unlock := true
## Progreso por nivel: id -> {completado, mejor_puntaje, pistas_usadas, errores, intentos}.
var progress: Dictionary = {}
## Pistas usadas en total (todas las partidas).
var total_hints_used := 0
var current_level_id := ""


func _ready() -> void:
	var catalog := LevelRepository.load_catalog(LEVELS_PATH)
	levels = catalog.get("niveles", [])
	sequential_unlock = bool(catalog.get("desbloqueo_secuencial", true))
	_from_dict(SaveSystem.load_game())


# --- Consultas -------------------------------------------------------------

func get_level(level_id: String) -> Dictionary:
	for level: Dictionary in levels:
		if level.get("id") == level_id:
			return level
	return {}


func get_level_index(level_id: String) -> int:
	for i in levels.size():
		if levels[i].get("id") == level_id:
			return i
	return -1


## Devuelve el id del nivel siguiente o "" si es el último.
func get_next_level_id(level_id: String) -> String:
	var i := get_level_index(level_id)
	if i < 0 or i + 1 >= levels.size():
		return ""
	return str(levels[i + 1].get("id"))


func get_level_progress(level_id: String) -> Dictionary:
	return progress.get(level_id, {})


func is_completed(level_id: String) -> bool:
	return bool(get_level_progress(level_id).get("completado", false))


func is_unlocked(level_id: String) -> bool:
	var i := get_level_index(level_id)
	if i <= 0 or not sequential_unlock:
		return i >= 0
	return is_completed(str(levels[i - 1].get("id")))


## Suma de los mejores puntajes de cada nivel.
func get_total_score() -> int:
	var total := 0
	for level_id: String in progress:
		total += int(progress[level_id].get("mejor_puntaje", 0))
	return total


# --- Registro de acciones --------------------------------------------------

func register_attempt(level_id: String) -> void:
	var entry := _entry(level_id)
	entry["intentos"] = int(entry.get("intentos", 0)) + 1


func register_hint(level_id: String) -> void:
	total_hints_used += 1
	var entry := _entry(level_id)
	entry["pistas_totales"] = int(entry.get("pistas_totales", 0)) + 1


## Marca el nivel como completado y guarda automáticamente.
## Devuelve true si el guardado se escribió bien.
func complete_level(level_id: String, score: int, hints_used: int, errors: int) -> bool:
	var entry := _entry(level_id)
	var first_time := not bool(entry.get("completado", false))
	entry["completado"] = true
	if first_time or score > int(entry.get("mejor_puntaje", 0)):
		entry["mejor_puntaje"] = score
		entry["pistas_usadas"] = hints_used
		entry["errores"] = errors
	progress_changed.emit()
	return SaveSystem.save_game(_to_dict())


func reset_progress() -> void:
	progress.clear()
	total_hints_used = 0
	SaveSystem.delete_save()
	progress_changed.emit()


# --- Serialización ---------------------------------------------------------

func _entry(level_id: String) -> Dictionary:
	if not progress.has(level_id):
		progress[level_id] = {"completado": false, "mejor_puntaje": 0, "pistas_usadas": 0, "errores": 0, "intentos": 0}
	return progress[level_id]


func _to_dict() -> Dictionary:
	return {
		"progreso": progress,
		"pistas_usadas_total": total_hints_used,
		"puntaje_total": get_total_score(),
	}


func _from_dict(saved: Dictionary) -> void:
	var saved_progress: Variant = saved.get("progreso", {})
	progress = saved_progress if saved_progress is Dictionary else {}
	total_hints_used = int(saved.get("pistas_usadas_total", 0))
