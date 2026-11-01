/* Static funding directory. Data comes from the versioned SQLite export. */
'use strict';
let allPrograms = [];
const element = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const statusOf = program => String(program.status || '').replace(/[^A-Z ]/g, '').trim();
const numberOrNull = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
// The source uses zero for unspecified amounts and non-cash support.
const maximumOf = value => { const number = numberOrNull(value); return number > 0 ? number : null; };
const currency = new Intl.NumberFormat('en-CA', {style:'currency', currency:'CAD', maximumFractionDigits:0});

function safeURL(value) {
    try {
        const candidate = String(value || '').trim().match(/^https?:\/\/[^\s<>"']+/i);
        if (!candidate) return null;
        const url = new URL(candidate[0]);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
}

async function loadPrograms() {
    element('resultsCount').textContent = 'Loading the saved directory…';
    element('programsList').setAttribute('aria-busy', 'true');
    try {
        const response = await fetch('programs.json');
        if (!response.ok) throw new Error(`Data request failed (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data.programs) || !data.programs.length) throw new Error('The data file has no program records.');
        allPrograms = data.programs;
        fillOptions('statusFilter', [...new Set(allPrograms.map(statusOf))], 'All recorded statuses');
        fillOptions('geographyFilter', [...new Set(allPrograms.map(p => p.geography).filter(Boolean))], 'All listed locations');
        fillOptions('sectorFilter', [...new Set(allPrograms.map(p => p.federal_provincial_private).filter(Boolean))], 'All sectors');
        element('statTotal').textContent = allPrograms.length;
        element('statOpen').textContent = allPrograms.filter(p => ['OPEN', 'ROLLING'].includes(statusOf(p))).length;
        const period = data.verification_period;
        if (period?.start && period?.end) {
            const formatDate = value => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-CA', {month:'short', day:'numeric', year:'numeric', timeZone:'UTC'});
            element('snapshotDate').textContent = `${formatDate(period.start)} – ${formatDate(period.end)}`;
        }
        applyFilters();
    } catch (error) {
        element('resultsCount').textContent = 'Directory unavailable';
        element('programsList').innerHTML = '<div class="empty-state" role="alert"><h3>The directory could not load</h3><p>Please try again. No local server or installation is needed.</p><button class="btn btn-primary" id="retryLoad">Try again</button></div>';
        element('retryLoad').addEventListener('click', loadPrograms);
        console.error('Funding directory:', error);
    } finally {
        element('programsList').setAttribute('aria-busy', 'false');
    }
}

function fillOptions(id, values, label) {
    element(id).replaceChildren(new Option(label, ''));
    values.sort((a,b) => a.localeCompare(b)).forEach(value => element(id).add(new Option(value, value)));
}

function applyFilters() {
    const search = element('searchBox').value.toLocaleLowerCase().trim();
    const status = element('statusFilter').value;
    const geography = element('geographyFilter').value;
    const sector = element('sectorFilter').value;
    const type = element('typeFilter').value.toLocaleLowerCase();
    const minAmount = numberOrNull(element('minAmount').value);
    const maxAmount = numberOrNull(element('maxAmount').value);
    const eligibility = element('eligibilityFilter').value;
    const sortBy = element('sortBy').value;
    const amountError = (minAmount !== null && minAmount < 0) || (maxAmount !== null && maxAmount < 0)
        ? 'Amounts must be zero or greater.'
        : minAmount !== null && maxAmount !== null && minAmount > maxAmount ? 'The minimum cannot exceed the maximum.' : '';
    element('amountError').textContent = amountError;
    if (amountError) {
        element('resultsCount').textContent = 'Check the amount range';
        element('programsList').innerHTML = '<div class="empty-state"><h3>Check the amount filters</h3><p>' + escapeHTML(amountError) + '</p></div>';
        return;
    }
    const filtered = allPrograms.filter(program => {
        if (search && ![program.program_name, program.tags, program.quick_description, program.geography, program.purpose, program.eligibility].join(' ').toLocaleLowerCase().includes(search)) return false;
        if (status && statusOf(program) !== status) return false;
        if (geography && program.geography !== geography) return false;
        if (sector && program.federal_provincial_private !== sector) return false;
        if (type && !String(program.funding_type || '').toLocaleLowerCase().includes(type)) return false;
        const amount = maximumOf(program.amount_max);
        if ((minAmount !== null || maxAmount !== null) && amount === null) return false;
        if (minAmount !== null && amount < minAmount) return false;
        if (maxAmount !== null && amount > maxAmount) return false;
        if (eligibility === 'non-profit' && program.non_profit_eligible !== 'Yes') return false;
        if (eligibility === 'for-profit' && program.for_profit_eligible !== 'Yes') return false;
        if (eligibility === 'both' && (program.non_profit_eligible !== 'Yes' || program.for_profit_eligible !== 'Yes')) return false;
        return true;
    });
    const statusOrder = {OPEN:1, ROLLING:2, PERIODIC:3, INVITATION:4, SELECTIVE:5, CLOSED:6};
    filtered.sort((a,b) => {
        const nameOrder = String(a.program_name).localeCompare(String(b.program_name));
        if (sortBy.startsWith('amount_')) {
            const x = maximumOf(a.amount_max), y = maximumOf(b.amount_max);
            if (x === null || y === null) return x === y ? nameOrder : x === null ? 1 : -1;
            return (sortBy === 'amount_desc' ? y-x : x-y) || nameOrder;
        }
        if (sortBy === 'status') return ((statusOrder[statusOf(a)] || 99) - (statusOrder[statusOf(b)] || 99)) || nameOrder;
        if (sortBy === 'geography') return String(a.geography || '').localeCompare(String(b.geography || '')) || nameOrder;
        return nameOrder;
    });
    displayPrograms(filtered);
}

function formatAmount(minimum, maximum) {
    const min = numberOrNull(minimum), max = maximumOf(maximum);
    if (max === null) return min > 0 ? `From ${currency.format(min)}; maximum not recorded` : 'No fixed amount recorded';
    if (min === max) return currency.format(max);
    if (!min) return `Up to ${currency.format(max)}`;
    return `${currency.format(min)} – ${currency.format(max)}`;
}

function displayPrograms(programs) {
    element('resultsCount').textContent = `${programs.length} of ${allPrograms.length} programs`;
    if (!programs.length) {
        element('programsList').innerHTML = '<div class="empty-state"><h3>No matching programs</h3><p>Try fewer filters or a broader search.</p><button class="btn btn-secondary" id="emptyReset">Clear filters</button></div>';
        element('emptyReset').addEventListener('click', resetFilters);
        return;
    }
    const item = (label, value) => `<div class="meta-item"><div class="meta-label">${label}</div><div class="meta-value">${escapeHTML(value || 'Not recorded')}</div></div>`;
    element('programsList').innerHTML = programs.map(program => {
        const url = safeURL(program.official_url);
        const status = statusOf(program);
        return `<article class="program-card">
          <div class="program-header"><div class="program-title"><h3>${escapeHTML(program.program_name)}</h3><div class="program-id">${escapeHTML(program.id)}</div></div><span class="status-badge status-${escapeHTML(status.toLowerCase().replace(/\s/g,'-'))}">${escapeHTML(status)}</span></div>
          <div class="program-meta">${item('Location as listed',program.geography)}${item('Funding type',program.funding_type)}${item('Recorded amount',formatAmount(program.amount_min,program.amount_max))}${item('Recorded deadline',program.deadline)}</div>
          <p class="program-description">${escapeHTML(program.quick_description)}</p>
          <div class="tags">${String(program.tags || '').split('#').filter(t => t.trim()).map(t => `<span class="tag">#${escapeHTML(t.trim())}</span>`).join('')}</div>
          <details class="record-details"><summary>Eligibility & record details</summary><div class="program-meta">${item('Eligibility',program.eligibility)}${item('Purpose',program.purpose)}${item('Application timing',program.application_timing)}${item('Duration',program.duration)}${item('For-profit eligible',program.for_profit_eligible)}${item('Non-profit eligible',program.non_profit_eligible)}${item('Last verification & notes',program.last_verified)}</div></details>
          <div class="program-footer">${url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="btn-link">Check provider website <span aria-hidden="true">↗</span></a>` : '<span>Provider link not recorded</span>'}${program.contact ? `<span class="contact-text">${escapeHTML(program.contact)}</span>` : ''}</div>
        </article>`;
    }).join('');
}

function resetFilters() {
    ['searchBox','statusFilter','geographyFilter','sectorFilter','typeFilter','minAmount','maxAmount','eligibilityFilter'].forEach(id => element(id).value = '');
    element('sortBy').value = 'status';
    applyFilters();
}
element('searchBox').addEventListener('input', applyFilters);
element('minAmount').addEventListener('input', applyFilters);
element('maxAmount').addEventListener('input', applyFilters);
if (window.matchMedia('(max-width: 850px)').matches) element('filterDisclosure').open = false;
loadPrograms();
