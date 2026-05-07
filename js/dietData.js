/**
 * VFit – Diet Data Engine
 * Based on the user-provided calorie chart.
 */

// ── Calorie Targets ─────────────────────────────────────────
const calorieChart = {
    female: {
        weightLoss: [
            { minKg: 55, maxKg: 60, calories: 1400 },
            { minKg: 60, maxKg: 65, calories: 1600 },
            { minKg: 65, maxKg: 75, calories: 1800 },
            { minKg: 75, maxKg: 80, calories: 2000 },
            { minKg: 80, maxKg: 999, calories: 2200 },
        ],
        weightGain: [
            { minKg: 30, maxKg: 45, calories: 1750 },
            { minKg: 45, maxKg: 50, calories: 1900 },
            { minKg: 50, maxKg: 999, calories: 2200 },
        ]
    },
    male: {
        weightLoss: [
            { minKg: 70, maxKg: 80, calories: 1500 },
            { minKg: 80, maxKg: 90, calories: 1700 },
            { minKg: 90, maxKg: 100, calories: 1900 },
            { minKg: 100, maxKg: 999, calories: 2100 },
        ],
        weightGain: [
            { minKg: 50, maxKg: 60, calories: 2500 },
            { minKg: 60, maxKg: 70, calories: 2700 },
            { minKg: 70, maxKg: 80, calories: 2900 },
            { minKg: 80, maxKg: 90, calories: 3200 },
            { minKg: 90, maxKg: 999, calories: 3500 },
        ]
    }
};

/**
 * Get calorie target based on gender, weight and goal.
 */
export function getCalories(gender, weightKg, goal) {
    const w = parseFloat(weightKg);
    const ranges = calorieChart[gender]?.[goal];
    if (!ranges) return null;

    for (const r of ranges) {
        if (w >= r.minKg && w < r.maxKg) return r.calories;
    }

    // fallback – use highest bracket
    return ranges[ranges.length - 1].calories;
}

// ── Macro Calculation ────────────────────────────────────────
export function getMacros(calories, goal, dietType) {
    // Macro ratios differ by goal
    let proteinPct, carbPct, fatPct;

    if (goal === 'weightLoss') {
        proteinPct = 0.35; carbPct = 0.40; fatPct = 0.25;
    } else {
        proteinPct = 0.30; carbPct = 0.50; fatPct = 0.20;
    }

    return {
        protein: Math.round((calories * proteinPct) / 4),   // 4 kcal/g
        carbs: Math.round((calories * carbPct) / 4),
        fat: Math.round((calories * fatPct) / 9),     // 9 kcal/g
    };
}

// ── Meal Plans ───────────────────────────────────────────────
const mealPlans = {
    female: {
        weightLoss: {
            veg: [
                {
                    day: 1,
                    meals: [
                        { time: '6:30 AM', name: 'Early Morning', items: 'Warm lemon induction water + 5 soaked almonds + 2 walnuts', calPercent: 0.05 },
                        { time: '8:30 AM', name: 'Breakfast', items: 'Oats Vegetable Khichdi / Poha with veggies + 1 bowl curd', calPercent: 0.20 },
                        { time: '11:00 AM', name: 'Mid Morning', items: '1 seasonal fruit (Orange/Apple/Guava) + 1 glass buttermilk', calPercent: 0.10 },
                        { time: '1:30 PM', name: 'Lunch', items: '2 Whole wheat chapati + 1 bowl Dal + 1 bowl seasonal Sabzi + large salad bowl', calPercent: 0.30 },
                        { time: '4:30 PM', name: 'Evening', items: 'Roasted Makhana / Sprouted Moong chat + Green tea', calPercent: 0.15 },
                        { time: '7:30 PM', name: 'Dinner', items: '1 bowl Mixed Veg Soup + 100g Paneer Bhurji / Soya chunks + Salad', calPercent: 0.20 }
                    ]
                },
                // More days can be added here
            ],
            nonVeg: [
                {
                    day: 1,
                    meals: [
                        { time: '6:30 AM', name: 'Early Morning', items: 'Warm lemon induction water + 5 soaked almonds + 2 walnuts', calPercent: 0.05 },
                        { time: '8:30 AM', name: 'Breakfast', items: '3 Egg whites omelette with veggies + 1 slice brown bread + Green tea', calPercent: 0.20 },
                        { time: '11:00 AM', name: 'Mid Morning', items: '1 seasonal fruit + 1 glass buttermilk', calPercent: 0.10 },
                        { time: '1:30 PM', name: 'Lunch', items: '1 bowl brown rice + 150g Grilled Chicken + 1 bowl Dal + large salad', calPercent: 0.30 },
                        { time: '4:30 PM', name: 'Evening', items: '1 boiled egg + handful of roasted chana + Green tea', calPercent: 0.15 },
                        { time: '7:30 PM', name: 'Dinner', items: '1 bowl clear chicken soup + 120g Grilled Fish + Stir-fry veggies', calPercent: 0.20 }
                    ]
                }
            ]
        },
        weightGain: {
            veg: [
                {
                    day: 1,
                    meals: [
                        { time: '7:00 AM', name: 'Early Morning', items: '1 Banana + 1 glass full cream milk + 10 soaked almonds', calPercent: 0.10 },
                        { time: '9:00 AM', name: 'Breakfast', items: '2 Paneer Paratha with 1 bowl curd + 1 glass juice', calPercent: 0.20 },
                        { time: '11:30 AM', name: 'Mid Morning', items: '1 bowl Sabudana Khichdi / Peanut butter toast', calPercent: 0.10 },
                        { time: '1:30 PM', name: 'Lunch', items: '3 Chapati + 1 bowl Rajma + 1 bowl Paneer Sabzi + Rice + Salad', calPercent: 0.25 },
                        { time: '4:30 PM', name: 'Evening', items: '1 bowl Fruit Custard / handful of Cashews + Tea', calPercent: 0.15 },
                        { time: '8:00 PM', name: 'Dinner', items: '2 Chapati + 1 bowl Dal makhani + 1 bowl Shahi Paneer + Rice', calPercent: 0.20 }
                    ]
                }
            ]
        }
    },
    male: {
        weightLoss: {
            veg: [
                {
                    day: 1,
                    meals: [
                        { time: '7:00 AM', name: 'Early Morning', items: 'Apple Cider Vinegar in warm water + 6 almonds', calPercent: 0.05 },
                        { time: '9:00 AM', name: 'Breakfast', items: 'Vegetable Upma / Oats + 2 boiled egg whites (if allowed) or Paneer', calPercent: 0.20 },
                        { time: '11:30 AM', name: 'Mid Morning', items: '1 glass Lassi (no sugar) + 1 seasonal fruit', calPercent: 0.10 },
                        { time: '1:30 PM', name: 'Lunch', items: '2 Multi-grain chapati + 1 bowl thick Dal + Veggies + Salad', calPercent: 0.30 },
                        { time: '4:30 PM', name: 'Evening', items: 'Roasted Chana + Black Coffee / Green tea', calPercent: 0.10 },
                        { time: '8:00 PM', name: 'Dinner', items: '1 bowl Moong Dal Khichdi + 1 bowl curd + salad', calPercent: 0.25 }
                    ]
                }
            ]
        },
        weightGain: {
            veg: [
                {
                    day: 1,
                    meals: [
                        { time: '7:00 AM', name: 'Early Morning', items: 'Banana Shake with oats and honey + 12 almonds', calPercent: 0.15 },
                        { time: '9:00 AM', name: 'Breakfast', items: '4 Idli with Sambar + 2 Boiled Eggs / Paneer Bhurji', calPercent: 0.20 },
                        { time: '11:30 AM', name: 'Mid Morning', items: 'Peanut butter sandwich (2 slices) + 1 Apple', calPercent: 0.10 },
                        { time: '1:30 PM', name: 'Lunch', items: '4 Chapati + 2 bowls Dal + Veggies + Rice + Curd', calPercent: 0.25 },
                        { time: '4:30 PM', name: 'Evening', items: 'Protein Shake / Glass of whole milk + Biscuits', calPercent: 0.10 },
                        { time: '8:00 PM', name: 'Dinner', items: '3 Chapati + 1 bowl Chicken Curry (or High-protein Veg) + Rice', calPercent: 0.20 }
                    ]
                }
            ]
        }
    }
};

export function getMealPlan(goal, dietType, gender) {
    const plans = mealPlans[gender]?.[goal]?.[dietType] || mealPlans[gender]?.[goal]?.['veg'];
    return plans || [];
}

// ── Health Tips ──────────────────────────────────────────────
export function getTips(goal) {
    const tips = {
        weightLoss: [
            { icon: '💧', text: 'Drink 2.5–3 litres of water daily, especially before meals.' },
            { icon: '🚶', text: 'Walk at least 8,000–10,000 steps every day.' },
            { icon: '🌙', text: 'Sleep 7–8 hours. Poor sleep raises cortisol and cravings.' },
            { icon: '🚫', text: 'Avoid sugar, refined flour, fried foods and soft drinks.' },
            { icon: '⏰', text: 'Eat dinner at least 2 hours before bedtime.' },
            { icon: '🧘', text: 'Practice mindful eating — chew slowly and avoid screens at meals.' },
        ],
        weightGain: [
            { icon: '🍽️', text: 'Never skip meals — aim for 5–6 meals a day for a calorie surplus.' },
            { icon: '💪', text: 'Do progressive resistance training 4–5 days a week.' },
            { icon: '🥛', text: 'Include calorie-dense foods: nuts, ghee, milk, eggs, paneer.' },
            { icon: '💧', text: 'Drink 3 litres of water daily to support muscle recovery.' },
            { icon: '😴', text: 'Sleep 8 hours. Muscles grow during rest.' },
            { icon: '📅', text: 'Track your calories and adjust weekly if weight does not change.' },
        ]
    };
    return tips[goal] || tips.weightLoss;
}
