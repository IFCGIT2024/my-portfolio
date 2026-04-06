'use strict';

// ─── State ────────────────────────────────────────────────────────────────────

let currentResult = null;
let comparisonSlots = [null, null, null];

// ─── Sample Deal ──────────────────────────────────────────────────────────────

const SAMPLE_DEAL = {
    dealName:          'Sample Duplex — Oak St.',
    purchasePrice:     350000,
    arv:               380000,
    rehabCosts:        15000,
    closingCosts:      7000,
    downPaymentPct:    25,
    interestRate:      7.0,
    loanTermYears:     30,
    originationFee:    1,
    monthlyGrossRent:  3200,
    otherMonthlyIncome:100,
    occupancyRate:     95,
    propMgmtMode:      'pct',
    propMgmtPct:       10,
    propMgmtFlat:      0,
    annualTaxes:       4800,
    annualInsurance:   1800,
    maintenanceMode:   'pct',
    maintenancePct:    8,
    maintenanceFlat:   0,
    monthlyUtilities:  0,
    monthlyHOA:        0,
    vacancyPct:        7,
    capexMode:         'pct',
    capexPct:          5,
    capexFlat:         0,
    advertisingAnnual: 400,
    rentGrowthPct:     3,
    expenseGrowthPct:  3,
    appreciationPct:   3,
    holdingYears:      10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDollar(v) {
    const n = Math.round(v);
    return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString();
}
function fmtPct(v, d = 2) { return v.toFixed(d) + '%'; }
function fmtNum(v, d = 2) { return isFinite(v) ? v.toFixed(d) : '∞'; }

// ─── Read / Write Inputs ──────────────────────────────────────────────────────

function getInputs() {
    const v = (id, def = 0) => { const el = document.getElementById(id); if (!el) return def; const n = parseFloat(el.value); return isNaN(n) ? def : n; };
    const s = (id, def = '') => { const el = document.getElementById(id); return el ? el.value : def; };
    return {
        dealName:           s('dealName', 'My Deal'),
        purchasePrice:      v('purchasePrice'),
        arv:                v('arv'),
        rehabCosts:         v('rehabCosts'),
        closingCosts:       v('closingCosts'),
        downPaymentPct:     v('downPaymentPct', 20),
        interestRate:       v('interestRate', 7),
        loanTermYears:      v('loanTermYears', 30),
        originationFee:     v('originationFee', 1),
        monthlyGrossRent:   v('monthlyGrossRent'),
        otherMonthlyIncome: v('otherMonthlyIncome'),
        occupancyRate:      v('occupancyRate', 95),
        propMgmtMode:       s('propMgmtMode', 'pct'),
        propMgmtPct:        v('propMgmtPct', 10),
        propMgmtFlat:       v('propMgmtFlat'),
        annualTaxes:        v('annualTaxes'),
        annualInsurance:    v('annualInsurance'),
        maintenanceMode:    s('maintenanceMode', 'pct'),
        maintenancePct:     v('maintenancePct', 5),
        maintenanceFlat:    v('maintenanceFlat'),
        monthlyUtilities:   v('monthlyUtilities'),
        monthlyHOA:         v('monthlyHOA'),
        vacancyPct:         v('vacancyPct', 5),
        capexMode:          s('capexMode', 'pct'),
        capexPct:           v('capexPct', 5),
        capexFlat:          v('capexFlat'),
        advertisingAnnual:  v('advertisingAnnual'),
        rentGrowthPct:      v('rentGrowthPct', 3),
        expenseGrowthPct:   v('expenseGrowthPct', 3),
        appreciationPct:    v('appreciationPct', 3),
        holdingYears:       v('holdingYears', 10),
    };
}

function setInputs(d) {
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set('dealName',          d.dealName          ?? '');
    set('purchasePrice',     d.purchasePrice      || '');
    set('arv',               d.arv                || '');
    set('rehabCosts',        d.rehabCosts         || '');
    set('closingCosts',      d.closingCosts       || '');
    set('downPaymentPct',    d.downPaymentPct     ?? 20);
    set('interestRate',      d.interestRate       || '');
    set('loanTermYears',     d.loanTermYears      ?? 30);
    set('originationFee',    d.originationFee     ?? 1);
    set('monthlyGrossRent',  d.monthlyGrossRent   || '');
    set('otherMonthlyIncome',d.otherMonthlyIncome || '');
    set('occupancyRate',     d.occupancyRate      ?? 95);
    set('propMgmtMode',      d.propMgmtMode       || 'pct');
    set('propMgmtPct',       d.propMgmtPct        || '');
    set('propMgmtFlat',      d.propMgmtFlat       || '');
    set('maintenanceMode',   d.maintenanceMode    || 'pct');
    set('maintenancePct',    d.maintenancePct     || '');
    set('maintenanceFlat',   d.maintenanceFlat    || '');
    set('annualTaxes',       d.annualTaxes        || '');
    set('annualInsurance',   d.annualInsurance    || '');
    set('monthlyUtilities',  d.monthlyUtilities   || '');
    set('monthlyHOA',        d.monthlyHOA         || '');
    set('vacancyPct',        d.vacancyPct         ?? 5);
    set('capexMode',         d.capexMode          || 'pct');
    set('capexPct',          d.capexPct           || '');
    set('capexFlat',         d.capexFlat          || '');
    set('advertisingAnnual', d.advertisingAnnual  || '');
    set('rentGrowthPct',     d.rentGrowthPct      ?? 3);
    set('expenseGrowthPct',  d.expenseGrowthPct   ?? 3);
    set('appreciationPct',   d.appreciationPct    ?? 3);
    set('holdingYears',      d.holdingYears       ?? 10);
    updateModeVisibility();
}

function updateModeVisibility() {
    const toggle = (modeId, pctGroupId, flatGroupId) => {
        const el = document.getElementById(modeId);
        if (!el) return;
        const isPct = el.value === 'pct';
        const pg = document.getElementById(pctGroupId);
        const fg = document.getElementById(flatGroupId);
        if (pg) pg.style.display = isPct ? '' : 'none';
        if (fg) fg.style.display = isPct ? 'none' : '';
    };
    toggle('propMgmtMode',  'propMgmtPctGroup',  'propMgmtFlatGroup');
    toggle('maintenanceMode','maintenancePctGroup','maintenanceFlatGroup');
    toggle('capexMode',      'capexPctGroup',      'capexFlatGroup');
}

// ─── Render Results ───────────────────────────────────────────────────────────

function renderMetrics(result, inputs) {
    const score = calcDealScore(result);
    const scoreCls = score >= 70 ? 'score-excellent' : score >= 50 ? 'score-good' : score >= 30 ? 'score-fair' : 'score-poor';
    const scoreLbl = score >= 70 ? 'Strong Deal' : score >= 50 ? 'Decent Deal' : score >= 30 ? 'Marginal Deal' : 'Weak Deal';
    const cocGap = result.coc - 15;
    const targetMet = cocGap >= 0;

    // 1.15× expenses rule: monthly gross rent ≥ 1.15 × (P&I + monthly operating expenses)
    const totalMonthlyExp = result.monthlyPayment + result.annualOperatingExpenses / 12;
    const minRent115      = totalMonthlyExp * 1.15;
    const monthlyRent     = inputs.monthlyGrossRent || 0;
    const rent115Met      = monthlyRent >= minRent115;
    const rent115Gap      = monthlyRent - minRent115;

    const banner = document.getElementById('dealScoreBanner');
    if (banner) {
        banner.className = 'deal-score-banner ' + scoreCls;
        banner.innerHTML = `
            <div class="score-display">
                <div class="score-ring">
                    <span class="score-number">${score}</span>
                    <span class="score-max">/100</span>
                </div>
                <div class="score-text">
                    <div class="score-label">${scoreLbl}</div>
                    <div class="score-sub">Overall Deal Score</div>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-end">
                <div class="target-badge ${targetMet ? 'target-met' : 'target-miss'}">
                    ${targetMet
                        ? `✓ 15% CoC Target Met (+${cocGap.toFixed(1)}%)`
                        : `✗ ${Math.abs(cocGap).toFixed(1)}% Below 15% CoC Target`}
                </div>
                <div class="target-badge ${rent115Met ? 'target-met' : 'target-miss'}" title="Rent must cover 1.15× all monthly expenses (mortgage + ops) for positive cashflow">
                    ${rent115Met
                        ? `✓ 1.15× Expenses Rule (+${fmtDollar(rent115Gap)}/mo)`
                        : `✗ Needs ${fmtDollar(Math.abs(rent115Gap))}/mo more rent (1.15× rule)`}
                </div>
            </div>`;
    }

    const cards = [
        { label: 'Monthly Cash Flow', value: fmtDollar(result.monthlyCashFlow), sub: fmtDollar(result.annualCashFlow) + '/yr', cls: result.monthlyCashFlow >= 500 ? 'good' : result.monthlyCashFlow >= 0 ? 'fair' : 'poor', tip: 'Net income after ALL expenses + mortgage payments' },
        { label: 'Cash-on-Cash Return', value: fmtPct(result.coc), sub: 'Rating: ' + getRating('coc', result.coc).label, cls: getRating('coc', result.coc).cls, tip: 'Annual cash flow ÷ total cash invested. Target: ≥15%' },
        { label: 'Cap Rate', value: fmtPct(result.capRate), sub: getRating('capRate', result.capRate).label + ' | All-cash return', cls: getRating('capRate', result.capRate).cls, tip: 'NOI ÷ Purchase Price. Ignores financing.' },
        { label: 'DSCR', value: fmtNum(result.dscr), sub: 'Lender min: 1.25 — ' + getRating('dscr', result.dscr).label, cls: getRating('dscr', result.dscr).cls, tip: 'Net income ÷ debt payments. Lenders require ≥1.25' },
        { label: 'Break-Even Ratio', value: fmtPct(result.ber), sub: 'Lower is better — ' + getRating('ber', result.ber).label, cls: getRating('ber', result.ber).cls, tip: '(All expenses + debt) ÷ gross income. <60% is excellent' },
        { label: 'NOI (Annual)', value: fmtDollar(result.noi), sub: fmtDollar(result.noi / 12) + '/mo before mortgage', cls: result.noi > 0 ? 'good' : 'poor', tip: 'Net Operating Income — excludes mortgage, taxes, depreciation' },
        { label: 'LTV', value: fmtPct(result.ltv), sub: 'Loan: ' + fmtDollar(result.loanAmount) + ' — ' + getRating('ltv', result.ltv).label, cls: getRating('ltv', result.ltv).cls, tip: 'Loan ÷ Purchase Price. <80% to avoid PMI' },
        { label: 'Gross Rent Multiplier', value: fmtNum(result.grm), sub: '5–8 = typical range', cls: result.grm > 0 && result.grm <= 8 ? 'good' : result.grm <= 12 ? 'fair' : 'poor', tip: 'Purchase Price ÷ Annual Rent. Quick screen only.' },
        { label: '1% Rule', value: fmtPct(result.onePercentRatio), sub: result.onePercentRatio >= 1 ? '✓ Passes 1% Rule' : '✗ Below 1% Rule', cls: result.onePercentRatio >= 1 ? 'excellent' : result.onePercentRatio >= 0.8 ? 'fair' : 'poor', tip: 'Monthly Rent ÷ Purchase Price. Rule of thumb: ≥1%' },
        { label: 'Monthly P&I Payment', value: fmtDollar(result.monthlyPayment), sub: fmtDollar(result.annualDebtService) + '/yr debt service', cls: 'neutral', tip: 'Principal + Interest only (not PITI)' },
        { label: 'Total Cash Invested', value: fmtDollar(result.totalCashInvested), sub: 'Down: ' + fmtDollar(result.downPayment), cls: 'neutral', tip: 'Down payment + rehab + closing costs + origination fees' },
        { label: 'Starting Equity', value: fmtDollar(result.equity), sub: 'Purchase price − loan', cls: result.equity > 0 ? 'good' : 'poor', tip: 'Equity at purchase. Does not include ARV uplift.' },
    ];

    const grid = document.getElementById('metricsGrid');
    if (grid) {
        grid.innerHTML = cards.map(c => `
            <div class="metric-card metric-${c.cls}" title="${c.tip}">
                <div class="metric-label">${c.label}</div>
                <div class="metric-value">${c.value}</div>
                <div class="metric-sub">${c.sub}</div>
            </div>`).join('');
    }

    renderExpenseBreakdown('chartExpenseBreakdown', result.expenses);

    const tbody = document.getElementById('expenseDetail');
    if (tbody) {
        const e = result.expenses;
        const rows = [
            ['Property Management', e.propMgmt],
            ['Property Taxes',      e.taxes],
            ['Insurance',           e.insurance],
            ['Maintenance & Repairs', e.maintenance],
            ['Utilities',           e.utilities],
            ['HOA',                 e.hoa],
            ['Vacancy Allowance',   e.vacancy],
            ['CapEx Reserve',       e.capex],
            ['Advertising',         e.advertising],
        ].filter(r => r[1] > 0);
        tbody.innerHTML = rows.map(([lbl, ann]) =>
            `<tr><td>${lbl}</td><td>${fmtDollar(ann / 12)}/mo</td><td>${fmtDollar(ann)}/yr</td></tr>`
        ).join('') + `<tr class="total-row"><td><strong>Total Operating Expenses</strong></td><td><strong>${fmtDollar(result.annualOperatingExpenses / 12)}/mo</strong></td><td><strong>${fmtDollar(result.annualOperatingExpenses)}/yr</strong></td></tr>`;
    }

    renderWarnings(result, inputs);
}

function renderWarnings(result, inputs) {
    const warns = [];
    if (!inputs.purchasePrice)       warns.push({ t: 'info',  m: 'Enter a purchase price to see results.' });
    if (!inputs.monthlyGrossRent)    warns.push({ t: 'info',  m: 'No monthly rent entered — income metrics will be zero.' });
    if (result.dscr < 1.0 && inputs.purchasePrice)  warns.push({ t: 'error', m: `DSCR ${result.dscr.toFixed(2)} — NOI cannot cover debt service. Lenders won't finance this.` });
    else if (result.dscr < 1.25 && result.dscr > 0) warns.push({ t: 'warn',  m: `DSCR ${result.dscr.toFixed(2)} — Most lenders require ≥1.25. Consider more rent or less debt.` });
    if (result.annualCashFlow < 0 && inputs.purchasePrice) warns.push({ t: 'error', m: `Negative annual cash flow (${fmtDollar(result.annualCashFlow)}) — you will lose money each month.` });
    if (result.ltv > 80 && inputs.purchasePrice) warns.push({ t: 'warn', m: `LTV ${result.ltv.toFixed(1)}% exceeds 80% — factor in PMI or a larger down payment.` });
    if (result.ber > 80 && inputs.purchasePrice) warns.push({ t: 'warn', m: `Break-even ratio ${result.ber.toFixed(1)}% — very little cushion; a vacancy or repair could flip to negative.` });
    if (!inputs.vacancyPct)          warns.push({ t: 'info',  m: 'Vacancy set to 0% — consider 5–10% for realistic projections.' });

    const el = document.getElementById('warnings');
    if (el) {
        el.innerHTML = warns.map(w =>
            `<div class="warn-item warn-${w.t}">${w.t === 'error' ? '⚠' : w.t === 'warn' ? '⚡' : 'ℹ'} ${w.m}</div>`
        ).join('');
    }
}

// ─── Projections Tab ──────────────────────────────────────────────────────────

function refreshProjections() {
    const inputs = getInputs();
    if (!inputs.purchasePrice || !inputs.monthlyGrossRent) return;
    const years = Math.max(1, Math.min(30, parseInt(inputs.holdingYears) || 10));
    const { rows, totalCashInvested } = generateProjections(inputs, years);

    const tbody = document.getElementById('projTableBody');
    if (tbody) {
        tbody.innerHTML = rows.map(r => `
            <tr>
                <td class="yr-cell">${r.year}</td>
                <td>${fmtDollar(r.grossIncome)}</td>
                <td>${fmtDollar(r.opExpenses)}</td>
                <td>${fmtDollar(r.noi)}</td>
                <td>${fmtDollar(r.debtService)}</td>
                <td class="${r.cashFlow >= 0 ? 'pos-text' : 'neg-text'}">${fmtDollar(r.cashFlow)}</td>
                <td>${fmtDollar(r.propertyValue)}</td>
                <td>${fmtDollar(r.loanBalance)}</td>
                <td class="pos-text">${fmtDollar(r.equity)}</td>
                <td class="${r.coc >= 15 ? 'pos-text' : r.coc >= 10 ? 'fair-text' : 'neg-text'}">${r.coc.toFixed(2)}%</td>
            </tr>`).join('');
    }

    renderAllProjectionCharts(rows);

    const last = rows[rows.length - 1];
    const totalCF = rows.reduce((s, r) => s + r.cashFlow, 0);
    const sumEl = document.getElementById('projSummary');
    if (sumEl) {
        sumEl.innerHTML = `
            <div class="proj-stat"><span>Total Cash Flow (${years} yrs)</span><strong class="${totalCF >= 0 ? 'pos-text' : 'neg-text'}">${fmtDollar(totalCF)}</strong></div>
            <div class="proj-stat"><span>Property Value (Yr ${years})</span><strong>${fmtDollar(last.propertyValue)}</strong></div>
            <div class="proj-stat"><span>Equity (Yr ${years})</span><strong class="pos-text">${fmtDollar(last.equity)}</strong></div>
            <div class="proj-stat"><span>CoC Return (Yr ${years})</span><strong class="${last.coc >= 15 ? 'pos-text' : 'neg-text'}">${last.coc.toFixed(2)}%</strong></div>
            <div class="proj-stat"><span>Total Cash Invested</span><strong>${fmtDollar(totalCashInvested)}</strong></div>`;
    }
}

// ─── Target Calculator ─────────────────────────────────────────────────────────

function runTargetCalc() {
    const inputs = getInputs();
    const targetCoc = parseFloat(document.getElementById('targetCoc')?.value) || 15;
    const variable  = document.getElementById('solveFor')?.value || 'purchasePrice';
    const resultEl  = document.getElementById('targetResult');
    if (!resultEl) return;

    resultEl.innerHTML = '<div class="target-loading">Calculating…</div>';

    // small delay so UI updates before heavy calc
    setTimeout(() => {
        const solved = solveForTarget(variable, targetCoc, inputs);

        if (solved === null) {
            resultEl.innerHTML = `<div class="target-impossible">
                <p>⚠ No solution found in a realistic range.</p>
                <p>This deal structure cannot achieve ${targetCoc}% CoC. Try adjusting other inputs.</p>
            </div>`;
            return;
        }

        const META = {
            purchasePrice:    { label: 'Maximum Purchase Price',      fmt: v => '$' + Math.round(v).toLocaleString() },
            monthlyGrossRent: { label: 'Minimum Monthly Rent Needed',  fmt: v => '$' + Math.round(v).toLocaleString() + '/mo' },
            interestRate:     { label: 'Maximum Interest Rate',        fmt: v => v.toFixed(3) + '%' },
            downPaymentPct:   { label: 'Minimum Down Payment',         fmt: v => v.toFixed(1) + '%' },
        };
        const { label, fmt } = META[variable];
        const verify = analyzeDeal({ ...inputs, [variable]: solved });
        const appliedVal = variable === 'purchasePrice' ? Math.round(solved) : solved;

        resultEl.innerHTML = `
            <div class="target-result-card">
                <div class="target-answer">
                    <div class="target-answer-label">${label}</div>
                    <div class="target-answer-value">${fmt(solved)}</div>
                </div>
                <div class="target-verify">
                    <p>At this value: CoC = <strong class="pos-text">${verify.coc.toFixed(2)}%</strong>,
                       DSCR = <strong>${verify.dscr.toFixed(2)}</strong>,
                       Monthly CF = <strong class="${verify.monthlyCashFlow >= 0 ? 'pos-text' : 'neg-text'}">${fmtDollar(verify.monthlyCashFlow)}</strong></p>
                    <button class="btn btn-accent" onclick="applyTargetToForm(${JSON.stringify({ [variable]: appliedVal })})">
                        ← Apply to Form
                    </button>
                </div>
            </div>`;
    }, 10);
}

function applyTargetToForm(partial) {
    const inputs = getInputs();
    setInputs({ ...inputs, ...partial });
    switchTab('analyze');
    recalculate();
}

// ─── Payment Budget Solver ────────────────────────────────────────────────────

function runBudgetCalc() {
    const inputs   = getInputs();
    const mode     = document.getElementById('budgetSolveFor')?.value;
    const resultEl = document.getElementById('budgetResult');
    if (!resultEl) return;

    if (mode === 'ruleOfExpenses') {
        // Find min rent where cashflow >= 15% of total monthly outflows (mortgage + ops)
        // Binary search: monthlyCashFlow = 0.15 * (monthlyPayment + annualOperatingExpenses/12)
        let lo = 0, hi = 50000, solved = null;
        for (let i = 0; i < 300; i++) {
            const mid = (lo + hi) / 2;
            const r = analyzeDeal({ ...inputs, monthlyGrossRent: mid });
            const totalMonthlyExp = r.monthlyPayment + r.annualOperatingExpenses / 12;
            const diff = r.monthlyCashFlow - totalMonthlyExp * 0.15;
            if (Math.abs(diff) < 0.01) { solved = mid; break; }
            if (diff < 0) lo = mid; else hi = mid;
        }
        if (solved === null) solved = (lo + hi) / 2;

        const v = analyzeDeal({ ...inputs, monthlyGrossRent: solved });
        const totalMonthlyExp = v.monthlyPayment + v.annualOperatingExpenses / 12;
        const buffer = v.monthlyCashFlow;

        resultEl.innerHTML = `
            <div class="target-result-card">
                <div class="target-answer">
                    <div class="target-answer-label">Minimum Monthly Gross Rent (1.15&times; expenses)</div>
                    <div class="target-answer-value">${fmtDollar(solved)}/mo</div>
                </div>
                <div class="target-verify">
                    <p>Monthly expenses (mortgage + ops): <strong>${fmtDollar(totalMonthlyExp)}</strong>
                       &nbsp;&times; 1.15 = <strong class="pos-text">${fmtDollar(solved)}</strong></p>
                    <p>Cashflow: <strong class="pos-text">${fmtDollar(buffer)}/mo</strong>
                       &nbsp;|&nbsp; CoC: <strong>${v.coc.toFixed(2)}%</strong>
                       &nbsp;|&nbsp; DSCR: <strong>${v.dscr.toFixed(2)}</strong></p>
                    <p style="font-size:0.8rem;color:var(--text-2)">Rent covers all expenses with a 15% positive cashflow buffer.</p>
                    <button class="btn btn-accent" onclick="applyTargetToForm({ monthlyGrossRent: ${Math.round(solved)} })">
                        &larr; Apply to Form
                    </button>
                </div>
            </div>`;

    } else if (mode === 'maxPrice') {
        // Given a target monthly P&I payment, find the max purchase price
        const targetPayment = parseFloat(document.getElementById('budgetMonthlyPayment')?.value);
        if (!targetPayment || targetPayment <= 0) {
            resultEl.innerHTML = '<div class="target-impossible"><p>Enter a monthly payment amount.</p></div>';
            return;
        }

        const rate     = (inputs.interestRate || 6.5) / 100 / 12;
        const n        = (inputs.loanTermYears || 30) * 12;
        const downPct  = (inputs.downPaymentPct || 20) / 100;

        // mortgage payment = loanAmt * rate*(1+rate)^n / ((1+rate)^n - 1)
        // loanAmt = targetPayment / (rate*(1+rate)^n / ((1+rate)^n - 1))
        let maxPrice;
        if (rate === 0) {
            const loanAmt = targetPayment * n;
            maxPrice = loanAmt / (1 - downPct);
        } else {
            const factor  = Math.pow(1 + rate, n);
            const loanAmt = targetPayment / (rate * factor / (factor - 1));
            maxPrice = loanAmt / (1 - downPct);
        }

        const downAmt    = maxPrice * downPct;
        const loanAmt    = maxPrice - downAmt;
        const actualPmt  = calcMonthlyPayment(loanAmt, inputs.interestRate || 6.5, inputs.loanTermYears || 30);

        resultEl.innerHTML = `
            <div class="target-result-card">
                <div class="target-answer">
                    <div class="target-answer-label">Maximum Purchase Price</div>
                    <div class="target-answer-value">${fmtDollar(maxPrice)}</div>
                </div>
                <div class="target-verify">
                    <p>Down payment (${inputs.downPaymentPct || 20}%): <strong>${fmtDollar(downAmt)}</strong> &nbsp;|&nbsp;
                       Loan: <strong>${fmtDollar(loanAmt)}</strong> &nbsp;|&nbsp;
                       Monthly P&amp;I: <strong class="pos-text">${fmtDollar(actualPmt)}</strong></p>
                    <p style="font-size:0.8rem;color:var(--text-2)">Rate: ${inputs.interestRate || 6.5}% &nbsp; Term: ${inputs.loanTermYears || 30} yrs</p>
                    <button class="btn btn-accent" onclick="applyTargetToForm({ purchasePrice: ${Math.round(maxPrice)}, arv: ${Math.round(maxPrice)} })">
                        &larr; Apply to Form
                    </button>
                </div>
            </div>`;

    } else {
        // minRent: given target monthly cashflow, find required gross monthly rent
        const targetCF = parseFloat(document.getElementById('budgetMonthlyCashflow')?.value) || 0;

        // Binary search: find monthlyGrossRent such that monthlyCashFlow = targetCF
        let lo = 0, hi = 50000, solved = null;
        for (let i = 0; i < 300; i++) {
            const mid = (lo + hi) / 2;
            const r = analyzeDeal({ ...inputs, monthlyGrossRent: mid });
            if (Math.abs(r.monthlyCashFlow - targetCF) < 0.01) { solved = mid; break; }
            if (r.monthlyCashFlow < targetCF) lo = mid; else hi = mid;
        }
        if (solved === null) solved = (lo + hi) / 2;

        const verify = analyzeDeal({ ...inputs, monthlyGrossRent: solved });

        resultEl.innerHTML = `
            <div class="target-result-card">
                <div class="target-answer">
                    <div class="target-answer-label">Minimum Monthly Gross Rent Needed</div>
                    <div class="target-answer-value">${fmtDollar(solved)}/mo</div>
                </div>
                <div class="target-verify">
                    <p>At this rent: Cashflow = <strong class="${verify.monthlyCashFlow >= 0 ? 'pos-text' : 'neg-text'}">${fmtDollar(verify.monthlyCashFlow)}/mo</strong> &nbsp;|&nbsp;
                       CoC = <strong>${verify.coc.toFixed(2)}%</strong> &nbsp;|&nbsp;
                       DSCR = <strong>${verify.dscr.toFixed(2)}</strong></p>
                    <button class="btn btn-accent" onclick="applyTargetToForm({ monthlyGrossRent: ${Math.round(solved)} })">
                        &larr; Apply to Form
                    </button>
                </div>
            </div>`;
    }
}

function initBudgetCalc() {
    document.getElementById('runBudgetCalc')?.addEventListener('click', runBudgetCalc);
    document.getElementById('budgetSolveFor')?.addEventListener('change', function () {
        const mode = this.value;
        const pf  = document.getElementById('budgetPaymentField');
        const cf  = document.getElementById('budgetCashflowField');
        const nf  = document.getElementById('budgetNoInputMsg');
        if (pf) pf.style.display  = mode === 'maxPrice'  ? '' : 'none';
        if (cf) cf.style.display  = mode === 'minRent'   ? '' : 'none';
        if (nf) nf.style.display  = mode === 'ruleOfExpenses' ? '' : 'none';
        document.getElementById('budgetResult').innerHTML = '';
    });
}

// ─── Saved Deals ──────────────────────────────────────────────────────────────

function renderSavedDeals() {
    const container = document.getElementById('savedDealsList');
    if (!container) return;
    const deals = getAllDeals();
    const keys = Object.keys(deals);
    if (!keys.length) {
        container.innerHTML = '<p class="no-data">No saved deals yet. Analyze a property and click "Save Deal".</p>';
        return;
    }
    container.innerHTML = keys.map(id => {
        const d = deals[id];
        const r = analyzeDeal(d.inputs);
        const s = calcDealScore(r);
        const cls = s >= 70 ? 'excellent' : s >= 50 ? 'good' : s >= 30 ? 'fair' : 'poor';
        return `
        <div class="saved-card">
            <div class="saved-card-info">
                <div class="saved-card-name">${d.name}</div>
                <div class="saved-card-meta">
                    ${new Date(d.savedAt).toLocaleDateString()} &middot;
                    $${Math.round(d.inputs.purchasePrice || 0).toLocaleString()} purchase &middot;
                    CoC <strong class="${r.coc >= 15 ? 'pos-text' : ''}">${r.coc.toFixed(1)}%</strong> &middot;
                    Score <span class="badge badge-${cls}">${s}/100</span>
                </div>
            </div>
            <div class="saved-card-actions">
                <button class="btn btn-sm" onclick="loadSavedDeal('${id}')">Load</button>
                <button class="btn btn-sm btn-secondary" onclick="addSavedToComparison('${id}')">+ Compare</button>
                <button class="btn btn-sm btn-secondary" onclick="dupeSavedDeal('${id}')">Duplicate</button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete('${id}')">Delete</button>
            </div>
        </div>`;
    }).join('');
}

function loadSavedDeal(id) {
    const deal = getDeal(id);
    if (!deal) return;
    setInputs(deal.inputs);
    switchTab('analyze');
    recalculate();
}

function confirmDelete(id) {
    if (confirm('Delete this deal permanently?')) {
        deleteDeal(id);
        renderSavedDeals();
    }
}

function dupeSavedDeal(id) {
    duplicateDeal(id);
    renderSavedDeals();
}

function addSavedToComparison(id) {
    const deal = getDeal(id);
    if (!deal) return;
    const slot = comparisonSlots.findIndex(s => s === null);
    if (slot === -1) { alert('All 3 comparison slots are full. Remove a deal first.'); return; }
    comparisonSlots[slot] = { id, name: deal.name, inputs: deal.inputs, result: analyzeDeal(deal.inputs) };
    switchTab('compare');
    renderComparisonSlots();
    renderComparison(comparisonSlots.filter(Boolean));
}

// ─── Comparison ───────────────────────────────────────────────────────────────

function renderComparisonSlots() {
    for (let i = 0; i < 3; i++) {
        const slot = comparisonSlots[i];
        const lbl = document.getElementById('compSlot' + i + 'Label');
        const btn = document.getElementById('compSlot' + i + 'Remove');
        const img = document.getElementById('compSlot' + i + 'Chip');
        if (lbl) lbl.textContent = slot ? slot.name : 'Empty Slot';
        if (btn) btn.style.display = slot ? '' : 'none';
        if (img) img.className = 'slot-chip ' + (slot ? 'slot-filled' : 'slot-empty');
    }
}

function removeFromComparison(i) {
    comparisonSlots[i] = null;
    renderComparisonSlots();
    renderComparison(comparisonSlots.filter(Boolean));
}

function loadCurrentIntoComparison() {
    const inputs = getInputs();
    if (!inputs.purchasePrice) { alert('Enter a deal first.'); return; }
    const result = currentResult || analyzeDeal(inputs);
    const slot = comparisonSlots.findIndex(s => s === null);
    if (slot === -1) { alert('All 3 comparison slots are full.'); return; }
    comparisonSlots[slot] = { id: 'current_' + Date.now(), name: inputs.dealName || 'Current Deal', inputs, result };
    renderComparisonSlots();
    renderComparison(comparisonSlots.filter(Boolean));
}

// ─── Recalculate ──────────────────────────────────────────────────────────────

function recalculate() {
    const inputs = getInputs();
    currentResult = analyzeDeal(inputs);
    renderMetrics(currentResult, inputs);
    // Update down payment $ preview
    const dpAmt = document.getElementById('downPaymentAmt');
    if (dpAmt) {
        const dp = inputs.purchasePrice * (inputs.downPaymentPct / 100);
        dpAmt.textContent = dp > 0 ? '= ' + fmtDollar(dp) : '';
    }
    // Update loan amount preview
    const loanAmt = document.getElementById('loanAmountDisplay');
    if (loanAmt) {
        loanAmt.textContent = currentResult.loanAmount > 0 ? fmtDollar(currentResult.loanAmount) : '–';
    }
}

// ─── Tab Switching ────────────────────────────────────────────────────────────

function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
    if (name === 'projections') refreshProjections();
    if (name === 'saved')       renderSavedDeals();
    if (name === 'compare')     { renderComparisonSlots(); renderComparison(comparisonSlots.filter(Boolean)); }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Live recalculation on all inputs
    document.querySelectorAll('#inputsPanel input, #inputsPanel select').forEach(el => {
        el.addEventListener('input',  recalculate);
        el.addEventListener('change', recalculate);
    });

    // Mode toggles
    ['propMgmtMode', 'maintenanceMode', 'capexMode'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => { updateModeVisibility(); recalculate(); });
    });

    // Save deal
    document.getElementById('saveDealBtn')?.addEventListener('click', () => {
        const inputs = getInputs();
        saveDeal(inputs.dealName || 'Unnamed Deal', inputs);
        const btn = document.getElementById('saveDealBtn');
        const orig = btn.textContent;
        btn.textContent = 'Saved ✓';
        btn.classList.add('btn-success');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('btn-success'); }, 2000);
    });

    // Load sample
    document.getElementById('loadSampleBtn')?.addEventListener('click', () => {
        setInputs(SAMPLE_DEAL);
        recalculate();
    });

    // Export / import
    document.getElementById('exportBtn')?.addEventListener('click', exportDealsJSON);
    document.getElementById('importInput')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const count = importDealsJSON(ev.target.result);
            if (count < 0) alert('Invalid JSON file.');
            else { alert('Imported ' + count + ' deal(s).'); renderSavedDeals(); }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Target calculator
    document.getElementById('runTargetCalc')?.addEventListener('click', runTargetCalc);

    // Comparison
    document.getElementById('addCurrentComp')?.addEventListener('click', loadCurrentIntoComparison);
    [0, 1, 2].forEach(i => {
        document.getElementById('compSlot' + i + 'Remove')?.addEventListener('click', () => removeFromComparison(i));
    });

    // Test mode via ?test=true
    if (new URLSearchParams(window.location.search).get('test') === 'true') {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
        const testBtn = document.querySelector('[data-tab="tests"]');
        const testSec = document.getElementById('tab-tests');
        if (testBtn) { testBtn.style.display = ''; testBtn.classList.add('active'); }
        if (testSec) testSec.classList.add('active');
        setTimeout(() => renderTestResults('testContainer'), 150);
    } else {
        const testBtn = document.querySelector('[data-tab="tests"]');
        if (testBtn) testBtn.style.display = 'none';
    }

    // ── Pre-fill from viewpoint.ca "Add to Analyzer" button ──────────────────
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('_source') === 'viewpoint') {
        const vp = {};
        const str  = k => urlParams.get(k) || undefined;
        const num  = k => { const v = urlParams.get(k); return v ? parseFloat(v) : undefined; };
        vp.dealName      = str('dealName');
        vp.purchasePrice = num('purchasePrice');
        vp.arv           = num('arv');
        vp.annualTaxes   = num('annualTaxes');
        // Remove query string from URL without reload
        const clean = window.location.pathname;
        window.history.replaceState({}, '', clean);
        // Show a brief notice banner
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#10b981;color:#fff;text-align:center;padding:8px;font-weight:600;z-index:9999;font-size:14px';
        const beds  = urlParams.get('_beds');
        const baths = urlParams.get('_baths');
        const sqft  = urlParams.get('_sqft');
        const details = [beds && beds + ' bed', baths && baths + ' bath', sqft && sqft + ' sqft'].filter(Boolean).join(' · ');
        banner.textContent = '📊 Imported from Viewpoint.ca' + (details ? ' — ' + details : '') + ' — Fill in rent & expenses to complete analysis';
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 6000);
        setInputs(vp);
    }

    updateModeVisibility();
    initSettingsTab();
    initBudgetCalc();
    recalculate();
}

document.addEventListener('DOMContentLoaded', init);

// ═══════════════════════════════════════════════════════════════════
// LENDER TEMPLATES — Settings tab + defaults bar logic
// ═══════════════════════════════════════════════════════════════════

/** Populate the Settings tab form from a defaults object */
function renderSettingsForm(d) {
    d = d || getDefaults();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v == null ? '' : v); };
    set('s_downPaymentPct',    d.downPaymentPct);
    set('s_interestRate',      d.interestRate);
    set('s_loanTermYears',     d.loanTermYears);
    set('s_originationFee',    d.originationFee);
    set('s_occupancyRate',     d.occupancyRate);
    set('s_vacancyPct',        d.vacancyPct);
    set('s_propMgmtPct',       d.propMgmtPct);
    set('s_maintenancePct',    d.maintenancePct);
    set('s_capexPct',          d.capexPct);
    set('s_advertisingAnnual', d.advertisingAnnual);
    set('s_annualInsurance',   d.annualInsurance);
}

/** Read defaults form into an object */
function readSettingsForm() {
    const num = id => { const v = document.getElementById(id)?.value; return (v === '' || v == null) ? null : parseFloat(v); };
    return {
        downPaymentPct:    num('s_downPaymentPct'),
        interestRate:      num('s_interestRate'),
        loanTermYears:     num('s_loanTermYears'),
        originationFee:    num('s_originationFee'),
        occupancyRate:     num('s_occupancyRate'),
        vacancyPct:        num('s_vacancyPct'),
        propMgmtPct:       num('s_propMgmtPct'),
        maintenancePct:    num('s_maintenancePct'),
        capexPct:          num('s_capexPct'),
        advertisingAnnual: num('s_advertisingAnnual'),
        annualInsurance:   num('s_annualInsurance'),
    };
}

/** Apply a named builtin template to the settings form */
function applyBuiltinTemplate(key) {
    const t = BUILTIN_TEMPLATES[key];
    if (!t) return;
    renderSettingsForm(t);
}

/** Apply current defaults (or a given object) to the analysis form */
function applyDefaultsToForm(d) {
    d = d || getDefaults();
    const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value) || 0;
    const insurance = (d.annualInsurance != null) ? d.annualInsurance : (purchasePrice ? Math.round(purchasePrice * 0.005) : 0);
    setInputs({
        downPaymentPct:    d.downPaymentPct,
        interestRate:      d.interestRate,
        loanTermYears:     d.loanTermYears,
        originationFee:    d.originationFee,
        occupancyRate:     d.occupancyRate,
        vacancyPct:        d.vacancyPct,
        propMgmtMode:      'pct',
        propMgmtPct:       d.propMgmtPct,
        maintenanceMode:   'pct',
        maintenancePct:    d.maintenancePct,
        capexMode:         'pct',
        capexPct:          d.capexPct,
        advertisingAnnual: d.advertisingAnnual,
        annualInsurance:   insurance,
    });
    recalculate();
}

/** Wire up all Settings tab + defaults bar events (called from init) */
function initSettingsTab() {
    // Render settings form on first load
    renderSettingsForm();

    // Preset buttons
    document.getElementById('presetConservative')?.addEventListener('click', () => applyBuiltinTemplate('conservative'));
    document.getElementById('presetStandard')    ?.addEventListener('click', () => applyBuiltinTemplate('standard'));
    document.getElementById('presetAggressive')  ?.addEventListener('click', () => applyBuiltinTemplate('aggressive'));

    // Save / reset
    document.getElementById('saveDefaultsBtn')?.addEventListener('click', () => {
        saveDefaults(readSettingsForm());
        const msg = document.getElementById('settingsSavedMsg');
        if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 2500); }
    });
    document.getElementById('resetDefaultsBtn')?.addEventListener('click', () => {
        applyBuiltinTemplate('standard');
        saveDefaults(BUILTIN_TEMPLATES.standard);
        const msg = document.getElementById('settingsSavedMsg');
        if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 2500); }
    });

    // Defaults bar — checkbox applies from the selected dropdown preset
    const chk      = document.getElementById('useDefaultsChk');
    const tmplSel  = document.getElementById('defaultsTemplateSelect');

    chk?.addEventListener('change', function () {
        if (!this.checked) return;
        const key = tmplSel?.value || 'custom';
        if (key === 'custom') {
            applyDefaultsToForm(getDefaults());
        } else {
            applyDefaultsToForm(BUILTIN_TEMPLATES[key]);
        }
        // Uncheck after applying so it acts as a one-shot button
        setTimeout(() => { this.checked = false; }, 400);
    });

    // Re-render settings form when Settings tab is opened
    document.querySelectorAll('.tab-btn[data-tab="settings"]').forEach(btn => {
        btn.addEventListener('click', () => renderSettingsForm());
    });
}
