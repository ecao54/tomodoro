const Stats = require('../models/Stats');

const getTimeRanges = (period, offset = 0) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const offsetDate = new Date(today);

    switch(period) {
        case 'today':
            offsetDate.setDate(today.getDate() + parseInt(offset));
            return {
                start: new Date(offsetDate.setHours(0, 0, 0, 0)),
                end: new Date(offsetDate.setHours(23, 59, 59, 999))
            };
            
        case 'week':
            offsetDate.setDate(today.getDate() + (parseInt(offset) * 7));
            const weekStart = new Date(offsetDate);
            weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            return { start: weekStart, end: weekEnd };
            
        case 'month':
            offsetDate.setMonth(today.getMonth() + parseInt(offset));
            return {
                start: new Date(offsetDate.getFullYear(), offsetDate.getMonth(), 1),
                end: new Date(offsetDate.getFullYear(), offsetDate.getMonth() + 1, 0, 23, 59, 59, 999)
            };
            
        case 'year':
            offsetDate.setFullYear(today.getFullYear() + parseInt(offset));
            return {
                start: new Date(offsetDate.getFullYear(), 0, 1),
                end: new Date(offsetDate.getFullYear(), 11, 31, 23, 59, 59, 999)
            };
            
        case 'all time':
        default:
            return {
                start: new Date(today.getFullYear() - 4, 0, 1),
                end: now
            };
    }
};

module.exports = {
    getTimeRanges
};