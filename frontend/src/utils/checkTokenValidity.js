async function checkTokenValidity() {
    const apiUrl = import.meta.env.VITE_API_URL

    let isAuthenticated = false
    let userData = {}

    try {
        const response = await fetch(apiUrl + '/auth/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (response.ok) {
            isAuthenticated = true;
            userData = await response.json();
        } else {
            // Если токен просрочен, попытка обновить его
            const refreshResponse = await fetch(apiUrl + '/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({refreshToken: localStorage.getItem('refreshToken')}),
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                return await checkTokenValidity();
            } else {
                throw new Error('Не удалось обновить токен');
            }
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        isAuthenticated = false;
    }

    return [isAuthenticated, userData]
}

export default checkTokenValidity;
