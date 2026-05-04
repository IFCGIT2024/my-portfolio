'use strict';

// Chart instances registry
const _charts = {};

// Apply global Chart.js defaults for dark theme
function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
    Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
}

function destroyChart(key) {
    if (_charts[key]) {
        _charts[key].destroy();
        delete _charts[key];
    }
}

function makeChart(key, ctx, config) {
    destroyChart(key);
    _charts[key] = new Chart(ctx, config);
    return _charts[key];
}

const DOLLAR_TICK = v => {
    const abs = Math.abs(v);
    if (abs >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
    if (abs >= 1000) return '$' + (v / 1000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
};
const PCT_TICK = v => v + '%';

const gridColor = 'rgba(148, 163, 184, 0.08)';

// ─── Projection Charts ────────────────────────────────────────────────────────

function renderCashFlowChart(canvasId, rows) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = rows.map(r => 'Yr ' + r.year);
    makeChart('cashflow', ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cash Flow',
                    data: rows.map(r => r.cashFlow),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    fill: true, tension: 0.35, pointRadius: 3,
                },
                {
                    label: 'NOI',
                    data: rows.map(r => r.noi),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    fill: true, tension: 0.35, pointRadius: 3,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Cash Flow & NOI Over Time', color: '#f1f5f9', font: { size: 13 } },
                tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${c.raw.toLocaleString()}` } }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: DOLLAR_TICK } },
                x: { grid: { color: gridColor } }
            }
        }
    });
}

function renderIncomeExpenseChart(canvasId, rows) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = rows.map(r => 'Yr ' + r.year);
    makeChart('incexp', ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Gross Income',  data: rows.map(r => r.grossIncome), backgroundColor: 'rgba(16, 185, 129, 0.75)' },
                { label: 'Op. Expenses',  data: rows.map(r => r.opExpenses),  backgroundColor: 'rgba(239, 68, 68, 0.75)' },
                { label: 'Debt Service',  data: rows.map(r => r.debtService), backgroundColor: 'rgba(245, 158, 11, 0.75)' },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Income vs Expenses Per Year', color: '#f1f5f9', font: { size: 13 } },
                tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${c.raw.toLocaleString()}` } }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: DOLLAR_TICK } },
                x: { grid: { color: gridColor } }
            }
        }
    });
}

function renderEquityChart(canvasId, rows) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = rows.map(r => 'Yr ' + r.year);
    makeChart('equity', ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Equity',
                    data: rows.map(r => r.equity),
                    borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.18)',
                    fill: true, tension: 0.35, pointRadius: 3,
                },
                {
                    label: 'Property Value',
                    data: rows.map(r => r.propertyValue),
                    borderColor: '#f59e0b', backgroundColor: 'transparent',
                    tension: 0.35, borderDash: [5, 4], pointRadius: 3,
                },
                {
                    label: 'Loan Balance',
                    data: rows.map(r => r.loanBalance),
                    borderColor: '#ef4444', backgroundColor: 'transparent',
                    tension: 0.35, borderDash: [3, 3], pointRadius: 3,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Equity Buildup', color: '#f1f5f9', font: { size: 13 } },
                tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${c.raw.toLocaleString()}` } }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: DOLLAR_TICK } },
                x: { grid: { color: gridColor } }
            }
        }
    });
}

function renderCoCChart(canvasId, rows) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = rows.map(r => 'Yr ' + r.year);
    makeChart('coc', ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cash-on-Cash %',
                    data: rows.map(r => r.coc),
                    borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)',
                    fill: true, tension: 0.35, pointRadius: 3,
                },
                {
                    label: 'Cap Rate %',
                    data: rows.map(r => r.capRate),
                    borderColor: '#f59e0b', backgroundColor: 'transparent',
                    tension: 0.35, borderDash: [4, 4], pointRadius: 3,
                },
                {
                    label: '15% Target',
                    data: rows.map(() => 15),
                    borderColor: 'rgba(239,68,68,0.7)', backgroundColor: 'transparent',
                    borderDash: [8, 5], pointRadius: 0, borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Returns Over Time', color: '#f1f5f9', font: { size: 13 } },
                tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: PCT_TICK } },
                x: { grid: { color: gridColor } }
            }
        }
    });
}

function renderAllProjectionCharts(rows) {
    applyChartDefaults();
    renderCashFlowChart('chartCashFlow', rows);
    renderIncomeExpenseChart('chartIncExp', rows);
    renderEquityChart('chartEquity', rows);
    renderCoCChart('chartCoC', rows);
}

// ─── Expense Breakdown Donut ──────────────────────────────────────────────────

function renderExpenseBreakdown(canvasId, expenses) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316'];
    const data = [
        { label: 'Prop. Mgmt',  val: expenses.propMgmt },
        { label: 'Taxes',       val: expenses.taxes },
        { label: 'Insurance',   val: expenses.insurance },
        { label: 'Maintenance', val: expenses.maintenance },
        { label: 'Utilities',   val: expenses.utilities },
        { label: 'HOA',         val: expenses.hoa },
        { label: 'Vacancy',     val: expenses.vacancy },
        { label: 'CapEx',       val: expenses.capex },
        { label: 'Advertising', val: expenses.advertising },
    ].filter(d => d.val > 0);

    if (!data.length) { destroyChart('expBreakdown'); ctx.getContext('2d').clearRect(0,0,ctx.width,ctx.height); return; }

    applyChartDefaults();
    makeChart('expBreakdown', ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => Math.round(d.val)),
                backgroundColor: COLORS.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#141720',
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 10 } },
                title: { display: true, text: 'Annual Expense Breakdown', color: '#f1f5f9', font: { size: 13 } },
                tooltip: { callbacks: { label: c => ` ${c.label}: $${c.raw.toLocaleString()}` } }
            }
        }
    });
}

// ─── Radar Chart (Comparison) ─────────────────────────────────────────────────

function renderRadarChart(canvasId, deals) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !deals.length) return;
    const COLORS = ['#10b981', '#6366f1', '#f59e0b'];
    const labels = ['Cap Rate (%)', 'Cash-on-Cash (%)', 'DSCR (×10)', 'NOI Margin (%)', '1% Rule (×30)'];

    const datasets = deals.map((d, i) => {
        const r = d.result;
        return {
            label: d.name,
            data: [
                Math.min(Math.max(r.capRate || 0, 0), 15),
                Math.min(Math.max(r.coc || 0, 0), 30),
                Math.min(Math.max((r.dscr || 0) * 10, 0), 30),
                Math.min(Math.max(r.annualGrossIncome ? ((r.noi / r.annualGrossIncome) * 100) : 0, 0), 30),
                Math.min(Math.max((r.onePercentRatio || 0) * 30, 0), 30),
            ],
            borderColor: COLORS[i],
            backgroundColor: COLORS[i] + '22',
            fill: true, pointRadius: 4,
        };
    });

    applyChartDefaults();
    makeChart('radar', ctx, {
        type: 'radar',
        data: { labels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                r: {
                    grid: { color: 'rgba(148,163,184,0.15)' },
                    angleLines: { color: 'rgba(148,163,184,0.15)' },
                    pointLabels: { color: '#94a3b8', font: { size: 11 } },
                    ticks: { display: false, backdropColor: 'transparent' },
                    min: 0, max: 30,
                }
            },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}
