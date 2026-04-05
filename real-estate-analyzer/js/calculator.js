'use strict';

// ─── Core Financial Functions ────────────────────────────────────────────────

function calcMonthlyPayment(principal, annualRate, termYears) {
    if (principal <= 0) return 0;
    if (annualRate === 0) return principal / (termYears * 12);
    const r = annualRate / 12;
    const n = termYears * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcNOI(annualGrossIncome, annualOperatingExpenses) {
    return annualGrossIncome - annualOperatingExpenses;
}

function calcCapRate(noi, purchasePrice) {
    if (!purchasePrice) return 0;
    return (noi / purchasePrice) * 100;
}

function calcCashOnCash(annualCashFlow, totalCashInvested) {
    if (!totalCashInvested) return 0;
    return (annualCashFlow / totalCashInvested) * 100;
}

function calcDSCR(noi, annualDebtService) {
    if (!annualDebtService) return 999;
    return noi / annualDebtService;
}

function calcBreakEvenRatio(annualOperatingExpenses, annualDebtService, annualGrossIncome) {
    if (!annualGrossIncome) return 0;
    return ((annualOperatingExpenses + annualDebtService) / annualGrossIncome) * 100;
}

function calcGRM(purchasePrice, annualGrossRent) {
    if (!annualGrossRent) return 0;
    return purchasePrice / annualGrossRent;
}

function calcOnePercentRatio(monthlyRent, purchasePrice) {
    if (!purchasePrice) return 0;
    return (monthlyRent / purchasePrice) * 100;
}

function calcLTV(loanAmount, purchasePrice) {
    if (!purchasePrice) return 0;
    return (loanAmount / purchasePrice) * 100;
}

// ─── Build Operating Expenses from Inputs ────────────────────────────────────

function buildExpenses(inputs, grossIncome, baseRent) {
    const {
        propMgmtMode = 'pct', propMgmtPct = 0, propMgmtFlat = 0,
        annualTaxes = 0, annualInsurance = 0,
        maintenanceMode = 'pct', maintenancePct = 0, maintenanceFlat = 0,
        monthlyUtilities = 0, monthlyHOA = 0,
        vacancyPct = 5,
        capexMode = 'pct', capexPct = 0, capexFlat = 0,
        advertisingAnnual = 0
    } = inputs;

    const propMgmt = propMgmtMode === 'pct'
        ? grossIncome * ((propMgmtPct || 0) / 100)
        : (propMgmtFlat || 0) * 12;

    const maintenance = maintenanceMode === 'pct'
        ? grossIncome * ((maintenancePct || 0) / 100)
        : (maintenanceFlat || 0) * 12;

    const vacancy = baseRent * ((vacancyPct || 0) / 100);

    const capex = capexMode === 'pct'
        ? grossIncome * ((capexPct || 0) / 100)
        : (capexFlat || 0);

    return {
        propMgmt,
        taxes: annualTaxes,
        insurance: annualInsurance,
        maintenance,
        utilities: monthlyUtilities * 12,
        hoa: monthlyHOA * 12,
        vacancy,
        capex,
        advertising: advertisingAnnual,
        total() {
            return this.propMgmt + this.taxes + this.insurance + this.maintenance +
                   this.utilities + this.hoa + this.vacancy + this.capex + this.advertising;
        }
    };
}

// ─── Full Deal Analysis ───────────────────────────────────────────────────────

function analyzeDeal(inputs) {
    const {
        purchasePrice = 0,
        rehabCosts = 0,
        closingCosts = 0,
        downPaymentPct = 20,
        interestRate = 7,
        loanTermYears = 30,
        monthlyGrossRent = 0,
        otherMonthlyIncome = 0,
        occupancyRate = 95,
        originationFee = 1,
    } = inputs;

    // Financing
    const downPayment = purchasePrice * (downPaymentPct / 100);
    const loanAmount = purchasePrice - downPayment;
    const rate = interestRate / 100;
    const monthlyPayment = calcMonthlyPayment(loanAmount, rate, loanTermYears);
    const annualDebtService = monthlyPayment * 12;
    const originationCost = loanAmount * ((originationFee || 0) / 100);
    const totalCashInvested = downPayment + (rehabCosts || 0) + (closingCosts || 0) + originationCost;

    // Income
    const annualBaseRent = monthlyGrossRent * 12;
    const annualOtherIncome = (otherMonthlyIncome || 0) * 12;
    const annualGrossIncome = (annualBaseRent + annualOtherIncome) * ((occupancyRate || 95) / 100);

    // Expenses
    const expenses = buildExpenses(inputs, annualGrossIncome, annualBaseRent);
    const annualOperatingExpenses = expenses.total();

    // Core Metrics
    const noi = calcNOI(annualGrossIncome, annualOperatingExpenses);
    const annualCashFlow = noi - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;

    return {
        downPayment,
        loanAmount,
        monthlyPayment,
        annualDebtService,
        originationCost,
        totalCashInvested,
        annualBaseRent,
        annualOtherIncome,
        annualGrossIncome,
        expenses,
        annualOperatingExpenses,
        noi,
        annualCashFlow,
        monthlyCashFlow,
        capRate:         calcCapRate(noi, purchasePrice),
        coc:             calcCashOnCash(annualCashFlow, totalCashInvested),
        dscr:            calcDSCR(noi, annualDebtService),
        ber:             calcBreakEvenRatio(annualOperatingExpenses, annualDebtService, annualGrossIncome),
        grm:             calcGRM(purchasePrice, annualBaseRent),
        onePercentRatio: calcOnePercentRatio(monthlyGrossRent, purchasePrice),
        ltv:             calcLTV(loanAmount, purchasePrice),
        equity:          purchasePrice - loanAmount,
        expenseRatio:    annualGrossIncome ? (annualOperatingExpenses / annualGrossIncome) * 100 : 0,
    };
}

// ─── Year-over-Year Projections ───────────────────────────────────────────────

function generateProjections(inputs, years) {
    const {
        purchasePrice = 0,
        downPaymentPct = 20,
        interestRate = 7,
        loanTermYears = 30,
        monthlyGrossRent = 0,
        otherMonthlyIncome = 0,
        occupancyRate = 95,
        rehabCosts = 0,
        closingCosts = 0,
        originationFee = 1,
        rentGrowthPct = 3,
        expenseGrowthPct = 3,
        appreciationPct = 3,
    } = inputs;

    const downPayment = purchasePrice * (downPaymentPct / 100);
    const loanAmount = purchasePrice - downPayment;
    const rate = interestRate / 100;
    const monthlyRate = rate / 12;
    const nPeriods = loanTermYears * 12;
    const monthlyPayment = calcMonthlyPayment(loanAmount, rate, loanTermYears);
    const annualDebtService = monthlyPayment * 12;
    const originationCost = loanAmount * ((originationFee || 0) / 100);
    const totalCashInvested = downPayment + (rehabCosts || 0) + (closingCosts || 0) + originationCost;

    const rows = [];
    let balance = loanAmount;
    let propValue = purchasePrice;
    let scaledRent = monthlyGrossRent * 12;
    let scaledOther = (otherMonthlyIncome || 0) * 12;
    let scaledTaxes = inputs.annualTaxes || 0;
    let scaledInsurance = inputs.annualInsurance || 0;
    let scaledUtils = (inputs.monthlyUtilities || 0) * 12;
    let scaledHOA = (inputs.monthlyHOA || 0) * 12;
    let scaledAdvertising = inputs.advertisingAnnual || 0;
    let scaledCapexFlat = inputs.capexFlat || 0;
    let scaledMaintFlat = inputs.maintenanceFlat || 0;
    let scaledPropMgmtFlat = inputs.propMgmtFlat || 0;

    for (let yr = 1; yr <= years; yr++) {
        if (yr > 1) {
            const rg = 1 + rentGrowthPct / 100;
            const eg = 1 + expenseGrowthPct / 100;
            scaledRent *= rg;
            scaledOther *= rg;
            scaledTaxes *= eg;
            scaledInsurance *= eg;
            scaledUtils *= eg;
            scaledHOA *= eg;
            scaledAdvertising *= eg;
            scaledCapexFlat *= eg;
            scaledMaintFlat *= eg;
            scaledPropMgmtFlat *= eg;
            propValue *= (1 + appreciationPct / 100);
        }

        const grossIncome = (scaledRent + scaledOther) * ((occupancyRate || 95) / 100);
        const yearInputs = {
            ...inputs,
            annualTaxes: scaledTaxes,
            annualInsurance: scaledInsurance,
            monthlyUtilities: scaledUtils / 12,
            monthlyHOA: scaledHOA / 12,
            advertisingAnnual: scaledAdvertising,
            capexFlat: scaledCapexFlat,
            maintenanceFlat: scaledMaintFlat,
            propMgmtFlat: scaledPropMgmtFlat,
        };
        const expenses = buildExpenses(yearInputs, grossIncome, scaledRent);
        const opExpenses = expenses.total();
        const noi = grossIncome - opExpenses;
        const cashFlow = noi - annualDebtService;
        const coc = totalCashInvested > 0 ? (cashFlow / totalCashInvested) * 100 : 0;

        // Amortization for this year
        let tempBal = balance;
        let yearPrincipal = 0;
        const monthsDone = (yr - 1) * 12;
        if (monthsDone < nPeriods) {
            for (let m = 0; m < 12; m++) {
                if (tempBal <= 0) break;
                const intPmt = tempBal * monthlyRate;
                const princPmt = Math.min(monthlyPayment - intPmt, tempBal);
                yearPrincipal += princPmt;
                tempBal = Math.max(0, tempBal - princPmt);
            }
        }
        balance = Math.max(0, tempBal);

        rows.push({
            year: yr,
            grossIncome: Math.round(grossIncome),
            opExpenses: Math.round(opExpenses),
            noi: Math.round(noi),
            debtService: Math.round(annualDebtService),
            cashFlow: Math.round(cashFlow),
            propertyValue: Math.round(propValue),
            loanBalance: Math.round(balance),
            equity: Math.round(propValue - balance),
            principalPaid: Math.round(yearPrincipal),
            coc: parseFloat(coc.toFixed(2)),
            capRate: parseFloat(calcCapRate(noi, propValue).toFixed(2)),
        });
    }

    return { rows, totalCashInvested };
}

// ─── Reverse Solver ───────────────────────────────────────────────────────────

function solveForTarget(variable, targetCoc, baseInputs) {
    const ranges = {
        purchasePrice:    [10000,  100000000],
        monthlyGrossRent: [50,     500000],
        interestRate:     [0.01,   30],
        downPaymentPct:   [5,      95],
    };
    if (!ranges[variable]) return null;
    let [lo, hi] = ranges[variable];

    function getCoc(val) {
        return analyzeDeal({ ...baseInputs, [variable]: val }).coc;
    }

    const cocLo = getCoc(lo);
    const cocHi = getCoc(hi);
    const increasing = cocHi > cocLo;

    // Check solvability — does targetCoc lie between cocLo and cocHi ?
    if (increasing && (targetCoc < cocLo || targetCoc > cocHi)) return null;
    if (!increasing && (targetCoc > cocLo || targetCoc < cocHi)) return null;

    for (let i = 0; i < 300; i++) {
        const mid = (lo + hi) / 2;
        const cocMid = getCoc(mid);
        if (Math.abs(cocMid - targetCoc) < 0.0005) return mid;
        if (increasing) {
            if (cocMid < targetCoc) lo = mid; else hi = mid;
        } else {
            if (cocMid > targetCoc) lo = mid; else hi = mid;
        }
    }
    return (lo + hi) / 2;
}

// ─── Rating System ────────────────────────────────────────────────────────────

const RATINGS = {
    capRate: [
        { max: 3,        label: 'Poor',      cls: 'poor' },
        { max: 5,        label: 'Fair',      cls: 'fair' },
        { max: 7,        label: 'Good',      cls: 'good' },
        { max: Infinity, label: 'Excellent', cls: 'excellent' },
    ],
    coc: [
        { max: 5,        label: 'Poor',      cls: 'poor' },
        { max: 10,       label: 'Fair',      cls: 'fair' },
        { max: 15,       label: 'Good',      cls: 'good' },
        { max: Infinity, label: 'Excellent', cls: 'excellent' },
    ],
    dscr: [
        { max: 1.0,      label: 'Negative Cash Flow', cls: 'poor' },
        { max: 1.2,      label: 'Below Lender Min',   cls: 'poor' },
        { max: 1.5,      label: 'Good',               cls: 'good' },
        { max: Infinity, label: 'Excellent',           cls: 'excellent' },
    ],
    ber: [
        { max: 60,       label: 'Excellent', cls: 'excellent' },
        { max: 70,       label: 'Good',      cls: 'good' },
        { max: 80,       label: 'Fair',      cls: 'fair' },
        { max: Infinity, label: 'Poor',      cls: 'poor' },
    ],
    ltv: [
        { max: 75,       label: 'Excellent', cls: 'excellent' },
        { max: 80,       label: 'Good',      cls: 'good' },
        { max: 90,       label: 'Fair',      cls: 'fair' },
        { max: Infinity, label: 'Poor',      cls: 'poor' },
    ],
};

function getRating(metricKey, value) {
    const scale = RATINGS[metricKey];
    if (!scale) return { label: '–', cls: 'neutral' };
    for (const r of scale) {
        if (value <= r.max) return r;
    }
    return { label: '–', cls: 'neutral' };
}

function calcDealScore(result) {
    let score = 0;
    const { coc = 0, capRate = 0, dscr = 0, ber = 100, onePercentRatio = 0 } = result;
    // CoC (40 pts)
    if (coc >= 15) score += 40;
    else if (coc >= 10) score += 28;
    else if (coc >= 5) score += 15;
    // DSCR (25 pts)
    if (dscr >= 1.5) score += 25;
    else if (dscr >= 1.25) score += 18;
    else if (dscr >= 1.0) score += 10;
    // Cap Rate (20 pts)
    if (capRate >= 8) score += 20;
    else if (capRate >= 5) score += 14;
    else if (capRate >= 3) score += 7;
    // BER (10 pts)
    if (ber < 60) score += 10;
    else if (ber < 70) score += 7;
    else if (ber < 80) score += 3;
    // 1% Rule (5 pts)
    if (onePercentRatio >= 1) score += 5;
    return Math.min(100, Math.round(score));
}
