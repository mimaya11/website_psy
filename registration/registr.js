document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
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

            // Генерация JWT-токена с jsrsasign
            try {
                const header = { alg: "HS256", typ: "JWT" };
                const payload = {
                    sub: login,  // Добавляем уникальный идентификатор пользователя в поле sub (для учебного проекта можно использовать логин)
                    login: login,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Токен истекает через 1 час
                };
                const secretKey = "s3cr3tK3y$12345"; // Секретный ключ должен совпадать с ключом в login.js
                const jwtToken = KJUR.jws.JWS.sign("HS256", JSON.stringify(header), JSON.stringify(payload), secretKey);

                // Сохраняем токен и идентификатор пользователя в localStorage
                localStorage.setItem("token", jwtToken);
                localStorage.setItem("user_id", login);

                alert("Регистрация прошла успешно! Токен: " + jwtToken);
            } catch (error) {
                console.error("Ошибка при генерации токена:", error);
            }

            window.location.href = 'login.html'; // Перенаправляем на страницу входа
        });
    }
});
