// api/questions.js
import { promises as fs } from "fs";
import path from "path";

// Lista de categorías permitidas
const ALLOWED_CATEGORIES = ["cpp", "javascript", "python","csharp","css","html","java","kotlin","php","sql","swift","typescript"]; // Agrega más según tus necesidades

export default async function handler(req, res) {
  try {
    // Obtener los parámetros de la consulta
    const { level, category, limit } = req.query;

    // Validar la categoría
    if (category && !ALLOWED_CATEGORIES.includes(category.toLowerCase())) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    // Determinar el archivo a leer
    const categoryFile = category ? `${category.toLowerCase()}.json` : "default.json"; // Usa un archivo por defecto si no se proporciona categoría
    const filePath = path.join(process.cwd(), categoryFile);

    // Verificar si el archivo existe
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: "Archivo de categoría no encontrado", ruta_script: process.cwd(), ruta_archivo: filePath });
    }

    // Leer el archivo JSON
    const data = await fs.readFile(filePath, "utf-8");
    const questions = JSON.parse(data);

    // Filtrar las preguntas según los parámetros
    let filteredQuestions = questions.filter(
      (question) =>
        (!level || question.level.toLowerCase() === level.toLowerCase()) &&
        (!category || question.category.toLowerCase() === category.toLowerCase())
    );

    // Barajar las preguntas aleatoriamente
    filteredQuestions = shuffleArray(filteredQuestions);

    // Limitar el número de preguntas según el parámetro `limit`
    const limitedQuestions = limit
      ? filteredQuestions.slice(0, parseInt(limit, 10))
      : filteredQuestions;

    res.status(200).json(limitedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar las preguntas" });
  }
}

// Función para barajar un array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
