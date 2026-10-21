extends Node
## Persistencia del progreso en user://save.json.
##
## Escribe primero en un archivo temporal y después lo renombra, para que un
## cierre inesperado de la app no deje el guardado a medio escribir.

const SAVE_PATH := "user://save.json"
const TMP_PATH := "user://save.json.tmp"
const SAVE_VERSION := 1


## Guarda el diccionario recibido. Devuelve true si se pudo escribir.
func save_game(state: Dictionary) -> bool:
	var payload := {
		"version": SAVE_VERSION,
		"guardado": Time.get_datetime_string_from_system(true),
		"datos": state,
	}
	var file := FileAccess.open(TMP_PATH, FileAccess.WRITE)
	if file == null:
		push_error("SaveSystem: no se pudo abrir %s (%s)" % [TMP_PATH, error_string(FileAccess.get_open_error())])
		return false
	file.store_string(JSON.stringify(payload, "\t"))
	file.close()

	var tmp_abs := ProjectSettings.globalize_path(TMP_PATH)
	var final_abs := ProjectSettings.globalize_path(SAVE_PATH)
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(final_abs)
	var err := DirAccess.rename_absolute(tmp_abs, final_abs)
	if err != OK:
		push_error("SaveSystem: no se pudo renombrar el guardado (%s)" % error_string(err))
		return false
	return true


## Devuelve los datos guardados, o un diccionario vacío si no hay guardado válido.
func load_game() -> Dictionary:
	if not FileAccess.file_exists(SAVE_PATH):
		return {}
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
	if not parsed is Dictionary:
		push_warning("SaveSystem: guardado ilegible, se ignora.")
		return {}
	var datos: Variant = parsed.get("datos", {})
	return datos if datos is Dictionary else {}


func delete_save() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
