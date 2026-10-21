extends Control
## Escena raíz: aplica el tema y cambia entre pantallas (menú, niveles, juego).
## Cada pantalla avisa por señales adónde quiere ir; ninguna conoce a las otras.

const MAIN_MENU := preload("res://scenes/MainMenu.tscn")
const LEVEL_SELECT := preload("res://scenes/LevelSelect.tscn")
const LEVEL := preload("res://scenes/Level.tscn")

@onready var screen_root: Control = %ScreenRoot

var current_screen: Control = null


func _ready() -> void:
	# El tema va en la ventana raíz para que lo hereden también las vistas
	# previas de arrastre, que Godot agrega fuera de esta escena.
	get_tree().root.theme = AppTheme.build()
	show_main_menu()


func show_main_menu() -> void:
	var menu := _swap(MAIN_MENU)
	menu.play_requested.connect(show_level_select)


func show_level_select() -> void:
	var select := _swap(LEVEL_SELECT)
	select.level_chosen.connect(start_level)
	select.back_requested.connect(show_main_menu)


func start_level(level_id: String) -> void:
	var level := _swap(LEVEL)
	level.exit_requested.connect(show_level_select)
	level.next_level_requested.connect(start_level)
	level.load_level(level_id)


func _swap(scene: PackedScene) -> Control:
	if current_screen != null:
		current_screen.queue_free()
	current_screen = scene.instantiate()
	screen_root.add_child(current_screen)
	return current_screen


## Botón/gesto "atrás" de Android: cada pantalla decide qué hacer.
func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST and current_screen != null:
		if not current_screen.has_method("handle_back") or not current_screen.handle_back():
			get_tree().quit()
