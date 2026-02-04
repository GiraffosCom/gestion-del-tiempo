/**
 * Exercise Database
 * @description Base de datos de ejercicios para entrenamiento
 * @module data/exercises
 */

/**
 * Database of exercises organized by muscle group
 * Each exercise has: name, equipment required, level, default sets/reps
 */
export const EXERCISE_DATABASE = {
    glutes: [
        { name: 'Hip Thrust', equipment: ['barbell', 'machines'], level: 'all', sets: 4, reps: '10-12' },
        { name: 'Romanian Deadlift', equipment: ['barbell', 'dumbbells'], level: 'all', sets: 4, reps: '10-12' },
        { name: 'Bulgarian Split Squat', equipment: ['dumbbells', 'bodyweight'], level: 'intermediate', sets: 3, reps: '10-12' },
        { name: 'Cable Kickback', equipment: ['cables'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Glute Bridge', equipment: ['bodyweight'], level: 'beginner', sets: 3, reps: '15-20' },
        { name: 'Sumo Squat', equipment: ['dumbbells', 'barbell'], level: 'all', sets: 3, reps: '12-15' }
    ],
    legs: [
        { name: 'Squat', equipment: ['barbell', 'machines'], level: 'all', sets: 4, reps: '8-10' },
        { name: 'Leg Press', equipment: ['machines'], level: 'all', sets: 4, reps: '10-12' },
        { name: 'Leg Extension', equipment: ['machines'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Leg Curl', equipment: ['machines'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Lunges', equipment: ['dumbbells', 'bodyweight'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Calf Raises', equipment: ['machines', 'bodyweight'], level: 'all', sets: 4, reps: '15-20' }
    ],
    chest: [
        { name: 'Bench Press', equipment: ['barbell'], level: 'all', sets: 4, reps: '8-10' },
        { name: 'Incline DB Press', equipment: ['dumbbells'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Cable Flyes', equipment: ['cables'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Push Ups', equipment: ['bodyweight'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Chest Press Machine', equipment: ['machines'], level: 'beginner', sets: 3, reps: '10-12' }
    ],
    back: [
        { name: 'Lat Pulldown', equipment: ['cables', 'machines'], level: 'all', sets: 4, reps: '10-12' },
        { name: 'Barbell Row', equipment: ['barbell'], level: 'intermediate', sets: 4, reps: '8-10' },
        { name: 'Seated Cable Row', equipment: ['cables'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Pull Ups', equipment: ['bodyweight'], level: 'intermediate', sets: 3, reps: '8-12' },
        { name: 'Dumbbell Row', equipment: ['dumbbells'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Face Pulls', equipment: ['cables'], level: 'all', sets: 3, reps: '15-20' }
    ],
    shoulders: [
        { name: 'Overhead Press', equipment: ['barbell', 'dumbbells'], level: 'all', sets: 4, reps: '8-10' },
        { name: 'Lateral Raises', equipment: ['dumbbells', 'cables'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Front Raises', equipment: ['dumbbells'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Rear Delt Flyes', equipment: ['dumbbells', 'cables'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Arnold Press', equipment: ['dumbbells'], level: 'intermediate', sets: 3, reps: '10-12' }
    ],
    arms: [
        { name: 'Bicep Curls', equipment: ['dumbbells', 'barbell', 'cables'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Tricep Pushdown', equipment: ['cables'], level: 'all', sets: 3, reps: '12-15' },
        { name: 'Hammer Curls', equipment: ['dumbbells'], level: 'all', sets: 3, reps: '10-12' },
        { name: 'Skull Crushers', equipment: ['barbell', 'dumbbells'], level: 'intermediate', sets: 3, reps: '10-12' },
        { name: 'Tricep Dips', equipment: ['bodyweight'], level: 'intermediate', sets: 3, reps: '10-15' },
        { name: 'Preacher Curls', equipment: ['barbell', 'dumbbells'], level: 'all', sets: 3, reps: '10-12' }
    ],
    core: [
        { name: 'Plank', equipment: ['bodyweight'], level: 'all', sets: 3, reps: '30-60s' },
        { name: 'Cable Crunch', equipment: ['cables'], level: 'all', sets: 3, reps: '15-20' },
        { name: 'Hanging Leg Raise', equipment: ['bodyweight'], level: 'intermediate', sets: 3, reps: '10-15' },
        { name: 'Russian Twist', equipment: ['bodyweight', 'dumbbells'], level: 'all', sets: 3, reps: '20-30' },
        { name: 'Dead Bug', equipment: ['bodyweight'], level: 'beginner', sets: 3, reps: '10-12' },
        { name: 'Ab Wheel Rollout', equipment: ['bodyweight'], level: 'advanced', sets: 3, reps: '8-12' }
    ]
};

/**
 * Training split types based on days per week
 */
export const TRAINING_SPLITS = {
    3: {
        full_body: { name: 'Full Body', routine: ['full', 'full', 'full'], icon: '🔄' },
        push_pull_legs: { name: 'Push/Pull/Legs', routine: ['push', 'pull', 'legs'], icon: '💪' }
    },
    4: {
        upper_lower: { name: 'Upper/Lower', routine: ['upper', 'lower', 'upper', 'lower'], icon: '⬆️⬇️' },
        push_pull: { name: 'Push/Pull 2x', routine: ['push', 'pull', 'push', 'pull'], icon: '🔁' }
    },
    5: {
        ppl_upper_lower: { name: 'PPL + Upper/Lower', routine: ['push', 'pull', 'legs', 'upper', 'lower'], icon: '📅' },
        bro_split: { name: 'Bro Split', routine: ['chest', 'back', 'shoulders', 'legs', 'arms'], icon: '💥' }
    },
    6: {
        ppl_2x: { name: 'PPL 2x/semana', routine: ['push', 'pull', 'legs', 'push', 'pull', 'legs'], icon: '🔥' }
    }
};

/**
 * Routine type definitions for muscle group targeting
 */
export const ROUTINE_TYPES = {
    push: {
        name: 'Push',
        icon: '💪',
        muscles: ['chest', 'shoulders', 'arms'],
        primaryMuscles: ['chest', 'shoulders'],
        secondaryMuscles: ['arms']
    },
    pull: {
        name: 'Pull',
        icon: '🔙',
        muscles: ['back', 'arms'],
        primaryMuscles: ['back'],
        secondaryMuscles: ['arms']
    },
    legs: {
        name: 'Legs',
        icon: '🦵',
        muscles: ['legs', 'glutes', 'core'],
        primaryMuscles: ['legs', 'glutes'],
        secondaryMuscles: ['core']
    },
    upper: {
        name: 'Upper Body',
        icon: '💪',
        muscles: ['chest', 'back', 'shoulders', 'arms'],
        primaryMuscles: ['chest', 'back'],
        secondaryMuscles: ['shoulders', 'arms']
    },
    lower: {
        name: 'Lower Body',
        icon: '🦵',
        muscles: ['legs', 'glutes', 'core'],
        primaryMuscles: ['legs', 'glutes'],
        secondaryMuscles: ['core']
    },
    full: {
        name: 'Full Body',
        icon: '🔥',
        muscles: ['chest', 'back', 'legs', 'shoulders', 'core'],
        primaryMuscles: ['chest', 'back', 'legs'],
        secondaryMuscles: ['shoulders', 'core']
    },
    chest: { name: 'Chest', icon: '💪', muscles: ['chest', 'arms'], primaryMuscles: ['chest'], secondaryMuscles: ['arms'] },
    back: { name: 'Back', icon: '🔙', muscles: ['back', 'arms'], primaryMuscles: ['back'], secondaryMuscles: ['arms'] },
    shoulders: { name: 'Shoulders', icon: '🏋️', muscles: ['shoulders', 'arms'], primaryMuscles: ['shoulders'], secondaryMuscles: ['arms'] },
    arms: { name: 'Arms', icon: '💪', muscles: ['arms'], primaryMuscles: ['arms'], secondaryMuscles: [] }
};

/**
 * Exercise information with descriptions, tips, and images
 */
export const EXERCISE_INFO = {
    // === CHEST ===
    'Bench Press': {
        spanish: 'Press de Banca',
        muscle: 'Pecho',
        description: 'Acostado en un banco plano, baja la barra al pecho y empuja hacia arriba. Mantén los pies firmes en el suelo y la espalda ligeramente arqueada.',
        tips: 'Agarra la barra un poco más ancho que los hombros. Baja controladamente y explota al subir.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'
    },
    'Incline DB Press': {
        spanish: 'Press Inclinado con Mancuernas',
        muscle: 'Pecho superior',
        description: 'En banco inclinado (30-45°), presiona las mancuernas hacia arriba desde los hombros.',
        tips: 'No inclines demasiado el banco. Junta las mancuernas arriba sin chocarlas.',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'
    },
    'Cable Flyes': {
        spanish: 'Aperturas en Polea',
        muscle: 'Pecho',
        description: 'De pie entre poleas, junta las manos al frente en un movimiento de abrazo.',
        tips: 'Codos ligeramente flexionados. Aprieta el pecho al juntar las manos.',
        image: 'https://images.unsplash.com/photo-1597452485677-d661670d9640?w=400&h=300&fit=crop'
    },
    'Push Ups': {
        spanish: 'Flexiones',
        muscle: 'Pecho, tríceps',
        description: 'Boca abajo, empuja el cuerpo hacia arriba manteniendo el cuerpo recto.',
        tips: 'Manos a la anchura de hombros. Baja hasta que el pecho casi toque el suelo.',
        image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'
    },
    'Chest Press Machine': {
        spanish: 'Press de Pecho en Máquina',
        muscle: 'Pecho',
        description: 'Sentado en la máquina, empuja las manijas hacia adelante extendiendo los brazos.',
        tips: 'Ajusta el asiento para que las manijas estén a la altura del pecho.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
    },
    // === BACK ===
    'Lat Pulldown': {
        spanish: 'Jalón al Pecho',
        muscle: 'Dorsales',
        description: 'Sentado, jala la barra hacia el pecho superior, apretando los dorsales.',
        tips: 'Inclínate ligeramente hacia atrás. Lleva los codos hacia abajo y atrás.',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop'
    },
    'Barbell Row': {
        spanish: 'Remo con Barra',
        muscle: 'Espalda media',
        description: 'Inclinado hacia adelante, jala la barra hacia el abdomen bajo apretando la espalda.',
        tips: 'Espalda recta, core apretado. Jala con los codos, no con los brazos.',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop'
    },
    'Seated Cable Row': {
        spanish: 'Remo Sentado en Polea',
        muscle: 'Espalda media',
        description: 'Sentado, jala el agarre hacia el abdomen manteniendo el torso erguido.',
        tips: 'No te inclines hacia atrás. Aprieta los omóplatos al final.',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop'
    },
    'Pull Ups': {
        spanish: 'Dominadas',
        muscle: 'Espalda, bíceps',
        description: 'Colgado de una barra, jálate hacia arriba hasta que la barbilla pase la barra.',
        tips: 'Agarre más ancho que hombros. Aprieta dorsales al subir.',
        image: 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=400&h=300&fit=crop'
    },
    'Dumbbell Row': {
        spanish: 'Remo con Mancuerna',
        muscle: 'Espalda',
        description: 'Apoyado en un banco, jala la mancuerna hacia la cadera.',
        tips: 'Mantén la espalda paralela al suelo. Aprieta el dorsal arriba.',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop'
    },
    'Face Pulls': {
        spanish: 'Tirón a la Cara',
        muscle: 'Deltoides posterior',
        description: 'Con polea alta, jala hacia la cara separando las manos.',
        tips: 'Codos altos. Aprieta los omóplatos al final del movimiento.',
        image: 'https://images.unsplash.com/photo-1597452485677-d661670d9640?w=400&h=300&fit=crop'
    },
    // === SHOULDERS ===
    'Overhead Press': {
        spanish: 'Press Militar',
        muscle: 'Hombros',
        description: 'De pie o sentado, presiona la barra desde los hombros hasta arriba de la cabeza.',
        tips: 'Core apretado. No arquees demasiado la espalda.',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&fit=crop'
    },
    'Lateral Raises': {
        spanish: 'Elevaciones Laterales',
        muscle: 'Deltoides lateral',
        description: 'De pie, eleva las mancuernas hacia los lados hasta la altura de los hombros.',
        tips: 'Codos ligeramente flexionados. No balancees el cuerpo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Front Raises': {
        spanish: 'Elevaciones Frontales',
        muscle: 'Deltoides frontal',
        description: 'De pie, eleva las mancuernas al frente hasta la altura de los hombros.',
        tips: 'Movimiento controlado. Alterna brazos o hazlo simultáneo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Rear Delt Flyes': {
        spanish: 'Aperturas para Deltoides Posterior',
        muscle: 'Deltoides posterior',
        description: 'Inclinado, abre los brazos hacia los lados apretando la espalda alta.',
        tips: 'Codos ligeramente flexionados. Aprieta los omóplatos.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Arnold Press': {
        spanish: 'Press Arnold',
        muscle: 'Hombros completos',
        description: 'Sentado, comienza con mancuernas al frente y rota mientras presionas arriba.',
        tips: 'Movimiento fluido de rotación. Trabaja todos los deltoides.',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&fit=crop'
    },
    // === LEGS ===
    'Squat': {
        spanish: 'Sentadilla',
        muscle: 'Cuádriceps, glúteos',
        description: 'Con barra en la espalda, baja flexionando rodillas y caderas hasta que los muslos queden paralelos al suelo.',
        tips: 'Rodillas en línea con los pies. Pecho arriba, core apretado.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Leg Press': {
        spanish: 'Prensa de Piernas',
        muscle: 'Cuádriceps, glúteos',
        description: 'Sentado en la máquina, empuja la plataforma extendiendo las piernas.',
        tips: 'No bloquees las rodillas arriba. Baja controladamente.',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop'
    },
    'Leg Extension': {
        spanish: 'Extensión de Piernas',
        muscle: 'Cuádriceps',
        description: 'Sentado, extiende las piernas contra la resistencia.',
        tips: 'Aprieta el cuádriceps arriba. Baja lentamente.',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop'
    },
    'Leg Curl': {
        spanish: 'Curl de Piernas',
        muscle: 'Isquiotibiales',
        description: 'Acostado o sentado, flexiona las piernas hacia los glúteos.',
        tips: 'Aprieta los isquiotibiales. Movimiento controlado.',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop'
    },
    'Lunges': {
        spanish: 'Zancadas',
        muscle: 'Cuádriceps, glúteos',
        description: 'Da un paso adelante y baja la rodilla trasera casi al suelo.',
        tips: 'Rodilla delantera no pasa la punta del pie. Torso erguido.',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop'
    },
    'Calf Raises': {
        spanish: 'Elevación de Talones',
        muscle: 'Pantorrillas',
        description: 'De pie, elévate sobre las puntas de los pies.',
        tips: 'Pausa arriba para máxima contracción. Baja lentamente.',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop'
    },
    // === GLUTES ===
    'Hip Thrust': {
        spanish: 'Empuje de Cadera',
        muscle: 'Glúteos',
        description: 'Espalda apoyada en banco, empuja la cadera hacia arriba con barra sobre la pelvis.',
        tips: 'Aprieta los glúteos arriba. Barbilla al pecho.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Romanian Deadlift': {
        spanish: 'Peso Muerto Rumano',
        muscle: 'Isquiotibiales, glúteos',
        description: 'De pie, baja la barra manteniendo las piernas casi rectas.',
        tips: 'Espalda recta. Siente el estiramiento en isquiotibiales.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Bulgarian Split Squat': {
        spanish: 'Sentadilla Búlgara',
        muscle: 'Cuádriceps, glúteos',
        description: 'Un pie atrás en banco, baja flexionando la pierna delantera.',
        tips: 'Torso ligeramente inclinado. Rodilla en línea con el pie.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Cable Kickback': {
        spanish: 'Patada en Polea',
        muscle: 'Glúteos',
        description: 'Con tobillera en polea baja, extiende la pierna hacia atrás.',
        tips: 'Aprieta el glúteo arriba. No arquees la espalda.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Glute Bridge': {
        spanish: 'Puente de Glúteos',
        muscle: 'Glúteos',
        description: 'Acostado, eleva la cadera apretando los glúteos.',
        tips: 'Pies a la anchura de caderas. Aprieta arriba 2 segundos.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    'Sumo Squat': {
        spanish: 'Sentadilla Sumo',
        muscle: 'Glúteos, aductores',
        description: 'Postura amplia, pies hacia afuera, baja en sentadilla.',
        tips: 'Rodillas siguen la dirección de los pies. Pecho arriba.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'
    },
    // === ARMS ===
    'Bicep Curls': {
        spanish: 'Curl de Bíceps',
        muscle: 'Bíceps',
        description: 'De pie, flexiona los codos subiendo las mancuernas hacia los hombros.',
        tips: 'Codos pegados al cuerpo. No balancees.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Tricep Pushdown': {
        spanish: 'Extensión de Tríceps en Polea',
        muscle: 'Tríceps',
        description: 'En polea alta, extiende los brazos hacia abajo.',
        tips: 'Codos pegados al cuerpo. Aprieta el tríceps abajo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Hammer Curls': {
        spanish: 'Curl Martillo',
        muscle: 'Bíceps, braquial',
        description: 'Como curl de bíceps pero con agarre neutro (palmas enfrentadas).',
        tips: 'Trabaja el braquial y aumenta el grosor del brazo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Skull Crushers': {
        spanish: 'Rompecráneos',
        muscle: 'Tríceps',
        description: 'Acostado, baja la barra hacia la frente y extiende.',
        tips: 'Codos fijos. Movimiento solo del antebrazo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Tricep Dips': {
        spanish: 'Fondos para Tríceps',
        muscle: 'Tríceps',
        description: 'En paralelas o banco, baja el cuerpo flexionando los codos.',
        tips: 'Codos hacia atrás, no hacia los lados.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    'Preacher Curls': {
        spanish: 'Curl en Banco Scott',
        muscle: 'Bíceps',
        description: 'En banco predicador, curl con brazos apoyados.',
        tips: 'Aísla el bíceps. No subas demasiado rápido.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    // === CORE ===
    'Plank': {
        spanish: 'Plancha',
        muscle: 'Core completo',
        description: 'Posición de flexión apoyado en antebrazos, mantén el cuerpo recto.',
        tips: 'Glúteos apretados, no dejes caer la cadera.',
        image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'
    },
    'Cable Crunch': {
        spanish: 'Crunch en Polea',
        muscle: 'Abdominales',
        description: 'De rodillas frente a polea alta, flexiona el torso hacia abajo.',
        tips: 'Mueve las costillas hacia la pelvis, no solo la cabeza.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'
    },
    'Hanging Leg Raise': {
        spanish: 'Elevación de Piernas Colgado',
        muscle: 'Abdominales inferiores',
        description: 'Colgado de barra, eleva las piernas hasta 90 grados.',
        tips: 'No uses impulso. Controla la bajada.',
        image: 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=400&h=300&fit=crop'
    },
    'Russian Twist': {
        spanish: 'Giro Ruso',
        muscle: 'Oblicuos',
        description: 'Sentado, inclínate hacia atrás y rota el torso de lado a lado.',
        tips: 'Pies elevados para más dificultad. Controla el movimiento.',
        image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'
    },
    'Dead Bug': {
        spanish: 'Bicho Muerto',
        muscle: 'Core profundo',
        description: 'Boca arriba, extiende brazo y pierna opuestos manteniendo la espalda pegada al suelo.',
        tips: 'Espalda baja siempre en contacto con el suelo.',
        image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'
    },
    'Ab Wheel Rollout': {
        spanish: 'Rueda Abdominal',
        muscle: 'Core completo',
        description: 'De rodillas, rueda hacia adelante extendiendo el cuerpo y regresa.',
        tips: 'Aprieta el core todo el tiempo. Empieza con rango corto.',
        image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'
    }
};

/**
 * Muscle group labels in Spanish
 */
export const MUSCLE_LABELS = {
    glutes: 'Glúteos',
    legs: 'Piernas',
    chest: 'Pecho',
    back: 'Espalda',
    shoulders: 'Hombros',
    arms: 'Brazos',
    core: 'Core'
};

/**
 * Equipment labels in Spanish
 */
export const EQUIPMENT_LABELS = {
    barbell: 'Barra',
    dumbbells: 'Mancuernas',
    machines: 'Máquinas',
    cables: 'Poleas',
    bodyweight: 'Peso corporal'
};

/**
 * Get exercises filtered by equipment and level
 * @param {string} muscle - Muscle group
 * @param {string[]} equipment - Available equipment
 * @param {string} level - User level
 * @returns {Array} Filtered exercises
 */
export function getFilteredExercises(muscle, equipment = [], level = 'all') {
    const exercises = EXERCISE_DATABASE[muscle] || [];

    return exercises.filter(ex => {
        // Check equipment
        const hasEquipment = equipment.length === 0 ||
            ex.equipment.some(eq => equipment.includes(eq));

        // Check level
        const matchesLevel = ex.level === 'all' ||
            ex.level === level ||
            (level === 'advanced' && ex.level !== 'beginner');

        return hasEquipment && matchesLevel;
    });
}

/**
 * Get exercise info by name
 * @param {string} name - Exercise name
 * @returns {Object|null} Exercise info
 */
export function getExerciseInfo(name) {
    return EXERCISE_INFO[name] || null;
}

export default {
    EXERCISE_DATABASE,
    TRAINING_SPLITS,
    ROUTINE_TYPES,
    EXERCISE_INFO,
    MUSCLE_LABELS,
    EQUIPMENT_LABELS,
    getFilteredExercises,
    getExerciseInfo
};
