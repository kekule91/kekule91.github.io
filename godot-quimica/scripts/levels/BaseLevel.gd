class_name BaseLevel
extends Control
## Clase base de todas las mecánicas de juego.
##
## Cada mecánica (drag_drop, multiple_choice, slider) hereda de esta clase y
## sólo implementa:
##   - _build(): arma la interfaz a partir de get_config().
##   - _evaluate(): devuelve {"ok": bool, "razon": String, "datos": Dictionary}.
##   - get_answer(): la respuesta actual del alumno (para el registro).
##   - _set_interactive(), _on_error_shown(), _on_success_shown(): opcionales.
## Pistas, puntaje, feedback, guardado y registro viven acá.

## Pide a la escena contenedora que muestre el panel de feedback.
## kind: "success" | "error" | "hint" | "info".
signal feedback_requested(kind: String, title: String, message: String, detail: String)
signal score_changed(score: int, max_score: int)
signal hints_changed(used: int, total: int, next_penalty: int)
signal level_completed(level_id: String, score: int)

## Respuesta incompleta: se explica pero no descuenta puntos.
const REASON_INCOMPLETE := "incompleto"
const REASON_DEFAULT := "default"
## Sólo se usa si levels.json no trae "default" (LevelRepository lo exige).
const FALLBACK_EXPLANATION := "Tu respuesta todavía no es correcta. Releé el enunciado y, si lo necesitás, pedí una pista: cada una te acerca un paso a la solución."

var data: Dictionary = {}
var level_id := ""
var max_score := 100
var score := 100
var hints_used := 0
var errors := 0
var solved := false
var _start_msec := 0


func setup(level_data: Dictionary) -> void:
	data = level_data
	level_id = str(data.get("id", ""))
	max_score = int(data.get("puntaje_base", 100))
	score = max_score
	_start_msec = Time.get_ticks_msec()
	_build()
	Analytics.log_event("nivel_iniciado", level_id, {"mecanica": data.get("mecanica", "")})
	score_changed.emit(score, max_score)
	hints_changed.emit(hints_used, get_hint_count(), get_next_hint_penalty())


# --- Métodos a sobrescribir ------------------------------------------------

func _build() -> void:
	pass


func _evaluate() -> Dictionary:
	return {"ok": false, "razon": REASON_DEFAULT, "datos": {}}


func get_answer() -> Variant:
	return null


func _set_interactive(_enabled: bool) -> void:
	pass


## Permite marcar visualmente la respuesta errónea (p. ej. opción descartada).
func _on_error_shown(_reason: String) -> void:
	pass


func _on_success_shown() -> void:
	pass


# --- API pública -----------------------------------------------------------

func get_config() -> Dictionary:
	var cfg: Variant = data.get("config", {})
	return cfg if cfg is Dictionary else {}


## Evalúa la respuesta actual sin efectos secundarios.
func validate() -> Dictionary:
	var result := _evaluate()
	return {
		"ok": bool(result.get("ok", false)),
		"razon": str(result.get("razon", REASON_DEFAULT)),
		"datos": result.get("datos", {}),
	}


## Lo llama el botón "Comprobar": valida, registra y da feedback.
func submit() -> void:
	if solved:
		return
	var result := validate()
	GameState.register_attempt(level_id)
	Analytics.log_event("intento", level_id, {
		"correcto": result.ok,
		"razon": result.razon,
		"respuesta": get_answer(),
		"puntaje": score,
		"pistas_usadas": hints_used,
	})
	if result.ok:
		on_success()
	else:
		on_error(result.razon, result.datos)


func get_hint_count() -> int:
	var hints: Variant = data.get("pistas", [])
	return hints.size() if hints is Array else 0


## Penalización de la próxima pista, o -1 si ya no quedan.
func get_next_hint_penalty() -> int:
	if hints_used >= get_hint_count():
		return -1
	var penalties: Variant = data.get("penalizacion_pista", [])
	if penalties is Array and hints_used < penalties.size():
		return int(penalties[hints_used])
	return 10 * (hints_used + 1)


## Muestra la siguiente pista (escalonadas: cada una más concreta y más cara).
func show_hint() -> void:
	if solved:
		return
	var hints: Array = data.get("pistas", [])
	if hints_used >= hints.size():
		feedback_requested.emit("info", "Ya usaste las %d pistas" % hints.size(),
			"Repasá la última: %s" % hints.back(), "Sin descuento de puntos")
		return
	var penalty := get_next_hint_penalty()
	hints_used += 1
	_apply_penalty(penalty)
	GameState.register_hint(level_id)
	Analytics.log_event("pista", level_id, {"numero": hints_used, "penalizacion": penalty, "puntaje": score})
	hints_changed.emit(hints_used, hints.size(), get_next_hint_penalty())
	feedback_requested.emit("hint", "Pista %d de %d" % [hints_used, hints.size()],
		str(hints[hints_used - 1]), "-%d puntos · Puntaje: %d de %d" % [penalty, score, max_score])


func on_success() -> void:
	solved = true
	_set_interactive(false)
	_on_success_shown()
	var saved := GameState.complete_level(level_id, score, hints_used, errors)
	Analytics.log_event("nivel_completado", level_id, {
		"puntaje": score,
		"pistas_usadas": hints_used,
		"errores": errors,
		"duracion_s": snappedf((Time.get_ticks_msec() - _start_msec) / 1000.0, 0.1),
	})
	var detail := "Puntaje: %d de %d · Pistas: %d · Errores: %d" % [score, max_score, hints_used, errors]
	detail += "\nProgreso guardado." if saved else "\nAtención: no se pudo guardar el progreso."
	feedback_requested.emit("success", "¡Correcto!", str(data.get("explicacion_exito", "")), detail)
	level_completed.emit(level_id, score)


## Muestra la explicación específica del error tomada de levels.json.
func on_error(reason: String, details: Dictionary = {}) -> void:
	var message := explain(reason, details)
	if reason == REASON_INCOMPLETE:
		feedback_requested.emit("info", "Falta completar", message, "Sin descuento de puntos")
		return
	errors += 1
	var penalty := int(data.get("penalizacion_error", 5))
	_apply_penalty(penalty)
	_on_error_shown(reason)
	feedback_requested.emit("error", "Revisemos", message,
		"-%d puntos · Puntaje: %d de %d" % [penalty, score, max_score])


## Busca la explicación del error; si no hay una específica usa "default".
## Los textos pueden tener marcadores {clave} que se completan con `details`.
func explain(reason: String, details: Dictionary = {}) -> String:
	var explanations: Dictionary = data.get("explicaciones", {})
	var text := str(explanations.get(reason, explanations.get(REASON_DEFAULT, FALLBACK_EXPLANATION)))
	return text.format(details)


func _apply_penalty(points: int) -> void:
	var floor_score := int(data.get("puntaje_minimo", 10))
	score = maxi(floor_score, score - points)
	score_changed.emit(score, max_score)
