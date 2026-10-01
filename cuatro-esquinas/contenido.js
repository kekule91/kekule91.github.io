// Contenido de la actividad "Juego de las 4 Esquinas: Mitos y Realidades sobre las Adicciones".
// Lo usan tanto la versión docente (index.html) como la de alumnos (alumno.html).

window.ESQUINAS = [
  { id: 'V',  nombre: 'VERDADERO',          corto: 'Verdadero',  color: '#2bb673',
    desc: 'La afirmación es totalmente correcta tal como está dicha.' },
  { id: 'F',  nombre: 'FALSO',              corto: 'Falso',      color: '#e5484d',
    desc: 'La afirmación es incorrecta.' },
  { id: 'NS', nombre: 'NO SÉ / NO TENGO SUFICIENTE INFORMACIÓN', corto: 'No sé', color: '#8c9bb0',
    desc: 'No tengo la información para decidir o nunca lo había pensado. Es una opción válida y valiente.' },
  { id: 'VP', nombre: 'VERDADERO, PERO...', corto: 'Verdadero, pero…', color: '#f6b40e',
    desc: 'La frase tiene una parte de verdad, pero es incompleta, engañosa o necesita una aclaración importante.' }
];

window.AFIRMACIONES = [
  // ---- Alcohol
  { cat: 'Alcohol', texto: 'Como el alcohol es legal, no es tan peligroso como las drogas ilegales.', resp: 'FALSO',
    debate: 'La legalidad de una sustancia no determina su nivel de riesgo para la salud. El alcohol es una de las drogas que más daños físicos, sociales y psicológicos causa a nivel mundial debido a su alta disponibilidad y aceptación social. El "Verdadero, pero..." podría argumentar que su regulación ofrece ciertas garantías que las drogas ilegales no tienen, pero eso no disminuye su peligrosidad intrínseca.' },
  { cat: 'Alcohol', texto: 'Mezclar alcohol con bebidas energizantes te ayuda a estar más despierto y así controlas mejor la borrachera.', resp: 'FALSO',
    debate: 'Es una combinación muy peligrosa. La cafeína de la bebida energizante enmascara los efectos depresores del alcohol, haciendo que la persona no perciba su nivel real de intoxicación. Esto aumenta el riesgo de beber en exceso, sufrir una intoxicación etílica grave, y participar en conductas de riesgo (como conducir).' },
  // ---- Marihuana
  { cat: 'Marihuana (Cannabis)', texto: 'La marihuana no genera adicción porque es una planta, es algo natural.', resp: 'FALSO',
    debate: 'Que algo sea "natural" no significa que sea inofensivo (el tabaco y los hongos venenosos también son naturales). El cannabis puede generar dependencia, especialmente psicológica. Alrededor del 9-10% de los consumidores desarrollan un trastorno por consumo. El THC (su principal componente psicoactivo) actúa sobre el sistema de recompensa del cerebro, que es la base de la adicción.' },
  { cat: 'Marihuana (Cannabis)', texto: 'Fumar marihuana es menos dañino para los pulmones que fumar tabaco.', resp: 'FALSO / VERDADERO, PERO...',
    debate: 'Es una frase ideal para la esquina del "pero...". El humo del cannabis contiene muchos de los mismos agentes cancerígenos que el humo del tabaco. "Verdadero, pero..." quienes defienden esto podrían argumentar que los fumadores de tabaco suelen consumir muchos más cigarrillos al día que los de marihuana. Sin embargo, la forma de fumar marihuana (inhalaciones más profundas y sostenidas) aumenta la exposición de los pulmones al alquitrán.' },
  // ---- Nicotina
  { cat: 'Nicotina (Tabaco y Vapeo)', texto: 'Vapear no es peligroso, es solo vapor de agua con sabores.', resp: 'FALSO',
    debate: 'El aerosol de los vapers no es vapor de agua. Contiene nicotina (una de las sustancias más adictivas que existen), saborizantes, propilenglicol y otras sustancias químicas que pueden ser dañinas para los pulmones a largo plazo.' },
  { cat: 'Nicotina (Tabaco y Vapeo)', texto: 'Fumar pocos cigarrillos el fin de semana no te convierte en adicto.', resp: 'VERDADERO, PERO...',
    debate: 'Es la puerta de entrada perfecta a la adicción. Si bien técnicamente la adicción es un proceso, la nicotina es tan potente que incluso el consumo ocasional puede establecer rápidamente un patrón de dependencia. El cerebro se adapta muy rápido a ella. Es el clásico argumento de "yo controlo", que a menudo es el primer paso hacia la pérdida de control.' },
  // ---- Cocaína y sintéticas
  { cat: 'Cocaína y Drogas Sintéticas', texto: 'La cocaína te da más energía para estudiar o trabajar, por eso es una ayuda.', resp: 'FALSO',
    debate: 'La cocaína es un estimulante potente que genera una falsa sensación de seguridad y capacidad. El "subidón" es corto y va seguido de un "bajón" intenso con agotamiento, depresión e irritabilidad. Es altamente adictiva y peligrosa para el corazón y el cerebro. El supuesto "beneficio" es una ilusión que esconde un riesgo enorme.' },
  { cat: 'Cocaína y Drogas Sintéticas', texto: 'Con las drogas sintéticas (como el éxtasis o MDMA), el peligro está en no saber qué contienen realmente.', resp: 'VERDADERO, PERO...',
    debate: 'Esta frase es casi completamente verdadera. El principal riesgo es que las pastillas o polvos vendidos en el mercado ilegal a menudo contienen sustancias diferentes a las esperadas, adulterantes o dosis impredecibles. El "pero..." es que, incluso si la sustancia fuera pura, el MDMA en sí mismo tiene riesgos importantes: golpe de calor, deshidratación, problemas cardiovasculares y neurotoxicidad.' },
  // ---- Conceptos generales
  { cat: 'Conceptos Generales sobre Adicción', texto: 'La adicción es un problema de falta de voluntad y de carácter, no una enfermedad.', resp: 'FALSO',
    debate: 'Esta es una de las frases más importantes. La comunidad científica y médica a nivel mundial reconoce la adicción como una enfermedad crónica del cerebro. Las drogas modifican circuitos cerebrales relacionados con la recompensa, el estrés y el autocontrol, lo que hace extremadamente difícil dejar de consumir solo con "fuerza de voluntad".' },
  { cat: 'Conceptos Generales sobre Adicción', texto: 'Saber mucho sobre drogas te protege de caer en una adicción.', resp: 'VERDADERO, PERO...',
    debate: 'La información es una herramienta de protección fundamental (es el objetivo de esta actividad). "Pero..." no es el único factor. La presión social, la salud mental, los problemas personales, la genética y el entorno también juegan un papel crucial. La información ayuda a tomar mejores decisiones, pero no inmuniza.' },
  // ---- Problemático vs recreativo
  { cat: 'Consumo Problemático vs. Recreativo', texto: 'Mientras solo consumas los fines de semana, no es un consumo problemático.', resp: 'FALSO',
    debate: 'El consumo problemático no lo define la frecuencia ("cuándo"), sino las consecuencias. Si durante el fin de semana una persona se pone en riesgo, gasta dinero que no tiene, genera conflictos o necesita consumir para poder pasarla bien, ya es problemático.' },
  { cat: 'Consumo Problemático vs. Recreativo', texto: 'El consumo recreativo es totalmente seguro y no tiene riesgos.', resp: 'FALSO',
    debate: 'Todo consumo tiene riesgos. Un solo consumo "recreativo" puede terminar en una intoxicación grave, un accidente de tránsito o una situación de violencia. El riesgo cero no existe.' },
  { cat: 'Consumo Problemático vs. Recreativo', texto: 'Si sacas buenas notas en el colegio, significa que tu consumo no es un problema.', resp: 'FALSO',
    debate: 'El rendimiento académico es solo un área de la vida. Una persona puede mantener las apariencias en los estudios mientras su salud mental, sus relaciones familiares o su bienestar emocional se están deteriorando. A menudo, el rendimiento es lo último en caer.' },
  { cat: 'Consumo Problemático vs. Recreativo', texto: 'Necesitar una cerveza o un porro para relajarte después de un día estresante es normal.', resp: 'VERDADERO, PERO...',
    debate: 'Es "Verdadero" que mucha gente lo hace y está socialmente aceptado. "Pero..." es una señal de alerta. Cuando una sustancia se convierte en la única o principal herramienta para gestionar emociones (como el estrés o la ansiedad), se está construyendo un vínculo problemático y dependiente.' },
  { cat: 'Consumo Problemático vs. Recreativo', texto: 'Consumo problemático es solo cuando te inyectas o consumes todos los días.', resp: 'FALSO',
    debate: 'Este es un mito que asocia el problema solo con los casos más extremos. El consumo problemático tiene muchos niveles y empieza mucho antes, como cuando se pierde el control sobre la cantidad o se empieza a mentir sobre el consumo.' },
  // ---- Legales vs ilegales
  { cat: 'Drogas Legales vs. Ilegales', texto: 'Si el alcohol se vendiera en kioscos como algo ilegal, la gente lo respetaría más y habría menos problemas.', resp: 'VERDADERO, PERO... / DEBATE ABIERTO',
    debate: 'Esta frase es para reflexionar sobre el estatus legal. "Verdadero, pero..." la prohibición podría reducir el acceso, pero también crearía un mercado negro (como en la Ley Seca de EE.UU.), con productos adulterados y más peligrosos. No hay una respuesta fácil, demuestra la complejidad del tema.' },
  { cat: 'Drogas Legales vs. Ilegales', texto: 'Las drogas legales son de mejor calidad y más puras que las ilegales.', resp: 'VERDADERO, PERO...',
    debate: '"Verdadero" en el sentido de que los productos legales (alcohol, tabaco, medicamentos) pasan por controles de calidad. "Pero..." eso no les quita la toxicidad. Un veneno de alta pureza sigue siendo un veneno. La pureza no es sinónimo de seguridad.' },
  { cat: 'Drogas Legales vs. Ilegales', texto: 'La marihuana debería ser legal porque es menos dañina que el alcohol y el tabaco.', resp: 'VERDADERO, PERO... / DEBATE ABIERTO',
    debate: 'Es una afirmación muy común. Es cierto que, en términos de mortalidad directa y daño a terceros, el alcohol y el tabaco tienen estadísticas mucho peores. "Pero..." legalizar la marihuana también implica desafíos de salud pública: regular la potencia del THC, prevenir el consumo en adolescentes, y atender los casos de adicción que, aunque en menor porcentaje que otras drogas, existen.' },
  { cat: 'Drogas Legales vs. Ilegales', texto: 'Un medicamento recetado por un médico no puede ser peligroso ni adictivo.', resp: 'FALSO',
    debate: 'Muchos medicamentos, especialmente los opioides (para el dolor) y las benzodiacepinas (para la ansiedad), son altamente adictivos y peligrosos si no se usan bajo estricta supervisión médica. La crisis de opioides en EE.UU. es un claro ejemplo de esto.' },
  { cat: 'Drogas Legales vs. Ilegales', texto: 'Las leyes que prohíben las drogas existen únicamente para proteger la salud de las personas.', resp: 'FALSO',
    debate: 'Si bien la protección de la salud es un argumento, las leyes sobre drogas también están influenciadas por factores históricos, económicos, políticos y hasta raciales. Es una discusión compleja que va más allá de la simple salud pública.' },
  // ---- Adolescencia vs adultez
  { cat: 'Consumo en la Adolescencia vs. Adultez', texto: 'Es mejor probar y "quemar la etapa" de adolescente que empezar a consumir de grande.', resp: 'FALSO',
    debate: 'Un gravísimo error. Como el cerebro está en desarrollo, empezar a consumir en la adolescencia multiplica el riesgo de desarrollar una adicción y de sufrir daños permanentes. Cuanto más se retrasa el inicio del consumo de cualquier droga (incluido el alcohol), menor es el riesgo.' },
  { cat: 'Consumo en la Adolescencia vs. Adultez', texto: 'El cerebro de un adulto puede manejar mucho mejor los efectos de las drogas que el de un adolescente.', resp: 'VERDADERO',
    debate: 'Es verdadero porque el cerebro adulto ya está formado. Sin embargo, esto no significa que sea inmune. Un adulto también puede desarrollar una adicción severa y sufrir graves consecuencias, solo que el punto de partida (un cerebro maduro) es menos vulnerable que uno en plena construcción.' },
  { cat: 'Consumo en la Adolescencia vs. Adultez', texto: 'Si un adolescente fuma marihuana, solo afecta su memoria para los estudios, pero nada más.', resp: 'FALSO',
    debate: 'Afecta mucho más que la memoria a corto plazo. Puede alterar la capacidad de aprendizaje, la motivación (el "síndrome amotivacional"), la regulación emocional e incrementar el riesgo de desarrollar psicosis en personas con predisposición genética.' },
  { cat: 'Consumo en la Adolescencia vs. Adultez', texto: 'Los padres que le ofrecen alcohol a sus hijos adolescentes en casa les enseñan a beber de forma responsable.', resp: 'FALSO',
    debate: 'Los estudios demuestran lo contrario. Los adolescentes que tienen acceso temprano al alcohol, incluso en un entorno familiar, tienen más probabilidades de desarrollar un consumo problemático en el futuro. Normaliza una conducta de riesgo para un cerebro en desarrollo.' },
  { cat: 'Consumo en la Adolescencia vs. Adultez', texto: 'La presión de grupo para consumir es algo que solo afecta a los adolescentes.', resp: 'FALSO',
    debate: 'La presión social y el deseo de pertenencia existen a todas las edades. Los adultos también enfrentan presiones en entornos laborales ("after office"), reuniones sociales y eventos donde el consumo de alcohol, por ejemplo, está muy normalizado.' },
  // ---- Profundizar
  { cat: 'Frases para Profundizar', texto: 'Una persona adicta puede dejar de consumir cuando quiera, sólo necesita tener fuerza de voluntad.', resp: 'FALSO',
    debate: 'Refuerza el concepto de adicción como enfermedad cerebral. La droga "secuestra" los circuitos de decisión. La voluntad es necesaria para iniciar y sostener un tratamiento, pero no es suficiente por sí sola para vencer los cambios neuroquímicos que causa la adicción.' },
  { cat: 'Frases para Profundizar', texto: 'Las drogas sintéticas "de diseño" son más seguras porque las hacen en laboratorios.', resp: 'FALSO',
    debate: 'Un error fatal. Se fabrican en laboratorios clandestinos, sin ningún control de calidad, por lo que nunca se sabe la dosis real ni si están mezcladas con sustancias mucho más peligrosas.' },
  { cat: 'Frases para Profundizar', texto: 'Si te sientes mal o deprimido, tomar alcohol o fumar un porro te va a ayudar a sentirte mejor.', resp: 'VERDADERO, PERO...',
    debate: '"Verdadero" que puede generar un alivio temporal y momentáneo. "Pero..." es una trampa peligrosa. A medio y largo plazo, las drogas empeoran los síntomas de la depresión y la ansiedad. Usar una sustancia como "automedicación" es una vía rápida hacia la dependencia.' },
  { cat: 'Frases para Profundizar', texto: 'Yo controlo lo que consumo, sé cuál es mi límite.', resp: 'FALSO',
    debate: 'Esta es la "frase insignia" de la negación. Las drogas afectan precisamente la parte del cerebro que "controla" y toma decisiones. La sensación de control es una ilusión que la propia sustancia ayuda a crear. Además, el límite del cuerpo (la tolerancia) va cambiando, lo que hace que cada vez se necesite más para sentir lo mismo.' },
  { cat: 'Frases para Profundizar', texto: 'Hablar mucho sobre drogas en el colegio incita a que los chicos prueben por curiosidad.', resp: 'FALSO',
    debate: 'La evidencia demuestra que una educación honesta, basada en la ciencia y enfocada en la reducción de riesgos y el desarrollo del pensamiento crítico, es un factor de protección. El silencio y el tabú son mucho más peligrosos que la información.' },
  // ---- Concentración: alcohol
  { cat: 'Alcohol: Concentración y Tipo de Bebida', texto: 'Es más seguro tomar varias latas de cerveza que un par de tragos con vodka, porque la cerveza es más suave.', resp: 'FALSO',
    debate: 'Esta es una de las confusiones más comunes y peligrosas. Aquí se debe introducir el concepto de "Unidad de Bebida Estándar" (UBE) o Trago Estándar. La cantidad de alcohol puro es la misma en:\n• Una lata de cerveza (350 ml, 5% alcohol).\n• Una copa de vino (150 ml, 12% alcohol).\n• Una medida de bebida destilada (45 ml, 40% alcohol), como vodka, fernet o whisky.\nPor lo tanto, tomar dos latas de cerveza es ingerir el doble de alcohol que un solo shot de vodka. La "suavidad" o el volumen del líquido engañan la percepción, pero no cambian la matemática del alcohol que entra en tu cuerpo.' },
  { cat: 'Alcohol: Concentración y Tipo de Bebida', texto: 'Como el fernet con coca se sirve en un vaso grande y tiene mucha gaseosa, el alcohol "se diluye" y pega menos.', resp: 'FALSO',
    debate: 'La cantidad de alcohol es la misma, sin importar cuánta gaseosa le agregues. Diluirlo solo cambia el sabor y el volumen, pero la medida de fernet (que es de alta graduación, ~40%) sigue entrando completa a tu organismo. De hecho, el sabor dulce de la gaseosa puede enmascarar el del alcohol, haciendo que se beba más rápido y en mayor cantidad, aumentando el riesgo de intoxicación.' },
  { cat: 'Alcohol: Concentración y Tipo de Bebida', texto: 'Un shot de tequila "te sube" más rápido que una copa de vino.', resp: 'VERDADERO, PERO...',
    debate: '"Verdadero" porque al consumir la misma cantidad de alcohol en un volumen mucho menor y de forma rápida (un solo trago), el nivel de alcohol en sangre tiende a subir más bruscamente. "Pero..." la cantidad final de alcohol que procesará tu cuerpo por cada "trago estándar" es la misma. El efecto final de emborracharse depende de la cantidad total consumida y la velocidad, no solo del tipo de bebida.' },
  // ---- Concentración: cannabis
  { cat: 'Cannabis: Potencia, Cepas y Formas de Consumo', texto: 'El "prensado paraguayo" y las "flores" son lo mismo, solo que las flores son más caras.', resp: 'FALSO',
    debate: 'La diferencia es abismal.\n• El prensado es cannabis de baja calidad, mezclado con otras partes de la planta (hojas, tallos) y compactado. Su nivel de THC es relativamente bajo e inconsistente. Además, puede contener hongos, amoníaco u otros contaminantes por su proceso de producción y transporte.\n• Las flores (cogollos) son la parte de la planta con la mayor concentración de THC. Las cepas actuales han sido seleccionadas genéticamente durante años para maximizar su potencia, que puede ser 5, 10 o incluso 20 veces superior a la del cannabis de hace unas décadas.' },
  { cat: 'Cannabis: Potencia, Cepas y Formas de Consumo', texto: 'La marihuana de ahora es mucho más fuerte y riesgosa que la que consumían nuestros padres.', resp: 'VERDADERO',
    debate: 'Es un hecho científico. El cannabis disponible hoy, especialmente las "flores" de cultivo controlado, tiene una concentración de THC muchísimo más elevada. Esto no solo significa un efecto psicoactivo más intenso, sino también un mayor riesgo de experimentar efectos adversos como ansiedad, paranoia, ataques de pánico y, en personas vulnerables, el desarrollo de trastornos psicóticos. El cerebro adolescente es especialmente sensible a estas altas concentraciones.' },
  { cat: 'Cannabis: Potencia, Cepas y Formas de Consumo', texto: 'Comer un brownie con marihuana es más suave que fumar un porro porque no daña los pulmones.', resp: 'FALSO',
    debate: 'Si bien es cierto que no daña los pulmones, el efecto de los comestibles puede ser mucho más intenso, impredecible y duradero.\n• Al fumar: el efecto es casi inmediato (minutos) y dura 1-3 horas. Es más fácil "medir" la dosis.\n• Al comer: el efecto tarda mucho en aparecer (entre 45 minutos y 2 horas), porque tiene que pasar por el sistema digestivo. Muchas personas, pensando que "no les pegó", cometen el error de comer más. Cuando el efecto finalmente llega, es mucho más potente y puede durar entre 4 y 8 horas, aumentando enormemente el riesgo de un "mal viaje", pánico o intoxicación.' },
  { cat: 'Cannabis: Potencia, Cepas y Formas de Consumo', texto: 'Mientras más THC tenga el cannabis, es de mejor calidad.', resp: 'VERDADERO, PERO...',
    debate: '"Verdadero" en el sentido de que la potencia psicoactiva es mayor, que es lo que muchos usuarios buscan. "Pero..." la "calidad" de la experiencia no depende solo del THC. El cannabis tiene otros componentes como el CBD (cannabidiol), que no es psicoactivo y tiene efectos relajantes y ansiolíticos que modulan y equilibran al THC. Cepas con un THC altísimo y casi nada de CBD son las que tienen mayor probabilidad de provocar ansiedad y paranoia. Por lo tanto, "más potente" no siempre significa "mejor" o "más seguro".' }
];

// Secciones de consulta (HTML simple, contenido fijo del documento original).
window.CONSULTA = [
  { titulo: 'Instrucciones para el docente', html: `
<h4>Objetivos</h4>
<ul><li>Identificar y cuestionar mitos comunes asociados al consumo de drogas recreativas.</li>
<li>Informar sobre los riesgos asociados al consumo problemático de alcohol, nicotina, marihuana, cocaína y drogas sintéticas.</li></ul>
<h4>Paso 1: Preparación</h4>
<p>Pegá cada cartel en una esquina diferente de la sala (o proyectá la pantalla de las 4 esquinas). Explicá el objetivo: no es un examen, sino una oportunidad para reflexionar y debatir juntos. El respeto por todas las opiniones es fundamental.</p>
<h4>Paso 2: Reglas</h4>
<p>"Voy a leer una serie de frases en voz alta. Después de escuchar cada una, deberán pensar y caminar hacia la esquina que mejor represente su opinión."</p>
<h4>Paso 3: Desarrollo</h4>
<ul><li>Leé la afirmación y dales unos 30 segundos para elegir esquina.</li>
<li>Pedí a un voluntario de cada esquina (empezando por las más pobladas) que explique por qué eligió esa opción.</li>
<li>Prestá especial atención a "Verdadero, pero...": ¿Cuál es el "pero"? ¿Qué le falta o le sobra a la frase para ser completamente cierta?</li>
<li>Animá a los de "Falso" a rebatir los argumentos de los de "Verdadero".</li>
<li>Preguntá a los de "No sé" si los argumentos escuchados les ayudan a inclinarse por una opción.</li>
<li>Tras 2-4 minutos de debate, ofrecé la información correcta, clara y basada en evidencia.</li>
<li>Es mejor un buen debate sobre 5-7 frases que pasar rápido por 15.</li></ul>
<h4>Paso 4: Cierre y reflexión</h4>
<p>Reuní al grupo en el centro. ¿Qué les sorprendió? ¿Cambiaron de opinión sobre algo? ¿Qué idea se llevan? Reforzá que la adicción es una enfermedad que afecta al cerebro y que buscar ayuda es un acto de fortaleza. Compartí los recursos de ayuda (ver "Fuentes y ayuda").</p>` },

  { titulo: 'Definiciones clave', html: `
<h4>Consumo recreativo vs. consumo problemático</h4>
<p><b>Consumo recreativo / uso:</b> consumo ocasional, en contextos sociales específicos, donde la persona mantiene el control y no experimenta consecuencias negativas significativas en su vida (salud, trabajo, estudios, relaciones). La sustancia no ocupa un lugar central.</p>
<p><b>Consumo problemático / abuso:</b> el consumo empieza a tener consecuencias negativas y la persona sigue consumiendo a pesar de ellas. No se trata solo de cantidad o frecuencia, sino del vínculo con la sustancia. Indicadores:</p>
<ul><li>Necesitar la sustancia para relajarse, divertirse o socializar.</li>
<li>Descuidar responsabilidades (faltar a clase, bajar el rendimiento).</li>
<li>Tener problemas familiares o de amistad a causa del consumo.</li>
<li>Ponerse en situaciones de riesgo (conducir bajo los efectos, relaciones sexuales sin protección).</li>
<li>El consumo se vuelve una prioridad.</li></ul>
<h4>Drogas legales vs. ilegales</h4>
<p>La diferencia no es médica ni científica, sino legal y cultural.</p>
<p><b>Legales:</b> su producción, venta y consumo están permitidos y regulados (alcohol, tabaco, psicofármacos con receta). Su legalidad no las hace inofensivas: el alcohol y el tabaco son las drogas que más problemas de salud pública generan a nivel mundial.</p>
<p><b>Ilegales:</b> su producción, venta o posesión están prohibidas y penadas (marihuana en la mayoría de los lugares, cocaína, heroína, éxtasis). Al no estar reguladas conllevan riesgos añadidos como la adulteración y la exposición a la violencia del narcotráfico.</p>
<h4>Consumir de adolescente y de adulto</h4>
<p>El cerebro adolescente está en pleno desarrollo, especialmente la corteza prefrontal (juicio, toma de decisiones, control de impulsos, planificación).</p>
<ul><li><b>Mayor vulnerabilidad a la adicción:</b> el sistema de recompensa es más sensible; el paso del uso a la adicción es mucho más rápido.</li>
<li><b>Daño al desarrollo cerebral:</b> puede dañar de forma permanente la corteza prefrontal, con dificultades crónicas para controlar impulsos, resolver problemas y regular emociones.</li>
<li><b>Mayor riesgo en salud mental:</b> puede desenmascarar o agravar depresión, ansiedad o psicosis.</li></ul>
<p><b>Cerebro adulto:</b> también es vulnerable, pero ya completó sus principales etapas de desarrollo; no se interrumpe un proceso de maduración tan crítico.</p>` },

  { titulo: 'Fichas de sustancias', html: `
<h4>Ficha 1: ALCOHOL</h4>
<p><b>Nombres comunes:</b> cerveza, vino, fernet, vodka, gin, "escabio". <b>Tipo:</b> DEPRESORA del SNC (aunque al principio desinhibe). <b>Estatus legal:</b> legal para mayores de 18 años; venta y publicidad reguladas.</p>
<p><b>Corto plazo:</b> euforia inicial, desinhibición, relajación y sociabilidad. Adversos: disminución de reflejos y coordinación, dificultad para hablar, visión borrosa, náuseas, vómitos; a dosis altas, coma etílico y muerte por paro respiratorio.</p>
<p><b>Largo plazo:</b> físicos (hígado graso, hepatitis, cirrosis, problemas gástricos, daño cerebral, problemas cardíacos, cáncer); mentales (depresión, ansiedad, memoria, dependencia); sociales (conflictos, violencia, accidentes de tránsito, problemas laborales o académicos).</p>
<p><b>Potencial de adicción:</b> ALTO. Genera tolerancia y fuerte dependencia física y psicológica; la abstinencia puede ser severa y peligrosa.</p>
<p><b>Mito:</b> "El alcohol no es una droga". Es la droga que más problemas sanitarios y sociales causa en el mundo. <b>Peligro extremo:</b> mezclarlo con energizantes enmascara la borrachera; con psicofármacos potencia el efecto depresor y puede ser mortal.</p>
<h4>Ficha 2: NICOTINA (tabaco y vapeo)</h4>
<p><b>Nombres comunes:</b> pucho, cigarrillo, tabaco, vaper. <b>Tipo:</b> ESTIMULANTE. <b>Estatus legal:</b> legal para mayores de 18 años.</p>
<p><b>Corto plazo:</b> alerta y concentración, aparente relajación (en realidad calma la ansiedad de la propia abstinencia). Adversos: aumento del ritmo cardíaco y la presión, mareos, tos, mal aliento.</p>
<p><b>Largo plazo:</b> tabaco: cáncer (pulmón, boca, laringe…), EPOC, infartos, ACV, envejecimiento de la piel. Vapeo: se investiga; el aerosol contiene químicos dañinos y se asocia con lesiones pulmonares graves (EVALI) e inflamación de vías respiratorias.</p>
<p><b>Potencial de adicción:</b> MUY ALTO; la dependencia se establece muy rápido, sobre todo en adolescentes.</p>
<p><b>Mito:</b> "Vapear es inocuo, es solo vapor". FALSO: es un aerosol con nicotina, propilenglicol y saborizantes que al calentarse pueden volverse tóxicos. <b>Dato:</b> la mayoría de los fumadores adultos comenzaron en la adolescencia.</p>
<h4>Ficha 3: MARIHUANA (cannabis)</h4>
<p><b>Nombres comunes:</b> porro, faso, flor, maría, hierba, mota, charuto. <b>Tipo:</b> PERTURBADORA / ALUCINÓGENA (efectos mixtos). <b>Estatus legal:</b> comercialización ilegal; la tenencia para consumo personal está de facto descriminalizada en Argentina y existe el REPROCANN para usuarios medicinales.</p>
<p><b>Corto plazo:</b> relajación, bienestar, risa fácil, sentidos intensificados. Adversos: ansiedad, paranoia ("mal viaje"), alteración de memoria y concentración, boca seca, taquicardia, descoordinación.</p>
<p><b>Largo plazo:</b> si se fuma, problemas respiratorios crónicos. Puede generar dependencia; afecta aprendizaje, memoria y motivación ("síndrome amotivacional"); en personas predispuestas puede desencadenar psicosis o empeorar depresión y ansiedad. Riesgo mucho mayor en adolescentes.</p>
<p><b>Potencial de adicción:</b> MODERADO (principalmente psicológica; existe abstinencia con irritabilidad, insomnio y ansiedad).</p>
<p><b>Mito:</b> "Es natural, por eso no hace mal". FALSO. La marihuana actual tiene concentraciones de THC mucho más altas que hace 20-30 años.</p>
<h4>Ficha 4: COCAÍNA / PASTA BASE (paco)</h4>
<p><b>Nombres comunes:</b> coca, merca, pala, polvo; paco, basuco, base. <b>Tipo:</b> ESTIMULANTE muy potente. <b>Estatus legal:</b> ilegal.</p>
<p><b>Corto plazo:</b> euforia intensa, grandiosidad, energía, supresión del hambre y el sueño. Adversos: presión y ritmo cardíaco peligrosamente altos, paranoia, pánico, agresividad; el "bajón" posterior incita a volver a consumir.</p>
<p><b>Largo plazo:</b> daño del tabique nasal, riesgo altísimo de infarto y ACV (incluso en jóvenes), desnutrición, insomnio; adicción severa, psicosis, depresión. El paco tiene efectos casi instantáneos y muy breves, con deterioro rápido y devastador.</p>
<p><b>Potencial de adicción:</b> MUY ALTO.</p>
<p><b>Mito:</b> "Yo controlo, solo la uso para salir de fiesta". FALSO. El riesgo de muerte súbita existe desde el primer consumo.</p>
<h4>Ficha 5: DROGAS SINTÉTICAS (éxtasis / MDMA)</h4>
<p><b>Nombres comunes:</b> rola, pasti, cristal, MDMA; también el "tusi" o cocaína rosa (mezcla impredecible). <b>Tipo:</b> ESTIMULANTE y ALUCINÓGENA (empatógena-entactógena). <b>Estatus legal:</b> ilegal.</p>
<p><b>Corto plazo:</b> empatía y cercanía, euforia, energía, hipersensibilidad al tacto y la música. Adversos: golpe de calor, deshidratación, presión alta, bruxismo, ansiedad y confusión.</p>
<p><b>Largo plazo:</b> el golpe de calor puede ser mortal; posible daño a neuronas de serotonina (depresión, ansiedad, memoria); "bajones" intensos en los días posteriores.</p>
<p><b>Potencial de adicción:</b> MODERADO; tolerancia rápida.</p>
<p><b>Mito:</b> "Son drogas seguras hechas en laboratorios". FALSO: laboratorios clandestinos sin control; una pastilla puede contener cafeína, ketamina, metanfetaminas, etc.</p>
<h4>Ficha 6: PSICOFÁRMACOS (sin prescripción)</h4>
<p><b>Nombres comunes:</b> clonazepam ("clona"), alprazolam, diazepam, tramadol. <b>Tipo:</b> DEPRESORAS (benzodiacepinas) u opioides. <b>Estatus legal:</b> legal SOLO con receta archivada.</p>
<p><b>Corto plazo:</b> sedación, relajación muscular, somnolencia, alivio de ansiedad o dolor. Adversos: confusión, mareos, amnesia anterógrada, reflejos muy disminuidos.</p>
<p><b>Largo plazo:</b> altísima dependencia física y psicológica, a veces en pocas semanas; abstinencia severa (convulsiones, pánico); deterioro cognitivo.</p>
<p><b>Potencial de adicción:</b> ALTO a MUY ALTO.</p>
<p><b>Mito:</b> "Como son de farmacia, no son peligrosos". FALSO. <b>Peligro extremo:</b> combinarlos con alcohol puede provocar un paro cardiorrespiratorio.</p>` },

  { titulo: 'Glosario', html: `
<h4>Conceptos fundamentales</h4>
<p><b>Adicción (dependencia):</b> enfermedad crónica y recurrente del cerebro caracterizada por la búsqueda y el consumo compulsivo de una droga a pesar de sus consecuencias. No es falta de voluntad, sino una alteración de los circuitos del placer, la memoria y el autocontrol.</p>
<p><b>Consumo problemático (abuso):</b> patrón de consumo que genera consecuencias negativas en una o varias áreas de la vida. Es el puente entre el uso ocasional y la adicción.</p>
<p><b>Consumo recreativo (uso):</b> consumo esporádico, generalmente social, con control y sin consecuencias negativas significativas.</p>
<p><b>Tolerancia:</b> adaptación del cuerpo que obliga a aumentar la dosis para conseguir los mismos efectos.</p>
<p><b>Síndrome de abstinencia:</b> síntomas físicos y psicológicos (temblores, ansiedad, sudoración, insomnio) al dejar bruscamente una droga de la que se depende.</p>
<p><b>Sobredosis:</b> consumo superior al que el cuerpo puede procesar, con reacción tóxica grave que puede llevar al coma o la muerte. El riesgo es mayor al mezclar sustancias.</p>
<h4>Tipos de drogas según su efecto</h4>
<p><b>Depresoras:</b> ralentizan el SNC. Ej.: alcohol, benzodiacepinas, opioides.</p>
<p><b>Estimulantes:</b> aceleran el SNC. Ej.: nicotina, cocaína, anfetaminas, cafeína, MDMA.</p>
<p><b>Perturbadoras (alucinógenas):</b> alteran la percepción. Ej.: cannabis, LSD, hongos alucinógenos.</p>
<h4>Términos neurobiológicos y de salud</h4>
<p><b>Sistema Nervioso Central (SNC):</b> cerebro y médula espinal; todas las drogas psicoactivas modifican su funcionamiento.</p>
<p><b>Sistema de recompensa:</b> circuito que nos motiva a repetir conductas placenteras y necesarias. Las drogas lo "secuestran" liberando cantidades masivas de dopamina.</p>
<p><b>Corteza prefrontal:</b> la "gerente" del cerebro (decisiones, control de impulsos, juicio, planificación). Madura alrededor de los 25 años, por eso es especialmente vulnerable en la adolescencia.</p>
<p><b>Neurotransmisores:</b> mensajeros químicos (dopamina, serotonina) cuyo equilibrio alteran las drogas.</p>
<h4>Términos legales y sociales</h4>
<p><b>Droga legal:</b> consumo, producción y venta permitidos con restricciones. Su legalidad no implica que sea segura.</p>
<p><b>Droga ilegal:</b> producción, venta y tenencia prohibidas y penadas.</p>
<p><b>Reducción de daños:</b> estrategias de salud pública que buscan disminuir las consecuencias negativas del consumo sin exigir necesariamente la abstinencia total.</p>` },

  { titulo: 'Fuentes y ayuda', html: `
<h4>Pedir ayuda</h4>
<ul><li><a href="https://www.argentina.gob.ar/tema/cuidarlasalud/recuperacion-de-adicciones" target="_blank" rel="noopener">Recuperación de adicciones: teléfonos de consulta y ayuda, centros de atención (Gobierno nacional)</a></li>
<li><a href="https://www.argentina.gob.ar/salud/hospitalbonaparte" target="_blank" rel="noopener">Hospital Nacional en Red "Lic. Laura Bonaparte"</a>: especializado en salud mental y consumos problemáticos.</li></ul>
<h4>Fuentes confiables</h4>
<ul><li><a href="https://www.argentina.gob.ar/sites/default/files/manual_de_conceptos_y_herramientas_para_la_investigacion_sobre_el_consumo_de_sustancias_psicoactivas.pdf" target="_blank" rel="noopener">Manual de conceptos y herramientas para la investigación sobre consumo de sustancias psicoactivas</a> (Ministerio de Salud de la Nación).</li>
<li><a href="https://buenosaires.gob.ar/sites/default/files/2024-07/H197%20-%20Cuadernillo%20de%20Actividades%20para%20Adicciones%20%281%29.pdf" target="_blank" rel="noopener">Manual de actividades para adicciones</a> (Ministerio de Desarrollo Humano y Hábitat, CABA).</li>
<li><a href="https://nida.nih.gov/es/publicaciones/las-drogas-el-cerebro-y-la-conducta-la-ciencia-de-la-adiccion/tratamiento-y-recuperacion" target="_blank" rel="noopener">Las drogas, el cerebro y la conducta: la ciencia de la adicción. Tratamiento y recuperación</a> (NIDA, EE.UU.).</li>
<li><a href="https://elgatoylacaja.com/libros/sobre-drogas/como-medimos-los-danos-causados-por-las-drogas" target="_blank" rel="noopener">¿Cómo medimos los daños causados por las drogas?</a></li>
<li><a href="https://elgatoylacaja.com/notas/dame-las-drogas-lisa" target="_blank" rel="noopener">Dame las drogas, Lisa</a>: nota sobre medición de daños por drogas.</li>
<li><a href="https://elgatoylacaja.com/libros/sobre-drogas" target="_blank" rel="noopener">Sobre drogas</a>: libro sobre drogas, ciencia y política.</li></ul>` }
];
