// services/llmService.js
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de tener esto en tu .env
});

// Función para ayudar a truncar texto si es muy largo
function truncateText(text, maxLength = 200) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
}

async function getRecommendationsFromLLM(userProfile, candidateProducts, numRecommendations = 3) {
    if (!userProfile) {
        throw new Error("User profile is required for LLM recommendation.");
    }
    if (!candidateProducts || candidateProducts.length === 0) {
        // console.warn("No candidate products provided to LLM. Returning empty recommendations.");
        // throw new Error("No candidate products to process for LLM recommendation."); // O devuelve un mensaje específico.
        return { recommendations: [], llmReasoning: "No se encontraron productos candidatos iniciales para evaluar." };
    }

    const profileString = `
        - Edad: ${userProfile.age || 'No especificada'}
        - Peso: ${userProfile.weight || 'No especificado'} kg
        - Altura: ${userProfile.height || 'No especificada'} cm
        - Género: ${userProfile.gender || 'No especificado'}
        - Nivel de Actividad: ${userProfile.activity_level || 'No especificado'}
        - Frecuencia de Entrenamiento: ${userProfile.training_frequency || 'No especificada'} veces/semana
        - Objetivo Principal: ${userProfile.primary_goal || 'No especificado'}
        - Nivel de Sudoración: ${userProfile.sweat_level || 'No especificado'}
        - Tolerancia a la Cafeína: ${userProfile.caffeine_tolerance || 'No especificada'}
        - Restricciones Dietéticas: ${userProfile.dietary_restrictions || 'Ninguna'}
    `.trim();

    const productsString = candidateProducts.map(p => `
        {
            "product_id": ${p.product_id},
            "name": "${p.name}",
            "category": "${p.category}",
            "type": "${p.type}",
            "description": "${truncateText(p.description, 150)}",
            "usage_recommendation": "${truncateText(p.usage_recommendation, 100)}",
            "attributes": ["${p.attributes.join('", "')}"],
            "protein_g": ${p.protein_g || 0},
            "carbs_g": ${p.carbs_g || 0},
            "energy_kcal": ${p.energy_kcal || 0},
            "caffeine_mg": ${p.caffeine_mg || 0}
        }
    `).join(',\n');

    const systemPrompt = `
        Eres SportNutriBot, un asistente experto en nutrición deportiva. Tu tarea es analizar el perfil de un usuario y una lista de productos de suplementación deportiva disponibles para recomendar los más idóneos.
        Debes basar tus recomendaciones estrictamente en la información proporcionada del perfil y de los productos.
        No inventes productos ni propiedades que no estén en la lista.
        Prioriza productos que se alineen directamente con el objetivo principal, nivel de actividad y restricciones dietéticas del usuario.
        Considera la tolerancia a la cafeína si se especifica.
    `.trim();

    const userMessagePrompt = `
        Analiza el siguiente perfil de usuario:
        --- PERFIL DEL USUARIO ---
        ${profileString}
        --- FIN PERFIL DEL USUARIO ---

        Y la siguiente lista de productos disponibles:
        --- PRODUCTOS DISPONIBLES ---
        [
        ${productsString}
        ]
        --- FIN PRODUCTOS DISPONIBLES ---

        Por favor, recomienda los ${numRecommendations} productos más adecuados para este usuario de la lista proporcionada.
        Para cada producto recomendado, proporciona su 'product_id' (tal como se dio en la entrada) y una breve 'reasoning' (justificación) de por qué es adecuado para este usuario, basándote en su perfil y los detalles del producto.

        Devuelve tu respuesta ÚNICAMENTE en formato JSON, de la siguiente manera:
        {
          "recommendations": [
            { "product_id": <ID_PRODUCTO_1_ENTERO>, "reasoning": "Justificación concisa para el producto 1..." },
            { "product_id": <ID_PRODUCTO_2_ENTERO>, "reasoning": "Justificación concisa para el producto 2..." }
            // ... hasta ${numRecommendations} recomendaciones si es posible. Si no encuentras ${numRecommendations} productos adecuados, devuelve menos. Si no encuentras ninguno, devuelve un array vacío.
          ],
          "llm_overall_reasoning": "Un breve resumen general de tu proceso de pensamiento o por qué estos productos son buenos en conjunto, si aplica." // Opcional, pero puede ser útil
        }

        Asegúrate de que el 'product_id' sea un NÚMERO ENTERO y que la justificación sea clara y relevante. Si ningún producto parece adecuado, puedes devolver un array de recomendaciones vacío.
        No incluyas ningún texto introductorio o explicativo fuera del objeto JSON. Solo el JSON.
    `.trim();


    // Guardar el prompt exacto para debugging o auditoría
    const fullPromptForLog = `System: ${systemPrompt}\nUser: ${userMessagePrompt}`;
    // console.log("--- LLM PROMPT ---");
    // console.log(fullPromptForLog);
    // console.log("--- END LLM PROMPT ---");

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125", // O "gpt-4o", "gpt-4-turbo-preview", etc.
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessagePrompt }
            ],
            response_format: { type: "json_object" }, // Esto es clave para asegurar salida JSON con modelos compatibles
            temperature: 0.3, // Más bajo para respuestas más deterministas y factuales
            max_tokens: 800, // Ajusta según la longitud esperada de la respuesta y los productos
        });

        const llmResponseContent = completion.choices[0].message.content;
        // console.log("--- LLM RAW RESPONSE ---");
        // console.log(llmResponseContent);
        // console.log("--- END LLM RAW RESPONSE ---");

        try {
            const parsedResponse = JSON.parse(llmResponseContent);
            if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
                 console.error("LLM response is not in the expected format (missing 'recommendations' array). Response:", llmResponseContent);
                 throw new Error("LLM response format error: 'recommendations' array is missing or not an array.");
            }
            // Validar que los product_id sean números
            parsedResponse.recommendations.forEach(rec => {
                if (typeof rec.product_id !== 'number') {
                    console.warn(`LLM returned a non-numeric product_id: ${rec.product_id}. Attempting to parse.`);
                    const parsedId = parseInt(rec.product_id, 10);
                    if (isNaN(parsedId)) {
                        throw new Error(`LLM returned an invalid non-numeric product_id that could not be parsed: ${rec.product_id}`);
                    }
                    rec.product_id = parsedId;
                }
            });
            return {
                recommendations: parsedResponse.recommendations,
                llmReasoning: parsedResponse.llm_overall_reasoning || "Recomendaciones generadas.",
                promptUsed: fullPromptForLog // Guardar el prompt para auditoría/feedback
            };
        } catch (jsonError) {
            console.error("Error parsing LLM JSON response:", jsonError);
            console.error("LLM Response Content was:", llmResponseContent);
            throw new Error("Failed to parse LLM response as JSON.");
        }

    } catch (error) {
        console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
        throw new Error("Failed to get recommendations from LLM.");
    }
}

module.exports = {
    getRecommendationsFromLLM,
};