extends Control
## Contenedor de un nivel: muestra enunciado, HUD y feedback, e instancia la
## escena de la mecánica indicada en levels.json.

signal exit_requested
signal next_level_requested(level_id: String)

@onready var hud: HUD = %HUD
@onready var feedback: FeedbackPanel = %FeedbackPanel
@onready var concept_label: Label = %ConceptLabel
@onready var statement_label: Label = %StatementLabel
@onready var mechanic_host: Control = %MechanicHost

var level_id := ""
var mechanic: BaseLevel = null


func _ready() -> void:
	hud.back_pressed.connect(_exit)
	hud.hint_pressed.connect(func() -> void: mechanic.show_hint())
	hud.submit_pressed.connect(func() -> void: mechanic.submit())
	feedback.action_selected.connect(_on_feedback_action)


func load_level(id: String) -> void:
	var level := GameState.get_level(id)
	if level.is_empty() or not GameState.is_unlocked(id):
		push_error("Level: nivel '%s' inexistente o bloqueado" % id)
		exit_requested.emit.call_deferred()
		return
	level_id = id
	GameState.current_level_id = id
	concept_label.text = "Concepto: %s" % level.get("concepto", "")
	statement_label.text = str(level.get("enunciado", ""))
	hud.set_title(str(level.get("titulo", "")))

	var scene: PackedScene = load(LevelRepository.MECHANIC_SCENES[level.get("mecanica")])
	mechanic = scene.instantiate()
	mechanic_host.add_child(mechanic)
	mechanic.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mechanic.feedback_requested.connect(_on_feedback_requested)
	mechanic.score_changed.connect(hud.set_score)
	mechanic.hints_changed.connect(hud.set_hints)
	mechanic.level_completed.connect(func(_id: String, _score: int) -> void: hud.set_finished())
	mechanic.setup(level)


func _on_feedback_requested(kind: String, title: String, message: String, detail: String) -> void:
	var actions: Array = [{"id": "seguir", "texto": "Seguir intentando" if kind == "error" else "Entendido"}]
	if kind == "success":
		actions = []
		if GameState.get_next_level_id(level_id) != "":
			actions.append({"id": "siguiente", "texto": "Siguiente nivel"})
		actions.append({"id": "niveles", "texto": "Volver a niveles"})
	feedback.show_feedback(kind, title, message, detail, actions)


func _on_feedback_action(action_id: String) -> void:
	match action_id:
		"siguiente":
			next_level_requested.emit(GameState.get_next_level_id(level_id))
		"niveles":
			exit_requested.emit()


func _exit() -> void:
	if mechanic != null and not mechanic.solved:
		Analytics.log_event("nivel_abandonado", level_id, {"puntaje": mechanic.score, "pistas_usadas": mechanic.hints_used, "errores": mechanic.errors})
	exit_requested.emit()


func handle_back() -> bool:
	if feedback.visible:
		feedback.close()
	else:
		_exit()
	return true
