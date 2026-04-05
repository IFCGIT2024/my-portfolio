'use strict';

const COMP_METRICS = [
    { key: 'monthlyCashFlow',    label: 'Monthly Cash Flow',    fmt: 'dollar',  higherBetter: true,  ratingKey: null },
    { key: 'annualCashFlow',     label: 'Annual Cash Flow',     fmt: 'dollar',  higherBetter: true,  ratingKey: null },
    { key: 'coc',                label: 'Cash-on-Cash Return',  fmt: 'pct2',    higherBetter: true,  ratingKey: 'coc' },
    { key: 'capRate',            label: 'Cap Rate',             fmt: 'pct2',    higherBetter: true,  ratingKey: 'capRate' },
    { key: 'dscr',               label: 'DSCR',                 fmt: 'num2',    higherBetter: true,  ratingKey: 'dscr' },
    { key: 'ber',                label: 'Break-Even Ratio',     fmt: 'pct2',    higherBetter: false, ratingKey: 'ber' },
    { key: 'noi',                label: 'NOI (Annual)',         fmt: 'dollar',  higherBetter: true,  ratingKey: null },
    { key: 'ltv',                label: 'LTV',                  fmt: 'pct2',    higherBetter: false, ratingKey: 'ltv' },
    { key: 'grm',                label: 'GRM',                  fmt: 'num2',    higherBetter: false, ratingKey: null },
    { key: 'onePercentRatio',    label: '1% Rule Ratio',        fmt: 'pct2',    higherBetter: true,  ratingKey: null },
    { key: 'totalCashInvested',  label: 'Total Cash Invested',  fmt: 'dollar',  higherBetter: false, ratingKey: null },
    { key: 'equity',             label: 'Starting Equity',      fmt: 'dollar',  higherBetter: true,  ratingKey: null },
    { key: 'monthlyPayment',     label: 'Monthly P&I Payment',  fmt: 'dollar',  higherBetter: false, ratingKey: null },
];

function fmtComp(val, fmt) {
    if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) return '–';
    switch (fmt) {
        case 'dollar': return '$' + Math.round(val).toLocaleString();
        case 'pct2':   return val.toFixed(2) + '%';
        case 'num2':   return val.toFixed(2);
        default:       return String(val);
    }
}

function getBestValue(key, higherBetter, deals) {
    const vals = deals.map(d => d.result[key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) return null;
    return higherBetter ? Math.max(...vals) : Math.min(...vals);
}

function renderComparison(compDeals) {
    const container = document.getElementById('comparisonGrid');
    if (!container) return;
    if (!compDeals.length) {
        container.innerHTML = '<p class="no-data">Load deals into the slots above to compare.</p>';
        return;
    }

    const cols = compDeals.length;
    const colAttr = `data-cols="${cols}"`;

    let html = '<div class="comp-table">';
    // Header
    html += `<div class="comp-row comp-header" ${colAttr}><div class="comp-cell comp-label">Metric</div>`;
    for (const d of compDeals) {
        html += `<div class="comp-cell comp-deal-head">${d.name}</div>`;
    }
    html += '</div>';

    // Score row
    html += `<div class="comp-row comp-score-row" ${colAttr}><div class="comp-cell comp-label">Deal Score</div>`;
    for (const d of compDeals) {
        const s = calcDealScore(d.result);
        const cls = s >= 70 ? 'excellent' : s >= 50 ? 'good' : s >= 30 ? 'fair' : 'poor';
        html += `<div class="comp-cell metric-${cls}"><strong>${s}/100</strong></div>`;
    }
    html += '</div>';

    // Target passthrough row
    html += `<div class="comp-row" ${colAttr}><div class="comp-cell comp-label">15% CoC Target</div>`;
    for (const d of compDeals) {
        const met = d.result.coc >= 15;
        html += `<div class="comp-cell ${met ? 'metric-excellent' : 'metric-poor'}">${met ? '✓ Met' : '✗ Not Met'}</div>`;
    }
    html += '</div>';

    // Metric rows
    for (const m of COMP_METRICS) {
        const best = compDeals.length > 1 ? getBestValue(m.key, m.higherBetter, compDeals) : null;
        html += `<div class="comp-row" ${colAttr}><div class="comp-cell comp-label">${m.label}</div>`;
        for (const d of compDeals) {
            const val = d.result[m.key];
            const isBest = best !== null && typeof val === 'number' && !isNaN(val) && val === best;
            const rating = m.ratingKey ? getRating(m.ratingKey, val) : null;
            const cls = rating ? `metric-${rating.cls}` : '';
            html += `<div class="comp-cell ${cls} ${isBest ? 'is-best' : ''}">
                ${fmtComp(val, m.fmt)}
                ${isBest ? '<span class="best-badge">★</span>' : ''}
            </div>`;
        }
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Radar if 2+ deals
    if (compDeals.length >= 2) {
        renderRadarChart('chartRadar', compDeals);
        document.getElementById('radarWrap')?.classList.remove('hidden');
    } else {
        document.getElementById('radarWrap')?.classList.add('hidden');
    }
}
