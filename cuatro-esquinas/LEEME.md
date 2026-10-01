# Juego de las 4 Esquinas – Mitos y Realidades sobre las Adicciones

- **Docente:** https://kekule91.github.io/cuatro-esquinas/
- **Alumnos:** https://kekule91.github.io/cuatro-esquinas/alumno.html (el docente les muestra el código de sala y un QR)

## Modos

1. **Sin dispositivos:** se proyecta la frase y las 4 esquinas; los alumnos se mueven físicamente. No necesita configuración.
2. **Con celulares:** cada alumno entra con su nombre y el código de sala y elige esquina. El docente ve quién eligió qué; en el proyector se muestran solo las cantidades (los nombres se ven en el panel del docente, que se puede ocultar). Al final se descarga un CSV.

## Configurar Firebase (una sola vez, gratis)

1. Entrar a https://console.firebase.google.com → **Agregar proyecto** (se puede desactivar Analytics).
2. Menú **Compilación → Realtime Database → Crear base de datos** → elegir ubicación → **Comenzar en modo bloqueado**.
3. En la pestaña **Reglas** de la base de datos pegar y **Publicar**:

   ```json
   {
     "rules": {
       "salas": {
         "$sala": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

   (Cualquiera que conozca el código de una sala puede leerla o escribir en ella; sirve para el aula, no guarden datos sensibles. Pueden borrar las salas viejas desde la consola.)
4. **Configuración del proyecto (engranaje) → General → Tus apps → ícono `</>` (Web)** → registrar la app (sin Hosting).
5. Copiar el objeto `firebaseConfig` que muestra y pegarlo en `cuatro-esquinas/firebase-config.js` reemplazando `window.FIREBASE_CONFIG = null;`. Verificar que incluya `databaseURL`.
6. Hacer commit y push. Listo: el botón "Con celulares" queda habilitado.
