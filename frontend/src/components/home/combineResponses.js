export function combineResponses(responses) {
    // Инициализация структуры для собирания общих данных
    const combined = {
        stats: {
            services_count: 0,
            companies_count: 0,
            service_ids: new Set(),
            company_ids: new Set(),
            service_types: new Set(),
            service_statuses: {},
            company_id2name: {}
        },
        data: []
    };

    // Обработка каждого респонса
    responses.forEach(response => {
        // Добавление данных услуг без дубликатов
        response.data.forEach(service => {
            // Проверяем, существует ли уже такая услуга по ID
            if (!combined.stats.service_ids.has(service.service_id)) {
                combined.stats.service_ids.add(service.service_id);
                combined.stats.service_types.add(service.service_type);
                combined.data.push(service);

                // Обновляем статистику статусов услуг
                if (combined.stats.service_statuses[service.service_status]) {
                    combined.stats.service_statuses[service.service_status]++;
                } else {
                    combined.stats.service_statuses[service.service_status] = 1;
                }
            }

            // Обновление информации о компаниях
            if (!combined.stats.company_ids.has(service.company_id)) {
                combined.stats.company_ids.add(service.company_id);
                combined.stats.company_id2name[service.company_id] = service.company_name;
            }
        });
    });

    // После обработки всех данных, обновляем счетчики
    combined.stats.services_count = combined.stats.service_ids.size;
    combined.stats.companies_count = combined.stats.company_ids.size;

    // Удаляем Set для идентификаторов и типов услуг, преобразовав их в массивы
    combined.stats.service_ids = Array.from(combined.stats.service_ids);
    combined.stats.company_ids = Array.from(combined.stats.company_ids);
    combined.stats.service_types = Array.from(combined.stats.service_types);

    if (combined.data.length === 0) {
        return null;
    }
    return combined;
}
