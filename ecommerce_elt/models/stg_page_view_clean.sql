WITH raw_data AS (
    SELECT * FROM {{ source('raw_ecommerce', 'page_view') }}
)

SELECT 
    id AS event_id,
    "timestamp" AS event_time,
    user_id,
    
    -- 1. Redacción de PII: Machetazo al correo electrónico
    REGEXP_REPLACE(page_location, 'email=[^&]+', 'email=[CORREO_CENSURADO]', 'g') AS page_url_clean,
    
    -- 2. Anonimización de IP (Simulando que RudderStack nos pasó el context_ip)
    -- Cambia el último octeto por un .0
    REGEXP_REPLACE(context_ip, '\.\d+$', '.0') AS ip_anonymized,
    
    -- 3. Parseo Básico de User-Agent a Tipo de Dispositivo
    CASE 
        WHEN context_user_agent ILIKE '%Mobile%' OR context_user_agent ILIKE '%Android%' OR context_user_agent ILIKE '%iPhone%' THEN 'Mobile'
        WHEN context_user_agent ILIKE '%iPad%' THEN 'Tablet'
        ELSE 'Desktop'
    END AS device_category

FROM raw_data
