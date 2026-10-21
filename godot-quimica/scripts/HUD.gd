class_name HUD
extends Control
## Barra superior (volver, título, puntaje) e inferior (pista, comprobar).

signal back_pressed
signal hint_pressed
signal submit_pressed

@onready var back_button: Button = %BackButton
@onready var title_label: Label = %TitleLabel
@onready var score_label: Label = %ScoreLabel
@onready var hint_button: Button = %HintButton
@onready var submit_button: Button = %SubmitButton


func _ready() -> void:
	back_button.pressed.connect(back_pressed.emit)
	hint_button.pressed.connect(hint_pressed.emit)
	submit_button.pressed.connect(submit_pressed.emit)


func set_title(text: String) -> void:
	title_label.text = text


func set_score(score: int, max_score: int) -> void:
	score_label.text = "%d/%d pts" % [score, max_score]


## Muestra cuántas pistas quedan y cuánto cuesta la próxima.
func set_hints(used: int, total: int, next_penalty: int) -> void:
	if next_penalty < 0:
		hint_button.text = "Pistas %d/%d (repasar)" % [used, total]
	else:
		hint_button.text = "Pista %d/%d (-%d)" % [used + 1, total, next_penalty]


func set_finished() -> void:
	hint_button.disabled = true
	submit_button.disabled = true
	submit_button.text = "Resuelto"
