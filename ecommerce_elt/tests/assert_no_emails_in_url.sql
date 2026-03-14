-- Test de Gobernanza de Datos (PII)
-- Este test fallará si encuentra el símbolo '@' en la URL limpia, 
-- lo que indicaría que nuestra regla de anonimización falló.

SELECT 
    event_id, 
    page_url_clean
FROM {{ ref('stg_page_view_clean') }}
WHERE page_url_clean LIKE '%@%'
