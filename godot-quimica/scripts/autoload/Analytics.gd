extends Node
## Registro local de intentos (sin red, sin servicios externos).
##
## Cada evento se agrega a user://analytics_log.json. Desde el menú principal
## se puede exportar una copia a la carpeta Documentos del dispositivo para
## que el docente la recupere.

const LOG_PATH := "user://analytics_log.json"
## Tope de eventos guardados; al superarlo se descartan los más viejos.
const MAX_EVENTS := 5000
const EXPORT_PREFIX := "quimica_en_juego_registro_"

var events: Array = []
var session_id := ""


func _ready() -> void:
	session_id = "%d-%04d" % [int(Time.get_unix_time_from_system()), randi() % 10000]
	_load()


## Registra un evento. `level_id` puede ser "" para eventos generales.
func log_event(event_type: String, level_id: String = "", payload: Dictionary = {}) -> void:
	var entry := {
		"fecha": Time.get_datetime_string_from_system(false, true),
		"unix": Time.get_unix_time_from_system(),
		"sesion": session_id,
		"evento": event_type,
		"nivel": level_id,
	}
	entry.merge(payload)
	events.append(entry)
	if events.size() > MAX_EVENTS:
		events = events.slice(events.size() - MAX_EVENTS)
	_flush()


## Exporta el registro a Documentos. Si no se puede (permiso, plataforma),
## lo deja en user:// y lo informa.
## Devuelve {"ok": bool, "ruta": String, "mensaje": String}.
func export_to_documents() -> Dictionary:
	var stamp := Time.get_datetime_string_from_system(false, true).replace(":", "").replace(" ", "_").replace("-", "")
	var file_name := "%s%s.json" % [EXPORT_PREFIX, stamp]
	var content := JSON.stringify(_export_payload(), "\t")

	var docs := OS.get_system_dir(OS.SYSTEM_DIR_DOCUMENTS)
	if docs != "":
		DirAccess.make_dir_recursive_absolute(docs)
		var path := docs.path_join(file_name)
		if _write(path, content):
			log_event("registro_exportado", "", {"ruta": path})
			return {"ok": true, "ruta": path, "mensaje": "Registro exportado a Documentos:\n%s" % path}

	# Plan B: carpeta privada de la app.
	var fallback := "user://".path_join(file_name)
	if _write(fallback, content):
		var abs_path := ProjectSettings.globalize_path(fallback)
		return {"ok": false, "ruta": abs_path, "mensaje": "No se pudo escribir en Documentos. El registro quedó en la carpeta interna de la app:\n%s" % abs_path}
	return {"ok": false, "ruta": "", "mensaje": "No se pudo exportar el registro. Revisá el espacio libre del dispositivo."}


func clear() -> void:
	events.clear()
	_flush()


func _export_payload() -> Dictionary:
	return {
		"app": ProjectSettings.get_setting("application/config/name"),
		"version_app": ProjectSettings.get_setting("application/config/version", ""),
		"exportado": Time.get_datetime_string_from_system(false, true),
		"plataforma": OS.get_name(),
		"total_eventos": events.size(),
		"eventos": events,
	}


func _load() -> void:
	if not FileAccess.file_exists(LOG_PATH):
		return
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(LOG_PATH))
	if parsed is Array:
		events = parsed


func _flush() -> void:
	_write(LOG_PATH, JSON.stringify(events))


func _write(path: String, content: String) -> bool:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_warning("Analytics: no se pudo escribir %s (%s)" % [path, error_string(FileAccess.get_open_error())])
		return false
	file.store_string(content)
	file.close()
	return true
