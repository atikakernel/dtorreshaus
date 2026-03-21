WITH web_traffic AS (
    SELECT * FROM {{ ref('stg_page_view_clean') }}
),

crm_contacts AS (
    SELECT * FROM {{ ref('stg_hubspot_contacts') }}
)

SELECT
    w.event_id,
    w.event_time,
    w.user_id,
    w.page_url_clean,
    w.device_category,
    c.hubspot_id,
    c.created_at AS contact_created_at,
    c.email,
    -- Label to identify if the user is already a lead in HubSpot
    CASE 
        WHEN c.hubspot_id IS NOT NULL THEN 'Lead'
        ELSE 'Visitor'
    END AS user_status

FROM web_traffic w
LEFT JOIN crm_contacts c ON w.user_id = c.last_name
