#!/bin/bash

echo "Waiting for Elasticsearch availability";

until curl --silent --fail http://elasticsearch:9200; do
    sleep 5
done

echo "Elasticsearch setup";

# Применяем настройки шаблона индекса
curl -X PUT "http://elasticsearch:9200/_template/company_service_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["company_service_index*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
'

echo -e "\nSetup done!";