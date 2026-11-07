# Plan – Simulador de puentes de hidrógeno en el agua (FQ 3.º año)

## Objetivo
Que alumnos de 14-15 años, sin vocabulario previo de química, **vean** por qué
el hielo flota y por qué el agua hierve "tan alto" (100 °C), pasando de lo
macroscópico (vaso, pava) a lo submicroscópico (moléculas y puentes de H).
Prioridad: claridad visual > cantidad de controles.

## Formato
- Un único `index.html` (HTML + CSS + JS vanilla, canvas 2D), sin dependencias.
- Constantes físicas y visuales agrupadas al principio del script (`CFG`).
- Diseño 16:9, fondo oscuro, alto contraste, paleta apta para daltonismo
  (O rojo-naranja, H blanco, δ− azul, δ+ naranja, puente celeste punteado;
  nunca rojo vs. verde como única diferencia).
- Textos ≥ 22 px; contador y estado ≥ 36 px. Carteles ≤ 15 palabras.
- Barra fija: ◀ ▶ grandes, Pausa, Pantalla completa, Glosario, Leyenda
  (sólida = covalente, punteada = puente) y nota "Modelo simplificado en 2D".

## Pantallas (5 escenas, una idea cada una)
1. **El fenómeno.** Vaso con agua + cubito flotando, pava hirviendo.
   Pregunta: "¿Por qué el hielo flota si es agua?". Botón "Hacer zoom":
   lupa que se agranda hasta mostrar el modelo de moléculas en el hielo.
2. **Conocé la molécula.** Una H₂O grande en "V". Botón "Siguiente idea"
   muestra de a una: enlace covalente (línea sólida), nube de electrones
   corrida hacia el O con δ−/δ+ (la molécula sigue siendo neutra), momento
   dipolar (flechas de cada enlace + flecha resultante, convención de química:
   apunta al δ−, cruz en el δ+; botón "¿Y si fuera recta?" muestra que los
   tirones se cancelarían), y polos + / − (parecido a un imán, pero eléctrico).
3. **Dos moléculas se encuentran.** Arrastrar una molécula. Si un H(δ+)
   queda cerca y alineado con el O(δ−) de la otra → línea punteada celeste
   que titila + cartel. Barras de fuerza: covalente larga vs. puente corta.
   Tarjeta PREDECIR → OBSERVAR → CONCLUSIÓN.
4. **Muchas moléculas y la temperatura.** ~48 moléculas en una caja, slider
   −20…120 °C (marcas 0 y 100). Estado SÓLIDO/LÍQUIDO/GASEOSO, contador de
   puentes, rectángulo "espacio que ocupan" con área, huecos del hielo
   sombreados, gráfico T vs. puentes/molécula. PREDECIR/OBSERVAR/CONCLUIR.
5. **Puentes en el hielo y en el líquido.** Dos cajas lado a lado (−10 °C y
   20 °C). Una molécula marcada en amarillo en cada caja, con su número de
   puentes y un mini gráfico de los últimos 10 s. Contador de puentes rotos en
   los últimos 3 s. Cámara lenta. Tabla comparativa tras la conclusión.
6. **¿Y si no hubiera puentes?** Pantalla dividida: izquierda con puentes,
   derecha sin puentes, mismo slider. Sin puentes, el gas aparece a ≈ −80 °C
   (escala cualitativa). Conclusión final. PREDECIR/OBSERVAR/CONCLUIR.

## Modelo físico (simplificado, cualitativo)
- Molécula = cuerpo rígido 2D: posición, ángulo, velocidad, velocidad angular.
  O en el centro, dos H a 104,5°. **Los enlaces O–H son geometría fija: nunca
  se rompen** (no existe código que separe átomos de una molécula).
- Temperatura → rapidez objetivo (termostato suave que reescala velocidades),
  más agitación angular. "Temperatura = qué tan rápido se mueven".
- Puente de H: se forma si distancia H···O < umbral y el ángulo O–H···O es
  casi recto (alineación). Es un resorte débil + torque de alineación.
  Reglas duras: cada H ≤ 1 puente, cada O ≤ 2 puentes (comprobación explícita).
  Se rompe si la distancia supera un umbral mayor (histéresis) o por agitación.
- Hielo (T < 0): cada molécula tiene un sitio asignado en una **red hexagonal
  abierta** (panal) y es atraída a él; los hexágonos vacíos se sombrean como
  "huecos". Al fundir, los sitios se liberan y las moléculas se compactan por
  los puentes + repulsión blanda → ocupan menos área que el hielo.
- Gas (T > 100 con puentes; T > −80 sin puentes): la fuerza de puente se apaga
  gradualmente y las moléculas llenan la caja a alta velocidad.
- Área ocupada = rectángulo envolvente (con margen) de todas las moléculas.
  En hielo la red es más extensa que el "charco" compacto del líquido, así
  que el área del hielo > área del líquido (se verifica al final).
- Gráfico T vs. puentes/molécula: se acumula el promedio por bin de temperatura
  mientras el docente mueve el slider.

## Cinética de los puentes (corrección v2)
- Hielo: los puentes no se rompen por agitación (red fija). En el modelo 2D
  cada molécula interior tiene 3 puentes (en el hielo real, 4).
- Líquido: cada puente posible se forma con prob. P_FORM_LIQ por cuadro y se
  rompe con prob. P_BREAK_LIQ·(1+x) (+ extra cerca de 100 °C). Resultado:
  el líquido a 20 °C tiene ≈ 85 % de los puentes del hielo, y menos al calentar.
- El rectángulo de "espacio que ocupan" ignora las 2 moléculas más alejadas
  de cada lado (moléculas que saltan del líquido).

## Secuencia didáctica (Predecir → Observar → Concluir) y errores típicos
- E3: "¿Qué pasa cuando dos moléculas se acercan?" Opciones incluyen "Se forma
  otro enlace dentro de la molécula" (error típico).
- E4: "¿Por qué flota el hielo?" Opciones incluyen "El hielo pesa más porque
  está más frío" y "Al hervir, la molécula se rompe en H y O".
- E5: "Sin puentes, ¿a qué temperatura herviría?" Opciones: igual / más alta /
  mucho más baja.
Cierre metacognitivo en E5: qué vimos (macro), qué imaginamos (moléculas),
cómo lo escribimos (H₂O, δ+, δ−).

## Etapas de construcción
1. Esqueleto: barra, navegación, canvas 16:9 escalable, pausa, fullscreen, glosario.
2. Escena 2 (molécula estática + etapas) y dibujo reutilizable de la molécula.
3. Escena 3 (arrastre + detección de puente + barras).
4. Motor de muchas moléculas (escena 4): termostato, red de hielo, puentes con
   límites, estado, contador, área, gráfico.
5. Escena 5 (doble simulación, interruptor de puentes).
6. Escena 1 (ilustración + zoom).
7. Verificación automática con Playwright: recorrer escenas, comparar áreas
   hielo vs. líquido, temperatura de gas con/sin puentes, invariancia O–H.
