WITH raw_data AS (
    SELECT * FROM {{ source('raw_ecommerce', 'page_view') }}
)

SELECT 
    id AS event_id,
    "timestamp" AS event_time,
    user_id,
    -- Aplicamos el Regex para la censura de PII
    REGEXP_REPLACE(page_location, 'email=[^&]+', 'email=[CORREO_CENSURADO]', 'g') AS page_url_clean
FROM raw_data
