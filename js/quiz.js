/**
 * VFit – Quiz Logic
 */

import { getCalories, getMacros, getMealPlan, getTips } from './dietData.js';

// ── Quiz Steps ───────────────────────────────────────────────
const steps = [
    {
        id: 'name',
        type: 'text',
        question: "What's your name?",
        sub: "Let's personalise your diet plan.",
        placeholder: 'Enter your full name',
        icon: '👋'
    },
    {
        id: 'gender',
        type: 'options',
        question: 'What is your gender?',
        sub: 'Calorie needs vary between male and female.',
        icon: '⚧',
        options: [
            { label: 'Male', value: 'male', icon: '👨' },
            { label: 'Female', value: 'female', icon: '👩' },
        ]
    },
    {
        id: 'height',
        type: 'height',
        question: 'What is your height?',
        sub: 'Please enter your height in Feet and Inches.',
        icon: '📏'
    },
    {
        id: 'weight',
        type: 'number',
        question: 'What is your current weight?',
        sub: 'We use this to calculate your daily calorie target.',
        placeholder: 'e.g. 72',
        unit: 'kg',
        icon: '⚖️',
        min: 30,
        max: 200
    },
    {
        id: 'dietType',
        type: 'options',
        question: 'What type of diet do you prefer?',
        sub: 'Your meal plan will be curated accordingly.',
        icon: '🥗',
        options: [
            { label: 'Vegetarian', value: 'veg', icon: '🥦', desc: 'No meat or eggs' },
            { label: 'Non-Vegetarian', value: 'nonVeg', icon: '🍗', desc: 'Includes eggs & meat' },
        ]
    },
    {
        id: 'activity',
        type: 'options',
        question: 'How active are you?',
        sub: 'This helps us fine-tune your plan.',
        icon: '🏃',
        options: [
            { label: 'Sedentary', value: 'sedentary', icon: '🛋️', desc: 'Mostly sitting, little exercise' },
            { label: 'Light Active', value: 'light', icon: '🚶', desc: 'Light walk 1–3 days/week' },
            { label: 'Moderate', value: 'moderate', icon: '🏋️', desc: 'Exercise 3–5 days/week' },
            { label: 'Very Active', value: 'veryActive', icon: '🔥', desc: 'Hard training 6–7 days/week' },
        ]
    },
    {
        id: 'goal',
        type: 'options',
        question: 'What is your fitness goal?',
        sub: 'Choose the goal that best describes what you want to achieve.',
        icon: '🎯',
        options: [
            { label: 'Lose Weight', value: 'weightLoss', icon: '🔥', desc: 'Reduce body fat & get lean' },
            { label: 'Gain Weight', value: 'weightGain', icon: '💪', desc: 'Build muscle & add mass' },
        ]
    },
    {
        id: 'email',
        type: 'email',
        question: 'Where should we send your plan?',
        sub: 'We need your email to send the personalised diet plan.',
        icon: '✉️',
        placeholder: 'Enter your email address'
    },
    {
        id: 'payment',
        type: 'payment',
        question: 'Complete Your Order',
        sub: 'A one-time fee of ₹99 for your lifetime personalised diet plan.',
        icon: '💳'
    }
];

// ── State ────────────────────────────────────────────────────
let currentStep = 0;
const answers = {};

// ── DOM Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderStep(currentStep);
});

// ── Render ───────────────────────────────────────────────────
function renderStep(index) {
    const step = steps[index];
    const total = steps.length;
    const pct = ((index) / total) * 100;

    document.querySelector('.quiz-progress-fill').style.width = pct + '%';
    document.querySelector('.quiz-step-label').textContent =
        `Step ${index + 1} of ${total}`;

    const card = document.getElementById('quiz-card');
    card.innerHTML = buildStepHTML(step);
    card.style.animation = 'none';
    requestAnimationFrame(() => { card.style.animation = ''; });

    // Bind events
    if (step.type === 'options') {
        card.querySelectorAll('.q-option').forEach(btn => {
            btn.addEventListener('click', () => {
                card.querySelectorAll('.q-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                answers[step.id] = btn.dataset.value;
                updateNext();
            });
        });
        // Pre-select if already answered
        if (answers[step.id]) {
            const existing = card.querySelector(`[data-value="${answers[step.id]}"]`);
            if (existing) existing.classList.add('selected');
        }
    }

    if (step.type === 'text' || step.type === 'number' || step.type === 'email') {
        const inp = card.querySelector('.q-input');
        inp.addEventListener('input', () => {
            answers[step.id] = inp.value.trim();
            updateNext();
        });
        if (answers[step.id]) {
            inp.value = answers[step.id];
        }
    }

    if (step.type === 'height') {
        const ftInp = card.querySelector('#height-ft');
        const inInp = card.querySelector('#height-in');
        const updateHeight = () => {
            answers[step.id] = { ft: ftInp.value, in: inInp.value };
            updateNext();
        };
        ftInp.addEventListener('input', updateHeight);
        inInp.addEventListener('input', updateHeight);

        if (answers[step.id]) {
            ftInp.value = answers[step.id].ft || '';
            inInp.value = answers[step.id].in || '';
        }
    }

    if (step.type === 'payment') {
        const btn = card.querySelector('.mock-pay-btn');
        const errEl = card.querySelector('.payment-error');

        const showError = (msg) => {
            if (errEl) {
                errEl.textContent = msg;
                errEl.style.display = 'block';
            } else {
                alert(msg);
            }
        };

        const hideError = () => {
            if (errEl) {
                errEl.style.display = 'none';
                errEl.textContent = '';
            }
        };

        const setButtonLoading = (loading, text) => {
            btn.disabled = loading;
            btn.innerHTML = text;
            if (loading) {
                btn.style.opacity = '0.7';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        };

        btn.addEventListener('click', async () => {
            hideError();
            setButtonLoading(true, 'Initializing...');

            try {
                // 1. Fetch Razorpay key ID from config
                const configRes = await fetch('/api/config');
                if (!configRes.ok) {
                    throw new Error('Failed to load payment configuration.');
                }
                const config = await configRes.json();
                if (!config.keyId) {
                    throw new Error('Razorpay Key ID not configured.');
                }

                // 2. Create Razorpay order
                const orderRes = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: 9900, // 9900 paise = ₹99
                        currency: 'INR',
                        receipt: 'receipt_vfit_' + Date.now(),
                    }),
                });

                if (!orderRes.ok) {
                    const errorData = await orderRes.json();
                    throw new Error(errorData.error || 'Failed to create payment order.');
                }

                const order = await orderRes.json();

                // 3. Open Razorpay checkout modal
                const options = {
                    key: config.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'VFit Plan',
                    description: 'Lifetime Personalised Diet Plan',
                    order_id: order.order_id,
                    handler: async function (response) {
                        setButtonLoading(true, 'Verifying Payment...');
                        try {
                            const verifyRes = await fetch('/api/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyRes.ok && verifyData.status === 'ok') {
                                answers[step.id] = 'paid';
                                updateNext();
                                btn.innerHTML = '✅ Payment Successful';
                                btn.style.background = 'var(--primary-dark)';
                                btn.style.color = '#fff';
                                setTimeout(() => {
                                    goNext();
                                }, 1000);
                            } else {
                                throw new Error(verifyData.error || 'Payment verification failed.');
                            }
                        } catch (err) {
                            showError(err.message || 'Payment verification failed.');
                            setButtonLoading(false, 'Pay Now');
                        }
                    },
                    prefill: {
                        name: answers.name || '',
                        email: answers.email || '',
                    },
                    theme: {
                        color: '#f5c518',
                    },
                    modal: {
                        ondismiss: function () {
                            showError('Payment cancelled by user.');
                            setButtonLoading(false, 'Pay Now');
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    showError(response.error.description || 'Payment failed.');
                    setButtonLoading(false, 'Pay Now');
                });
                rzp.open();

            } catch (error) {
                console.error(error);
                showError(error.message || 'An error occurred during payment setup.');
                setButtonLoading(false, 'Pay Now');
            }
        });
    }

    // Bind nav
    const nextBtn = card.querySelector('#btn-next');
    const backBtn = card.querySelector('#btn-back');

    nextBtn.addEventListener('click', goNext);
    if (backBtn) backBtn.addEventListener('click', goBack);

    // Focus text inputs
    if (step.type === 'text' || step.type === 'number' || step.type === 'email' || step.type === 'height') {
        setTimeout(() => card.querySelector('.q-input')?.focus(), 100);
    }

    updateNext();
}

function buildStepHTML(step) {
    const isFirst = (currentStep === 0);
    const isLast = (currentStep === steps.length - 1);

    let body = '';

    if (step.type === 'options') {
        const cols = step.options.length > 3 ? 'grid-cols-2' : '';
        body = `<div class="q-options ${cols}">` +
            step.options.map(o => `
        <button class="q-option" data-value="${o.value}">
          <span class="option-icon">${o.icon}</span>
          <span class="option-label-wrap">
            <span style="font-weight:700">${o.label}</span>
            ${o.desc ? `<span style="font-size:0.82rem;color:var(--text-muted);display:block">${o.desc}</span>` : ''}
          </span>
          <span class="check-circle"></span>
        </button>`
            ).join('') +
            '</div>';
    }

    if (step.type === 'text') {
        body = `<div class="q-input-wrap">
      <input class="q-input" type="text" placeholder="${step.placeholder}" maxlength="50" />
    </div>`;
    }

    if (step.type === 'email') {
        body = `<div class="q-input-wrap">
      <input class="q-input" type="email" placeholder="${step.placeholder}" />
    </div>`;
    }

    if (step.type === 'number') {
        body = `<div class="q-input-wrap">
      <input class="q-input" type="number" placeholder="${step.placeholder}" min="${step.min}" max="${step.max}" />
      <span class="q-input-label">${step.unit}</span>
    </div>`;
    }

    if (step.type === 'height') {
        body = `<div style="display: flex; gap: 16px;">
            <div class="q-input-wrap" style="flex:1;">
                <input class="q-input" id="height-ft" type="number" placeholder="Feet (e.g. 5)" min="3" max="8" />
                <span class="q-input-label">ft</span>
            </div>
            <div class="q-input-wrap" style="flex:1;">
                <input class="q-input" id="height-in" type="number" placeholder="Inches (e.g. 10)" min="0" max="11" />
                <span class="q-input-label">in</span>
            </div>
        </div>`;
    }

    if (step.type === 'payment') {
        body = `<div style="text-align:center; padding: 20px 0;">
            <div style="font-size:3rem; margin-bottom:16px;">₹99</div>
            <p style="color:var(--text-secondary); margin-bottom: 24px;">Secure payment via UPI, Card, or Netbanking.</p>
            <button class="mock-pay-btn" style="background:var(--primary); color:#000; width:100%; padding:16px; border-radius:50px; font-weight:700; border:none; cursor:pointer; font-size:1.1rem; transition:0.3s;">
                Pay Now
            </button>
            <p class="payment-error" style="color: #ff4a4a; margin-top: 16px; font-weight: 500; font-size: 0.9rem; display: none; text-align: center;"></p>
        </div>`;
    }

    return `
    <div class="quiz-question">${step.icon} ${step.question}</div>
    <p class="quiz-question-sub">${step.sub}</p>
    ${body}
    <div class="quiz-nav">
      ${!isFirst ? '<button class="btn-quiz-back" id="btn-back">← Back</button>' : ''}
      <button class="btn-quiz-next" id="btn-next" disabled style="${step.type === 'payment' ? 'display:none;' : ''}">
        ${isLast ? 'Complete' : 'Continue →'}
      </button>
    </div>
  `;
}

function updateNext() {
    const step = steps[currentStep];
    const btn = document.getElementById('btn-next');
    if (!btn) return;

    const val = answers[step.id];
    let valid = val !== undefined && val !== '';

    if (step.type === 'number') {
        const n = parseFloat(val);
        valid = !isNaN(n) && n >= step.min && n <= step.max;
    }

    if (step.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    if (step.type === 'height') {
        if (val) {
            const ft = parseInt(val.ft);
            const inch = parseInt(val.in);
            valid = !isNaN(ft) && ft >= 3 && ft <= 8 && !isNaN(inch) && inch >= 0 && inch <= 11;
        } else {
            valid = false;
        }
    }

    btn.disabled = !valid;
}

function goNext() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    } else {
        submitQuiz();
    }
}

function goBack() {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
    }
}

// ── Submit ───────────────────────────────────────────────────
// ── Submit ───────────────────────────────────────────────────
function submitQuiz() {
    const { name, gender, goal, weight, dietType } = answers;

    // Calculate details using dietData engine
    const calories = getCalories(gender, weight, goal);
    const macros = getMacros(calories, goal, dietType);
    const mealPlanDays = getMealPlan(goal, dietType, gender);
    const tips = getTips(goal);

    // Save everything to session storage
    const finalResult = {
        name,
        gender,
        goal,
        weight,
        dietType,
        calories,
        macros,
        mealPlanDays, // This is an array of 7 days
        tips
    };

    sessionStorage.setItem('vfit_result', JSON.stringify(finalResult));

    // Redirect to results page
    window.location.href = 'result.html';
}
