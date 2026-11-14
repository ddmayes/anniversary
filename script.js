
const quiz = document.querySelector('.memory-quiz');

if (quiz) {
    const options = quiz.querySelectorAll('input[type="radio"]');
    const message = document.getElementById('quiz-message');

    options.forEach(option => {
        option.addEventListener('change', () => {
            if (option.value === 'correct') {
                message.textContent = "Of course! You remember everything ♡";
            } else {
                message.textContent = "Not quite... try again, my love ♡";
            }
        });
    });
}

