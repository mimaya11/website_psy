document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[login] && users[login].password === password) {
        // Генерация JWT-токена с использованием jsrsasign
        const header = { alg: "HS256", typ: "JWT" };
        // Добавляем sub: здесь используем login как уникальный идентификатор.
        const payload = {
            sub: login, // Если в дальнейшем получаете real UUID, то тут должно быть именно оно.
            login: login,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)  // Токен истекает через 1 час
        };
        const secretKey = "s3cr3tK3y$12345";

        const jwtToken = KJUR.jws.JWS.sign("HS256", JSON.stringify(header), JSON.stringify(payload), secretKey);
        localStorage.setItem('token', jwtToken);

        alert('Вход выполнен успешно! Токен: ' + jwtToken);
        window.location.href = 'index.html';
    } else {
        document.getElementById('errorMessage').textContent = 'Неверный логин или пароль';
    }
});

