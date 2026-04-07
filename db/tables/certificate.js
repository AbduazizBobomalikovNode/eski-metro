var searchError = require('../../resurs/functions/erors');
const fill_up = require("../../resurs/functions/fill_up");

// data.* ichidagi barcha line maydonlari ro'yxati
const DATA_LINE_FIELDS = Array.from({ length: 22 }, (_, i) => `data.line${i + 1}`);

function buildSearchQuery(word, filters) {
    let query = {};
    const andClauses = [];

    // -- Qidiruv so'zi bo'yicha $or --
    if (word && word.trim().length > 0) {
        const w = word.trim();
        const numVal = parseInt(w);
        const orClauses = [
            { organization: { $regex: w, $options: 'i' } },
            { compare: { $regex: w, $options: 'i' } },
            { comply_with: { $regex: w, $options: 'i' } },
            { employee: { $regex: w, $options: 'i' } },
            { date: { $regex: w, $options: 'i' } },
            { son: { $regex: w, $options: 'i' } },
        ];
        if (!isNaN(numVal)) {
            orClauses.push({ id: numVal });
            orClauses.push({ son: numVal });
        } else {
            orClauses.push({ id: { $regex: w, $options: 'i' } });
        }
        // data.line* maydonlari
        DATA_LINE_FIELDS.forEach(field => {
            orClauses.push({ [field]: { $regex: w, $options: 'i' } });
        });
        andClauses.push({ $or: orClauses });
    }

    // -- Filterlar --
    if (filters.doc && filters.doc !== 'Hammasi' && filters.doc !== '') {
        andClauses.push({ type: filters.doc });
    }
    if (filters.lang && filters.lang !== 'Hammasi' && filters.lang !== '') {
        andClauses.push({ lang: filters.lang });
    }
    if (filters.date && filters.date !== 'Hammasi' && filters.date !== '') {
        andClauses.push({ date: filters.date });
    }
    if (filters.employee && filters.employee !== 'Hammasi' && filters.employee !== '') {
        andClauses.push({ employee: filters.employee });
    }

    if (andClauses.length > 0) {
        query.$and = andClauses;
    }
    return query;
}

// Faqat jadval uchun kerakli maydonlar (data ni qaytarmaymiz — katta hajm)
const LIST_PROJECTION = {
    _id: 0,
    id: 1, son: 1, type: 1, lang: 1,
    comply_with: 1, compare: 1, organization: 1,
    date: 1, employee: 1, restore_date: 1,
    status: 1, link: 1, real: 1
};

function Certificate(table) {
    // ------------------------------------------------------------------
    // Eski search (mavjud routerlar uchun saqlab qolingan)
    // ------------------------------------------------------------------
    this.searchDocument = async (word) => {
        const q = buildSearchQuery(word, {});
        const result = await table.find(q, { projection: LIST_PROJECTION })
            .sort({ son: -1 }).toArray();
        return result;
    };

    // ------------------------------------------------------------------
    // YANGI: birlashtirilgan qidiruv + filter + pagination
    // ------------------------------------------------------------------
    this.searchAndFilter = async (word, filters, skip, limit) => {
        const q = buildSearchQuery(word, filters);
        const [docs, total] = await Promise.all([
            table.find(q, { projection: LIST_PROJECTION })
                .sort({ son: -1 }).skip(skip).limit(limit).toArray(),
            table.countDocuments(q)
        ]);
        return { docs, total };
    };

    // ------------------------------------------------------------------
    // Indekslarni yaratish (server start qilinganda bir marta chaqiriladi)
    // ------------------------------------------------------------------
    this.ensureIndexes = async () => {
        try {
            await Promise.all([
                table.createIndex({ id: 1 }),
                table.createIndex({ son: 1 }),
                table.createIndex({ organization: 1 }),
                table.createIndex({ employee: 1 }),
                table.createIndex({ type: 1 }),
                table.createIndex({ lang: 1 }),
                table.createIndex({ date: 1 }),
                table.createIndex({ status: 1 }),
            ]);
            console.log('[Certificate] Indekslar tayyor');
        } catch (e) {
            console.error('[Certificate] Indeks yaratishda xato:', e.message);
        }
    };

    // ------------------------------------------------------------------
    // Mavjud metodlar (o'zgarishsiz)
    // ------------------------------------------------------------------
    this.getCertificateObj = async (obj) => {
        const result = await table.find(obj, {
            projection: { _id: 0 }
        }).toArray();
        return result;
    };
    this.getCertificate = async (id) => {
        const result = await table.findOne({ id: id }, { projection: { _id: 0 } })
            .then(result => { return result; })
            .catch(err => {
                console.error(`Task topilmadi: ${err}`);
                return false;
            });
        return result;
    };
    this.getCertificateAll = async () => {
        const result = await table.find({}, { projection: { _id: 0 } })
            .sort({ date: -1 }).toArray();
        return result;
    };
    this.getCertificateAllFilter = async (skip, limit, { doc, lang, date, employee }) => {
        let quary = {};
        if (doc != "Hammasi" && doc) { quary.type = doc; }
        if (lang != "Hammasi" && lang) { quary.lang = lang; }
        if (date != "Hammasi" && date) { quary.date = date; }
        if (employee != "Hammasi" && employee) { quary.employee = employee; }
        const result = await table.find(quary, { projection: { _id: 0, lastModified: 0 } })
            .sort({ son: -1 }).limit(limit).skip(skip).toArray();
        return result;
    };
    this.countCertificateFilter = async ({ doc, lang, date, employee }) => {
        let quary = {};
        if (doc != "Hammasi" && doc) { quary.type = doc; }
        if (lang != "Hammasi" && lang) { quary.lang = lang; }
        if (date != "Hammasi" && date) { quary.date = date; }
        if (employee != "Hammasi" && employee) { quary.employee = employee; }
        return await table.countDocuments(quary);
    };
    this.addCertificate = async (certificate) => {
        const result = await table
            .insertOne(certificate)
            .catch((err) => {
                let error = { error: [] };
                searchError(err, null, error);
                return error;
            });
        return result;
    };
    this.update = async (id, certificate) => {
        const result = await table
            .updateMany({ id: id }, {
                $set: certificate,
                $currentDate: { lastModified: true }
            }).catch(err => {
                let error = { error: [] };
                searchError(err, null, error);
                return error;
            });
        const history_demo = await this.getCertificate(id);
        return history_demo;
    };
    this.delete = async (id) => {
        const result = await table.deleteOne({ id: id });
        return result;
    };
    this.allDocUpdate = async () => {
        const result = await table.find({}, { projection: { _id: 0 } })
            .sort({ date: -1 }).toArray();
        for (let index = 0; index < result.length; index++) {
            let element = fill_up(result[index].data, result[index]);
            this.update(result[index].id, element);
        }
    };
}

module.exports = Certificate;