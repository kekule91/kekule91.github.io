extends SceneTree
## Prueba de humo sin interfaz: recorre los tres niveles simulando respuestas.
## Uso:  godot --headless --path . -s res://tests/smoke_test.gd
## Atención: borra el progreso guardado en user:// de esta máquina.

var failures := 0
var main: Control


func _initialize() -> void:
	_run.call_deferred()


func _run() -> void:
	var game_state: Node = root.get_node("GameState")
	var save_system: Node = root.get_node("SaveSystem")
	var analytics: Node = root.get_node("Analytics")
	game_state.reset_progress()

	check(game_state.levels.size() == 3, "se cargan 3 niveles")
	main = load("res://scenes/Main.tscn").instantiate()
	root.add_child(main)
	await process_frame

	main.show_level_select()
	await process_frame
	check(not game_state.is_unlocked("n2_enlace_nacl"), "nivel 2 bloqueado al inicio")

	await _test_drag_drop(game_state)
	await _test_multiple_choice(game_state)
	await _test_slider(game_state)

	var saved: Dictionary = save_system.load_game()
	check(saved.get("progreso", {}).size() == 3, "save.json tiene los 3 niveles")
	check(int(saved.get("pistas_usadas_total", -1)) == 1, "pistas usadas guardadas")
	var export: Dictionary = analytics.export_to_documents()
	check(export.ruta != "" and FileAccess.file_exists(export.ruta), "registro exportado en %s" % export.ruta)

	print("\n%s (%d fallas)" % ["OK" if failures == 0 else "FALLÓ", failures])
	quit(1 if failures > 0 else 0)


func _start(level_id: String) -> Node:
	main.start_level(level_id)
	await process_frame
	return main.current_screen


func _test_drag_drop(game_state: Node) -> void:
	var level := await _start("n1_balanceo_metano")
	var mech = level.mechanic
	var fb = level.feedback
	mech.submit()
	check(fb.visible and fb.title_label.text == "Falta completar" and mech.score == 100, "incompleto: explica sin descontar")
	_fill(mech, {"a": "1", "b": "1", "c": "1", "d": "1"})
	mech.submit()
	check(fb.message_label.text.contains("hidrógeno") and fb.message_label.text.contains("4 átomos de H"), "desbalance H con conteos: " + fb.message_label.text.left(60))
	check(mech.score == 95, "error resta 5")
	_fill(mech, {"a": "1", "b": "1", "c": "1", "d": "2"})
	mech.submit()
	check(fb.message_label.text.contains("oxígeno"), "desbalance O")
	_fill(mech, {"a": "2", "b": "4", "c": "2", "d": "4"})
	mech.submit()
	check(fb.message_label.text.contains("divisibles por 2"), "no mínimos con mcd")
	mech.show_hint()
	check(fb.title_label.text == "Pista 1 de 3" and mech.score == 75, "pista 1 resta 10 (score %d)" % mech.score)
	# Arrastrar: probar la API de drag & drop de la ranura.
	var slot = mech.slots["a"]
	check(slot._can_drop_data(Vector2.ZERO, {"tipo": "ficha", "valor": "1"}), "la ranura acepta fichas")
	slot._drop_data(Vector2.ZERO, {"tipo": "ficha", "valor": "1"})
	_fill(mech, {"b": "2", "c": "1", "d": "2"})
	mech.submit()
	check(mech.solved and fb.title_label.text == "¡Correcto!", "balanceo correcto")
	check(game_state.is_completed("n1_balanceo_metano") and game_state.is_unlocked("n2_enlace_nacl"), "nivel 1 guardado y nivel 2 desbloqueado")


func _fill(mech, values: Dictionary) -> void:
	for id: String in values:
		mech.slots[id].set_value(values[id])


func _test_multiple_choice(game_state: Node) -> void:
	var level := await _start("n2_enlace_nacl")
	var mech = level.mechanic
	var fb = level.feedback
	check(mech.buttons.size() == 4, "4 opciones")
	mech.buttons["cov_polar"].button_pressed = true
	mech.submit()
	check(fb.message_label.text.contains("2,23") and mech.score == 90, "distractor covalente polar con explicación propia")
	check(mech.buttons["cov_polar"].disabled and mech.icons["cov_polar"].kind == "error", "opción descartada con ícono")
	mech.buttons["ionico"].button_pressed = true
	mech.submit()
	check(mech.solved and game_state.is_completed("n2_enlace_nacl"), "iónico correcto")


func _test_slider(game_state: Node) -> void:
	var level := await _start("n3_ph_hcl")
	var mech = level.mechanic
	var fb = level.feedback
	mech.slider.value = 11.0
	mech.submit()
	check(fb.message_label.text.contains("pOH") and fb.message_label.text.contains("11,0"), "detecta confusión con pOH")
	mech.slider.value = 7.0
	mech.submit()
	check(fb.message_label.text.contains("neutra"), "detecta neutro")
	mech.slider.value = 3.1
	mech.submit()
	check(mech.solved and game_state.is_completed("n3_ph_hcl"), "pH 3,1 dentro de tolerancia")


func check(condition: bool, label: String) -> void:
	print(("  ok  " if condition else "  FALLA  ") + label)
	if not condition:
		failures += 1
