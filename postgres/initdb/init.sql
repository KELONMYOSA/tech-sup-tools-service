-- Создаем таблицу для типов услуг
CREATE TABLE IF NOT EXISTS service_type (
  id int UNIQUE PRIMARY KEY NOT NULL,
  name text NOT NULL
);

-- Создаем основную таблицу услуг
CREATE TABLE IF NOT EXISTS service (
  id int UNIQUE PRIMARY KEY NOT NULL,
  type_id int NOT NULL REFERENCES service_type(id)
);

-- Создаем таблицу для услуги "Организация WiFi сети"
CREATE TABLE IF NOT EXISTS wifi_setup_service (
  id int UNIQUE PRIMARY KEY NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  type text,
  controller_domain text,
  router_domain text,
  equipment_domain text,
  ssid text
);

-- Заполняем таблицу типов услуг
INSERT INTO service_type (id, name) VALUES (11797, 'Организация WiFi сети');
