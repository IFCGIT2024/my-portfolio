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
