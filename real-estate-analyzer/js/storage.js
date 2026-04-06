'use strict';

const STORAGE_KEY = 'rei_analyzer_deals';

function getAllDeals() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function _persistDeals(deals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

function generateId() {
    return 'deal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function saveDeal(name, inputs) {
    const deals = getAllDeals();
    // Update existing deal with same name, or create new
    const existingId = Object.keys(deals).find(id => deals[id].name === name);
    const id = existingId || generateId();
    deals[id] = {
        id,
        name: name.trim() || 'Unnamed Deal',
        inputs,
        savedAt: new Date().toISOString(),
    };
    _persistDeals(deals);
    return id;
}

function getDeal(id) {
    const deals = getAllDeals();
    return deals[id] || null;
}

function deleteDeal(id) {
    const deals = getAllDeals();
    delete deals[id];
    _persistDeals(deals);
}

function duplicateDeal(id) {
    const deal = getDeal(id);
    if (!deal) return null;
    return saveDeal(deal.name + ' (Copy)', { ...deal.inputs });
}

function exportDealsJSON() {
    const data = JSON.stringify(getAllDeals(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rei_deals_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importDealsJSON(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        if (typeof imported !== 'object' || Array.isArray(imported)) return -1;
        const current = getAllDeals();
        const merged = { ...current, ...imported };
        _persistDeals(merged);
        return Object.keys(imported).length;
    } catch {
        return -1;
    }
}

// ── Lender / Defaults Templates ───────────────────────────────────────────────
const DEFAULTS_KEY = 'rei_analyzer_defaults';

const BUILTIN_TEMPLATES = {
    conservative: {
        label: 'Conservative (Lender-Safe)',
        downPaymentPct:   25,
        interestRate:     7.5,
        loanTermYears:    25,
        originationFee:   1,
        occupancyRate:    92,
        vacancyPct:       8,
        propMgmtMode:    'pct',
        propMgmtPct:      10,
        maintenanceMode: 'pct',
        maintenancePct:   8,
        capexMode:       'pct',
        capexPct:         8,
        annualInsurance:  null,   // auto: 0.5% of purchase price
        advertisingAnnual: 300,
    },
    standard: {
        label: 'Standard (CMHC / typical)',
        downPaymentPct:   20,
        interestRate:     6.5,
        loanTermYears:    30,
        originationFee:   1,
        occupancyRate:    95,
        vacancyPct:       5,
        propMgmtMode:    'pct',
        propMgmtPct:      8,
        maintenanceMode: 'pct',
        maintenancePct:   5,
        capexMode:       'pct',
        capexPct:         5,
        annualInsurance:  null,   // auto: 0.5% of purchase price
        advertisingAnnual: 200,
    },
    aggressive: {
        label: 'Aggressive (Best-case)',
        downPaymentPct:   20,
        interestRate:     5.5,
        loanTermYears:    30,
        originationFee:   0.5,
        occupancyRate:    97,
        vacancyPct:       3,
        propMgmtMode:    'pct',
        propMgmtPct:      6,
        maintenanceMode: 'pct',
        maintenancePct:   3,
        capexMode:       'pct',
        capexPct:         3,
        annualInsurance:  null,
        advertisingAnnual: 100,
    },
};

function getDefaults() {
    try {
        const saved = JSON.parse(localStorage.getItem(DEFAULTS_KEY) || 'null');
        return saved || { ...BUILTIN_TEMPLATES.standard };
    } catch {
        return { ...BUILTIN_TEMPLATES.standard };
    }
}

function saveDefaults(obj) {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(obj));
}

