document.addEventListener('DOMContentLoaded', () => { const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) { registrationForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Отмена стандартного поведения формы

        const login = document.getElementById('regLogin').value;
        const password = document.getElementById('regPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[login]) {
            document.getElementById('regMessage').textContent = "Пользователь с таким логином уже существует";
            return;
        }

        // Добавляем нового пользователя и сохраняем
        users[login] = { password };
        localStorage.setItem('users', JSON.stringify(users));

        // Генерация JWT-токена
        try {
            const header = { alg: "HS256", typ: "JWT" };
            const payload = { login, exp: Math.floor(Date.now() / 1000) + (60 * 60) }; // Истекает через 1 час
            const secretKey = "s3cr3tK3y$12345!";
            const jwtToken = KJUR.jws.JWS.sign("HS256", JSON.stringify(header), JSON.stringify(payload), secretKey);
            localStorage.setItem("token", jwtToken);
            alert("Регистрация прошла успешно! Токен: " + jwtToken);

            localStorage.setItem('token', token);
            alert("Регистрация прошла успешно! Токен: " + jwtToken);
        } catch (error) {
            console.error("Ошибка при генерации токена:", error);
        }

        window.location.href = 'login.html'; // Перенаправляем на страницу входа
    });
    }
});