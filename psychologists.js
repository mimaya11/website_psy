document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем клиент Supabase — замените значения на актуальные для вашего проекта
    const supabaseUrl = 'https://ibqxsviroqbwriqqflyi.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXhzdmlyb3Fid3JpcXFmbHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NzI2NzgsImV4cCI6MjA2MjM0ODY3OH0.UniqEpeGFYn0uOSX4eq9Gqi54NxStLJ6bdniHzLSudo';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Пагинация: загружаем несколько карточек за раз
    let offset = 0;
    const limit = 5;
    const cardsContainer = document.getElementById('cardsContainer');
    const loadMoreButton = document.getElementById('loadMore');

    // Функция для загрузки карточек с психологами
    async function loadPsychologists() {
        let { data, error } = await supabaseClient
            .from('psychologists')
            .select('*')
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Ошибка получения психологов:", error);
            return;
        }
        if (data && data.length > 0) {
            data.forEach(psy => {
                const card = document.createElement('div');
                card.classList.add('psychologist-card');
                card.innerHTML = `
          <img src="${psy.photo}" alt="${psy.name}" class="psychologist-photo">
          <h3 class="psychologist-name">${psy.name}</h3>
          <p class="psychologist-experience">Опыт: ${psy.experience}</p>
          <p class="psychologist-age">Возраст: ${psy.age}</p>
          <p class="psychologist-description">${psy.description}</p>
          <button class="detail-button" data-id="${psy.id}">Подробнее</button>
          <button class="book-button" data-id="${psy.id}" data-name="${psy.name}">Записаться</button>
        `;
                cardsContainer.appendChild(card);
            });
            offset += limit;
        } else {
            loadMoreButton.style.display = 'none';
        }
    }

    // Загружаем первую партию карточек
    loadPsychologists();

    loadMoreButton.addEventListener('click', loadPsychologists);

    // Обработка модального окна с подробностями психолога
    const detailModal = document.getElementById('modal');
    const modalClose = detailModal.querySelector('.close');

    cardsContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('detail-button')) {
            const card = event.target.closest('.psychologist-card');
            const photo = card.querySelector('.psychologist-photo').src;
            const name = card.querySelector('.psychologist-name').textContent;
            const experience = card.querySelector('.psychologist-experience').textContent;
            const description = card.querySelector('.psychologist-description').textContent;
            document.getElementById('modalPhoto').src = photo;
            document.getElementById('modalName').textContent = name;
            document.getElementById('modalExperience').textContent = experience;
            document.getElementById('modalDescription').textContent = description;
            detailModal.style.display = 'block';
        }
    });

    modalClose.addEventListener('click', () => {
        detailModal.style.display = 'none';
    });

    // Функционал модального окна для записи на приём
    const appointmentModal = document.getElementById('appointment-modal');
    const appointmentClose = document.getElementById('appointment-close');

    // Делегирование событий: при нажатии на кнопку "Записаться" открывается модальное окно
    cardsContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('book-button')) {
            const psychologistId = event.target.getAttribute('data-id');
            const psychologistName = event.target.getAttribute('data-name');
            openAppointmentModal(psychologistId, psychologistName);
        }
    });

    function openAppointmentModal(psychologistId, psychologistName) {
        appointmentModal.style.display = 'block';
        document.getElementById('appointment-psychologist').textContent = 'Психолог: ' + psychologistName;
        appointmentModal.setAttribute('data-psychologist-id', psychologistId);
    }

    function closeAppointmentModal() {
        appointmentModal.style.display = 'none';
        document.getElementById('appointment-form').reset();
    }

    appointmentClose.addEventListener('click', closeAppointmentModal);

    // Закрытие модальных окон при клике вне их области
    window.addEventListener('click', (event) => {
        if (event.target === appointmentModal) {
            closeAppointmentModal();
        }
        if (event.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });

    // Обработка отправки формы записи на приём
    const appointmentForm = document.getElementById('appointment-form');
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const psychologistId = appointmentModal.getAttribute('data-psychologist-id');
        const psychologistName = document.getElementById('appointment-psychologist').textContent.replace('Психолог: ', '');
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            alert("Для записи необходимо авторизоваться.");
            return;
        }

        const { data, error } = await supabaseClient
            .from('appointments')
            .insert([{
                user_id: userId,
                psychologist_id: psychologistId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                psychologist_name: psychologistName
            }]);

        if (error) {
            console.error("Ошибка создания записи:", error);

            alert("Не удалось создать запись. Попробуйте ещё раз.");
            return;
        }

        alert("Запись успешно создана!");
        closeAppointmentModal();
    });
});
