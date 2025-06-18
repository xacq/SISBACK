// controllers/recommendationController.js
import db from '../config/db.js';
import retrievalService from'../services/retrievalService.js';
import llmService from '../services/llmService.js';

export const getRecommendations = async (req, res) => {
    const userId = req.user.id; // Asumiendo que tu middleware authMiddleware añade `req.user = { id: userId, ... }`

    try {
        // 1. Obtener perfil de usuario
        const [profileRows] = await db.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
        if (profileRows.length === 0) {
            return res.status(404).json({ message: "User profile not found. Please complete your profile first." });
        }
        const userProfile = profileRows[0];

        // 2. Paso de Recuperación (Retriever)
        const candidateProducts = await retrievalService.getCandidateProducts(userProfile);

        if (!candidateProducts || candidateProducts.length === 0) {
             return res.status(200).json({ // Podría ser 200 con un mensaje o 404 si lo consideras 'no encontrado'
                message: "No suitable products found based on your current profile and our catalog filters. You can try adjusting your profile.",
                recommendations: []
            });
        }

        // 3. Paso de Aumentación y Generación (LLM)
        const llmResult = await llmService.getRecommendationsFromLLM(userProfile, candidateProducts, 3); // Pedimos 3 recomendaciones

        const { recommendations: llmRecommendations, llmReasoning, promptUsed } = llmResult;

        if (!llmRecommendations || llmRecommendations.length === 0) {
            return res.status(200).json({
                message: llmReasoning || "The AI assistant couldn't find specific recommendations from the candidates based on your profile. You can try adjusting your profile.",
                recommendations: []
            });
        }

        // 4. Obtener detalles completos de los product_ids recomendados
        const recommendedProductIds = llmRecommendations.map(rec => rec.product_id).filter(id => typeof id === 'number');

        let finalRecommendedProducts = [];
        if (recommendedProductIds.length > 0) {
            // Reutilizamos la query de candidateProducts pero solo para los IDs recomendados
            // (o una query más simple si ya tienes los datos que necesitas del retriever,
            //  pero el LLM podría necesitar menos datos que los que quieres mostrar al final)
            const placeholders = recommendedProductIds.map(() => '?').join(',');
            const productDetailsQuery = `
                SELECT
                    p.product_id, p.name AS product_name, p.description AS product_description, p.image_url, p.usage_recommendation,
                    pt.name AS type_name, pc.name AS category_name, pc.usage_context,
                    GROUP_CONCAT(DISTINCT pa.name) AS attributes,
                    GROUP_CONCAT(DISTINCT f.name) AS flavors,
                    pn.serving_size, pn.energy_kcal, pn.protein_g, pn.carbs_g, pn.sugars_g, pn.sodium_mg, pn.caffeine_mg, pn.other_components
                FROM products p
                LEFT JOIN product_types pt ON p.type_id = pt.type_id
                LEFT JOIN product_categories pc ON pt.category_id = pc.category_id
                LEFT JOIN product_attributes_mapping pam ON p.product_id = pam.product_id
                LEFT JOIN product_attributes pa ON pam.attribute_id = pa.attribute_id
                LEFT JOIN product_flavors pf ON p.product_id = pf.product_id
                LEFT JOIN flavors f ON pf.flavor_id = f.flavor_id
                LEFT JOIN product_nutrition pn ON p.product_id = pn.product_id
                WHERE p.product_id IN (${placeholders}) AND p.is_active = 1
                GROUP BY p.product_id
            `;
            const [detailedProductRows] = await db.query(productDetailsQuery, recommendedProductIds);

            // Mapear los detalles con el 'reasoning' del LLM
            finalRecommendedProducts = detailedProductRows.map(product => {
                const llmRec = llmRecommendations.find(rec => rec.product_id === product.product_id);
                return {
                    ...product, // Todos los detalles del producto
                    reasoning: llmRec ? llmRec.reasoning : "Reasoning not provided by LLM." // Incluir el razonamiento
                };
            });
        }
        
        // 5. Guardar en la tabla `recommendations` (asíncrono, no bloquear la respuesta al usuario)
        if (finalRecommendedProducts.length > 0) {
            const recommendationInserts = finalRecommendedProducts.map(rec => {
                const originalLLMRec = llmRecommendations.find(lRec => lRec.product_id === rec.product_id);
                return db.query(
                    'INSERT INTO recommendations (user_id, product_id, recommended_at, feedback_notes, prompt, llm_response_reasoning) VALUES (?, ?, NOW(), ?, ?, ?)',
                    [
                        userId,
                        rec.product_id,
                        llmReasoning, // Podría ser un "overall reasoning"
                        promptUsed, // Guardar el prompt completo
                        originalLLMRec.reasoning // El reasoning específico del producto
                    ]
                );
            });
            Promise.all(recommendationInserts)
                .then(() => console.log("Recommendations saved to DB for user:", userId))
                .catch(err => console.error("Error saving recommendations to DB:", err));
        }


        // 6. Devolver los productos detallados y su razonamiento
        res.json({
            message: llmReasoning || "Recommendations generated successfully.",
            recommendations: finalRecommendedProducts
        });

    } catch (error) {
        console.error("Error in getRecommendations controller:", error);
        // Distinguir errores
        if (error.message.includes("User profile not found") || error.message.includes("No candidate products")) {
             // Estos errores ya deberían ser manejados arriba y retornar, pero por si acaso.
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("LLM") || error.message.includes("OpenAI")) {
            return res.status(503).json({ message: "AI service is currently unavailable or failed to process the request." });
        }
        res.status(500).json({ message: "Internal server error while generating recommendations." });
    }
};


// TODO: Implementar endpoint de feedback
export const postRecommendationFeedback = async (req, res) => {
    const userId = req.user.id;
    const { recommendation_id, product_id, feedback, feedback_notes } = req.body; // feedback_notes será la justificación/feedback del usuario

    if (!product_id || !feedback) { // recommendation_id podría no existir si no se guardó el ID individual de rec
        return res.status(400).json({ message: "product_id and feedback are required." });
    }

    try {
        // Idealmente, deberías tener un recommendation_id único por cada (user_id, product_id, timestamp_o_session_id)
        // Si no, actualizas la entrada más reciente para ese user/product
        // Aquí simplificamos: asumimos que actualizamos LA ÚLTIMA recomendación para ese producto y usuario, o insertamos
        // Nota: Esto requiere ajustar la tabla 'recommendations' o la lógica.
        // Por ahora, actualizamos la última entrada para user_id y product_id donde feedback_notes es el overall_reasoning y feedback_notes_user es el nuevo.
        // Asumimos que tenemos recommendation_id de alguna forma.
        // Una mejor forma es que `recommendations` tenga `recommendation_session_uuid` y el feedback sea sobre esa sesión
        // Si tienes 'recommendation_id' de la tabla recommendations
        if (recommendation_id) {
            const [result] = await db.query(
                'UPDATE recommendations SET feedback = ?, feedback_notes = ? WHERE recommendation_id = ? AND user_id = ?',
                [feedback, feedback_notes || null, recommendation_id, userId]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Recommendation not found or you are not authorized to update it." });
            }
        } else {
            // Fallback si no hay recommendation_id, intentamos actualizar el más reciente para el producto y usuario.
            // Esto es menos preciso. Es mejor tener IDs.
            const [result] = await db.query(
                `UPDATE recommendations SET feedback = ?, feedback_notes_user = ? 
                 WHERE user_id = ? AND product_id = ? 
                 ORDER BY recommended_at DESC LIMIT 1`,
                [feedback, feedback_notes || null, userId, product_id]
            );
             if (result.affectedRows === 0) {
                // Si no se encontró para actualizar, quizás se debería insertar una entrada de feedback aislada o un log.
                // O simplemente devolver que no se encontró para actualizar.
                console.warn(`No recommendation found to update feedback for user ${userId}, product ${product_id}`);
                return res.status(404).json({ message: "No previous recommendation entry found to update feedback for this product." });
            }
        }


        res.status(200).json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Error submitting recommendation feedback:", error);
        res.status(500).json({ message: "Failed to submit feedback." });
    }
};
