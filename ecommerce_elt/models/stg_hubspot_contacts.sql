WITH raw_contacts AS (
    SELECT * FROM {{ source('hubspot_raw', 'contacts') }}
)

SELECT
    id AS hubspot_id,
    "createdAt" AS created_at,
    properties_firstname AS first_name,
    properties_lastname AS last_name, -- This contains our user_id
    properties_email AS email,
    _airbyte_extracted_at AS synched_at
FROM raw_contacts
