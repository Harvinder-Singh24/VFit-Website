/**
 * VFit – Result Page Renderer
 */

document.addEventListener('DOMContentLoaded', () => {
    const raw = sessionStorage.getItem('vfit_result');
    if (!raw) {
        window.location.href = 'quiz.html';
        return;
    }

    const data = JSON.parse(raw);
    initResultPage(data);
});

function initResultPage(data) {
    const { name, gender, goal, weight, dietType, calories, macros, mealPlanDays, tips } = data;

    const goalLabel = goal === 'weightLoss' ? 'Weight Loss' : 'Weight Gain';
    const dietLabel = dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
    const genderLabel = gender === 'male' ? 'Male' : 'Female';

    // Header
    document.getElementById('result-name').textContent = `Hey, ${name}! 👋`;
    document.getElementById('result-subtitle').textContent =
        `Your personalised ${goalLabel} diet plan · ${genderLabel} · ${weight} kg · ${dietLabel}`;

    // Calorie
    document.getElementById('calorie-number').textContent = calories.toLocaleString();
    document.getElementById('calorie-desc').textContent =
        goal === 'weightLoss'
            ? 'This calorie target creates a healthy deficit to help you lose fat steadily.'
            : 'This calorie surplus supports muscle growth and healthy weight gain.';

    // Macros
    document.getElementById('macro-protein').textContent = macros.protein + 'g';
    document.getElementById('macro-carbs').textContent = macros.carbs + 'g';
    document.getElementById('macro-fat').textContent = macros.fat + 'g';

    // Meal Rendering Logic
    const renderDay = (dayIdx) => {
        // Fallback to day 0 if specific day data isn't available
        const dayData = mealPlanDays[dayIdx] || mealPlanDays[0];
        const mealContainer = document.getElementById('meal-cards');

        if (!dayData || !dayData.meals) {
            mealContainer.innerHTML = '<p style="padding:20px; color:var(--text-muted)">Meal plan for this day is coming soon!</p>';
            return;
        }

        mealContainer.innerHTML = dayData.meals.map(meal => {
            const mealCal = Math.round(calories * meal.calPercent);
            return `
      <div class="meal-card">
        <span class="meal-time-badge">${meal.time}</span>
        <div class="meal-info">
          <div class="meal-name">${meal.name}</div>
          <div class="meal-items">${meal.items}</div>
        </div>
        <span class="meal-cal">~${mealCal} kcal</span>
      </div>
    `;
        }).join('');
    };

    // Initial Render (Day 1)
    renderDay(0);

    // Day Selector Events
    const dayBtns = document.querySelectorAll('.btn-day');
    dayBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDay(idx);
        });
    });

    // Tips
    const tipsContainer = document.getElementById('tips-grid');
    tipsContainer.innerHTML = tips.map(t => `
    <div class="tip-card">
      <span class="tip-icon">${t.icon}</span>
      <p class="tip-text">${t.text}</p>
    </div>
  `).join('');
}
