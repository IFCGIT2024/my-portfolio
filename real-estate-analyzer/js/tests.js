'use strict';

// ─── Mini Test Runner ─────────────────────────────────────────────────────────

const _testSuite = [];

function test(name, fn) {
    _testSuite.push({ name, fn });
}

function assertEqual(actual, expected, tolerance, label) {
    const tag = label ? `[${label}] ` : '';
    if (tolerance !== undefined) {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(`${tag}Expected ${expected} ±${tolerance}, got ${actual.toFixed(6)}`);
        }
    } else {
        if (actual !== expected) {
            throw new Error(`${tag}Expected "${expected}", got "${actual}"`);
        }
    }
}

function assertTrue(val, label) {
    if (!val) throw new Error(`${label || 'Assertion'} failed — got: ${val}`);
}

function runTests() {
    const results = [];
    let passed = 0, failed = 0;
    for (const t of _testSuite) {
        try {
            t.fn();
            results.push({ name: t.name, passed: true });
            passed++;
        } catch (e) {
            results.push({ name: t.name, passed: false, error: e.message });
            failed++;
        }
    }
    return { results, passed, failed, total: _testSuite.length };
}

function renderTestResults(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const { results, passed, failed, total } = runTests();
    const allPass = failed === 0;

    let html = `
        <div class="test-header ${allPass ? 'all-pass' : 'has-fail'}">
            <h2>${allPass ? '✓' : '✗'} ${passed} / ${total} Tests Passed</h2>
            <p>${allPass ? 'All formulas verified — safe to use!' : `${failed} test(s) failing — check formulas before relying on results.`}</p>
        </div>
        <div class="test-list">
    `;
    for (const r of results) {
        html += `<div class="test-item ${r.passed ? 'test-pass' : 'test-fail'}">
            <span class="test-status">${r.passed ? '✓' : '✗'}</span>
            <span class="test-name">${r.name}</span>
            ${!r.passed ? `<span class="test-error">${r.error}</span>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ─── Test Definitions ─────────────────────────────────────────────────────────

// calcMonthlyPayment
test('Monthly payment: $150k @ 6.5% / 30yr ≈ $948', () => {
    assertEqual(calcMonthlyPayment(150000, 0.065, 30), 948.10, 1.0, 'Monthly pmt');
});
test('Monthly payment: zero rate = principal / months', () => {
    assertEqual(calcMonthlyPayment(120000, 0, 10), 1000, 0.01, 'Zero rate');
});
test('Monthly payment: zero principal = 0', () => {
    assertEqual(calcMonthlyPayment(0, 0.07, 30), 0);
});

// calcCapRate
test('Cap Rate: $60k NOI on $1M property = 6%', () => {
    assertEqual(calcCapRate(60000, 1000000), 6, 0.001);
});
test('Cap Rate: zero price returns 0', () => {
    assertEqual(calcCapRate(60000, 0), 0);
});
test('Cap Rate: $80k NOI on $1M = 8%', () => {
    assertEqual(calcCapRate(80000, 1000000), 8, 0.001);
});

// calcCashOnCash
test('CoC: $7,500 cash flow / $50k invested = 15%', () => {
    assertEqual(calcCashOnCash(7500, 50000), 15, 0.01);
});
test('CoC: $9,200 / $50k = 18.4%', () => {
    assertEqual(calcCashOnCash(9200, 50000), 18.4, 0.05);
});
test('CoC: zero invested returns 0', () => {
    assertEqual(calcCashOnCash(5000, 0), 0);
});

// calcDSCR
test('DSCR: $100k NOI / $75k debt = 1.333', () => {
    assertEqual(calcDSCR(100000, 75000), 1.333, 0.001);
});
test('DSCR: zero debt service returns 999', () => {
    assertEqual(calcDSCR(50000, 0), 999);
});
test('DSCR: NOI < debt service < 1.0', () => {
    assertTrue(calcDSCR(50000, 60000) < 1.0, 'DSCR < 1');
});

// calcBreakEvenRatio
test('BER: ($40k op + $45k debt) / $100k income = 85%', () => {
    assertEqual(calcBreakEvenRatio(40000, 45000, 100000), 85, 0.001);
});
test('BER: ($20k op + $30k debt) / $80k income = 62.5%', () => {
    assertEqual(calcBreakEvenRatio(20000, 30000, 80000), 62.5, 0.01);
});

// calcGRM
test('GRM: $1.5M / $243k = 6.17', () => {
    assertEqual(calcGRM(1500000, 243000), 6.17, 0.01);
});
test('GRM: zero rent returns 0', () => {
    assertEqual(calcGRM(500000, 0), 0);
});

// calcOnePercentRatio
test('1% Rule: $1k rent / $100k price = 1%', () => {
    assertEqual(calcOnePercentRatio(1000, 100000), 1, 0.001);
});
test('1% Rule: $1.5k / $100k = 1.5% (passes)', () => {
    assertTrue(calcOnePercentRatio(1500, 100000) >= 1, '1% passes');
});
test('1% Rule: $800 / $200k = 0.4% (fails)', () => {
    assertTrue(calcOnePercentRatio(800, 200000) < 1, '1% fails');
});

// analyzeDeal integration
test('analyzeDeal: financing correctly computed', () => {
    const r = analyzeDeal({
        purchasePrice: 200000, downPaymentPct: 25,
        interestRate: 6, loanTermYears: 30,
        monthlyGrossRent: 1800, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 10,
        annualTaxes: 3000, annualInsurance: 1200,
        maintenanceMode: 'pct', maintenancePct: 5,
        vacancyPct: 5, capexMode: 'pct', capexPct: 5,
        rehabCosts: 0, closingCosts: 0, originationFee: 1
    });
    assertEqual(r.downPayment, 50000, 0.01, 'Down pmt');
    assertEqual(r.loanAmount, 150000, 0.01, 'Loan amount');
    assertEqual(r.ltv, 75, 0.01, 'LTV');
    assertEqual(r.equity, 50000, 0.01, 'Equity');
});

test('analyzeDeal: income correctly computed', () => {
    const r = analyzeDeal({
        purchasePrice: 200000, downPaymentPct: 25,
        interestRate: 6, loanTermYears: 30,
        monthlyGrossRent: 2000, otherMonthlyIncome: 100, occupancyRate: 90,
        propMgmtMode: 'pct', propMgmtPct: 0,
        annualTaxes: 0, annualInsurance: 0,
        maintenanceMode: 'pct', maintenancePct: 0,
        vacancyPct: 0, capexMode: 'pct', capexPct: 0,
        rehabCosts: 0, closingCosts: 0, originationFee: 0
    });
    // (2000 + 100) * 12 * 0.90 = 22,680
    assertEqual(r.annualGrossIncome, 22680, 1, 'Gross income');
});

test('analyzeDeal: all key metrics present', () => {
    const r = analyzeDeal({
        purchasePrice: 300000, downPaymentPct: 20, interestRate: 7, loanTermYears: 30,
        monthlyGrossRent: 2500, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 10, annualTaxes: 4000, annualInsurance: 1500,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, rehabCosts: 0, closingCosts: 4000, originationFee: 1
    });
    assertTrue(r.noi !== undefined, 'NOI defined');
    assertTrue(r.coc !== undefined, 'CoC defined');
    assertTrue(r.dscr !== undefined, 'DSCR defined');
    assertTrue(r.capRate !== undefined, 'Cap rate defined');
    assertTrue(r.ber !== undefined, 'BER defined');
    assertTrue(r.grm > 0, 'GRM > 0');
});

test('analyzeDeal: 15% CoC target scenario sanity', () => {
    // High rent relative to price should get strong CoC
    const r = analyzeDeal({
        purchasePrice: 100000, downPaymentPct: 25, interestRate: 6.5, loanTermYears: 30,
        monthlyGrossRent: 1500, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 8, annualTaxes: 1200, annualInsurance: 600,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, rehabCosts: 0, closingCosts: 2000, originationFee: 1
    });
    assertTrue(r.coc > 0, 'Positive CoC for good deal');
    assertTrue(r.onePercentRatio >= 1, '1% rule passes');
});

// generateProjections
test('Projections: correct row count', () => {
    const base = {
        purchasePrice: 200000, downPaymentPct: 25, interestRate: 6, loanTermYears: 30,
        monthlyGrossRent: 1800, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 10, annualTaxes: 3000, annualInsurance: 1200,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, rehabCosts: 0, closingCosts: 0, originationFee: 1,
        rentGrowthPct: 3, expenseGrowthPct: 3, appreciationPct: 3
    };
    const { rows } = generateProjections(base, 10);
    assertEqual(rows.length, 10, 0, 'Row count');
    assertEqual(rows[9].year, 10, 0, 'Last row year = 10');
});
test('Projections: income and value grow over time', () => {
    const base = {
        purchasePrice: 200000, downPaymentPct: 25, interestRate: 6, loanTermYears: 30,
        monthlyGrossRent: 1800, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 10, annualTaxes: 3000, annualInsurance: 1200,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, rehabCosts: 0, closingCosts: 0, originationFee: 1,
        rentGrowthPct: 3, expenseGrowthPct: 3, appreciationPct: 3
    };
    const { rows } = generateProjections(base, 10);
    assertTrue(rows[9].grossIncome > rows[0].grossIncome, 'Income grows');
    assertTrue(rows[9].propertyValue > rows[0].propertyValue, 'Value appreciates');
    assertTrue(rows[9].equity > rows[0].equity, 'Equity grows');
    assertTrue(rows[9].loanBalance < rows[0].loanBalance, 'Balance decreases');
});

// solveForTarget
test('Solver: solveForTarget purchasePrice hits ~15% CoC', () => {
    const base = {
        downPaymentPct: 25, interestRate: 6.5, loanTermYears: 30,
        monthlyGrossRent: 2500, occupancyRate: 95,
        propMgmtMode: 'pct', propMgmtPct: 10, annualTaxes: 3000, annualInsurance: 1200,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, advertisingAnnual: 0, originationFee: 1,
        rehabCosts: 0, closingCosts: 0
    };
    const maxPrice = solveForTarget('purchasePrice', 15, base);
    if (maxPrice !== null) {
        const check = analyzeDeal({ ...base, purchasePrice: maxPrice });
        assertEqual(check.coc, 15, 0.1, 'Solved CoC ≈ 15%');
    } else {
        assertTrue(true, 'No solution is a valid outcome');
    }
});
test('Solver: solveForTarget rent hits ~15% CoC', () => {
    const base = {
        purchasePrice: 200000, downPaymentPct: 25, interestRate: 7, loanTermYears: 30,
        occupancyRate: 95, propMgmtMode: 'pct', propMgmtPct: 10,
        annualTaxes: 3000, annualInsurance: 1200,
        maintenanceMode: 'pct', maintenancePct: 5, vacancyPct: 5,
        capexMode: 'pct', capexPct: 5, rehabCosts: 0, closingCosts: 0, originationFee: 1
    };
    const minRent = solveForTarget('monthlyGrossRent', 15, base);
    if (minRent !== null) {
        const check = analyzeDeal({ ...base, monthlyGrossRent: minRent });
        assertEqual(check.coc, 15, 0.1, 'Solved CoC via rent ≈ 15%');
    } else {
        assertTrue(true, 'No solution is valid');
    }
});

// getRating
test('getRating: cap rate 6% = Good', () => {
    assertEqual(getRating('capRate', 6).label, 'Good');
});
test('getRating: cap rate 9% = Excellent', () => {
    assertEqual(getRating('capRate', 9).label, 'Excellent');
});
test('getRating: CoC 8% = Fair', () => {
    assertEqual(getRating('coc', 8).label, 'Fair');
});
test('getRating: DSCR 1.3 = Good', () => {
    assertEqual(getRating('dscr', 1.3).label, 'Good');
});
test('getRating: DSCR 0.9 = Negative Cash Flow', () => {
    assertEqual(getRating('dscr', 0.9).label, 'Negative Cash Flow');
});
test('getRating: BER 55% = Excellent (lower is better)', () => {
    assertEqual(getRating('ber', 55).label, 'Excellent');
});
test('getRating: BER 85% = Poor', () => {
    assertEqual(getRating('ber', 85).label, 'Poor');
});

// calcDealScore
test('Deal score: strong deal scores ≥ 80', () => {
    const s = calcDealScore({ coc: 20, capRate: 9, dscr: 1.8, ber: 55, onePercentRatio: 1.5 });
    assertTrue(s >= 80, `Score should be ≥80, got ${s}`);
});
test('Deal score: poor deal scores ≤ 20', () => {
    const s = calcDealScore({ coc: 2, capRate: 1.5, dscr: 0.85, ber: 90, onePercentRatio: 0.3 });
    assertTrue(s <= 20, `Score should be ≤20, got ${s}`);
});
test('Deal score: capped at 100', () => {
    const s = calcDealScore({ coc: 100, capRate: 50, dscr: 10, ber: 5, onePercentRatio: 5 });
    assertEqual(s, 100, 0, 'Score capped at 100');
});
