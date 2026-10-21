class_name FeedbackPanel
extends Control
## Panel modal de feedback. El color del borde siempre va con un ícono y un
## título de texto, así que el mensaje se entiende sin distinguir colores.

signal action_selected(action_id: String)

@onready var card: PanelContainer = %Card
@onready var icon: StatusIcon = %Icon
@onready var title_label: Label = %TitleLabel
@onready var message_label: Label = %MessageLabel
@onready var detail_label: Label = %DetailLabel
@onready var actions_box: HBoxContainer = %ActionsBox

var _last_actions: Array = []


func _ready() -> void:
	visible = false


## actions: [{"id": "seguir", "texto": "Seguir intentando"}, ...]
func show_feedback(kind: String, title: String, message: String, detail: String = "", actions: Array = []) -> void:
	icon.kind = kind
	title_label.text = title
	message_label.text = message
	detail_label.text = detail
	detail_label.visible = detail != ""
	card.add_theme_stylebox_override("panel", AppTheme.box(AppTheme.COLOR_SURFACE, AppTheme.color_for(kind), 6, 32, 40))

	for child in actions_box.get_children():
		child.queue_free()
	_last_actions = actions if not actions.is_empty() else [{"id": "cerrar", "texto": "Cerrar"}]
	for action: Dictionary in _last_actions:
		var button := Button.new()
		button.text = str(action.get("texto", "OK"))
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		AppTheme.ensure_touch_size(button)
		button.pressed.connect(_on_action.bind(str(action.get("id", "cerrar"))))
		actions_box.add_child(button)
	visible = true
	(actions_box.get_child(actions_box.get_child_count() - 1) as Button).grab_focus.call_deferred()


## Cierra con la última acción, la más conservadora (p. ej. "Volver a niveles").
func close() -> void:
	if visible and not _last_actions.is_empty():
		_on_action(str(_last_actions.back().get("id", "cerrar")))


func _on_action(action_id: String) -> void:
	visible = false
	action_selected.emit(action_id)
