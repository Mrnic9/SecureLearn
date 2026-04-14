const { pool } = require('../config/database');
const authService = require('../services/authService');

const seedDatabase = async () => {
  try {
    console.log('Sembrando base de datos con datos de prueba...');

    // Crear usuarios de prueba
    const testUsers = [
      {
        email: 'admin@securelearn.local',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      {
        email: 'instructor@securelearn.local',
        password: 'Instructor123!',
        firstName: 'John',
        lastName: 'Instructor',
        role: 'instructor'
      },
      {
        email: 'student@securelearn.local',
        password: 'Student123!',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student'
      }
    ];

    for (const user of testUsers) {
      try {
        await authService.register(user.email, user.password, user.firstName, user.lastName, user.role);
        console.log(`✅ Usuario creado: ${user.email}`);
      } catch (err) {
        console.log(`⚠️  Usuario ya existe: ${user.email}`);
      }
    }

    // Crear cursos de ejemplo
    const testCourses = [
      {
        title: 'Introducción a la Seguridad de la Información',
        description: 'Conceptos básicos de seguridad, confidencialidad, integridad y disponibilidad',
        category: 'Fundamentos',
        level: 'beginner',
        durationMinutes: 120
      },
      {
        title: 'Protección contra Phishing y Social Engineering',
        description: 'Identifica y previene ataques de ingeniería social',
        category: 'Seguridad de Usuario',
        level: 'beginner',
        durationMinutes: 90
      },
      {
        title: 'Gestión de Contraseñas Seguras',
        description: 'Mejores prácticas para crear y gestionar contraseñas fuertes',
        category: 'Seguridad de Usuario',
        level: 'beginner',
        durationMinutes: 60
      },
      {
        title: 'OWASP Top 10 - Vulnerabilidades Web',
        description: 'Análisis de las vulnerabilidades web más críticas',
        category: 'Desarrollo Seguro',
        level: 'intermediate',
        durationMinutes: 150
      },
      {
        title: 'Cifrado de Datos y Criptografía',
        description: 'Fundamentos de criptografía y protección de datos',
        category: 'Criptografía',
        level: 'intermediate',
        durationMinutes: 180
      }
    ];

    // Obtener ID del instructor
    const instructorResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['instructor@securelearn.local']
    );

    if (instructorResult.rows.length > 0) {
      const instructorId = instructorResult.rows[0].id;

      for (const course of testCourses) {
        const { v4: uuidv4 } = require('uuid');
        try {
          await pool.query(
            `INSERT INTO courses (uuid, title, description, category, level, duration_minutes, instructor_id, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
            [uuidv4(), course.title, course.description, course.category, course.level, course.durationMinutes, instructorId]
          );
          console.log(`✅ Curso creado: ${course.title}`);
        } catch (err) {
          console.log(`⚠️  Error creando curso: ${err.message}`);
        }
      }
    }

    console.log('✅ Base de datos sembrada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error sembrando BD:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
