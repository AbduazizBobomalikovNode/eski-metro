var searchError = require('../../resurs/functions/erors');
const fill_up = require("../../resurs/functions/fill_up");

function Certificate(table) {
    this.searchDocument = async (word) => {
        // const query = { someField: { $regex: word, $options: 'i' } };
        const query = {
            $or: [
                {
                    "id": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "id": parseInt(word)
                },
                {
                    "son": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "son": parseInt(word)
                },
                {
                    "organization": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "compare": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "comply_with": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "date": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line1": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line2": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line3": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line4": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line5": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line6": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line7": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line8": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line9": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line10": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line11": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line12": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line13": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line14": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line15": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line16": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line17": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line19": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line20": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line21": {
                        $regex: word,
                        $options: "i"
                    }
                },
                {
                    "data.line22": {
                        $regex: word,
                        $options: "i"
                    }
                },
            ]
        };
        const result = await table.find(query, {
            projection: { _id: 0 }
        }).toArray();
        return result;
    };
    this.getCertificateObj = async (obj) => {
        const result = await table.find(obj, {
            projection: { _id: 0 }
        }).toArray();
        return result;
    };
    this.getCertificate = async (id) => {
        const result = await table.findOne({ id: id }, { projection: { _id: 0 } })
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error(`Task topilmadi: ${err}`)
                return false;
            })
        return result;
    };
    this.getCertificateAll = async () => {
        const result = await table.find({}, { projection: { _id: 0 } })
            .sort({ date: -1 }).toArray()
        return result;
    };
    this.getCertificateAllFilter = async (skip, limit, { doc, lang, date, employee }) => {
        let quary = {};
        if (doc != "Hammasi" && doc) {
            quary.type = doc;
        }
        if (lang != "Hammasi" && lang) {
            quary.lang = lang;
        }
        if (date != "Hammasi" && date) {
            quary.date = date;
        }
        if (employee != "Hammasi" && employee) {
            quary.employee = employee;
        }
        console.log(quary);
        const result = await table.find(quary, { projection: { _id: 0, lastModified: 0 } })
            .sort({ son: -1 }).limit(limit).skip(skip).toArray();
        return result;
    };
    this.countCertificateFilter = async ({ doc, lang, date, employee }) => {
        let quary = {};
        if (doc != "Hammasi" && doc) {
            quary.type = doc;
        }
        if (lang != "Hammasi" && lang) {
            quary.lang = lang;
        }
        if (date != "Hammasi" && date) {
            quary.date = date;
        }
        if (employee != "Hammasi" && employee) {
            quary.employee = employee;
        }
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
        const result = await table.deleteOne({ id: id })
        return result;
    }
    this.allDocUpdate = async ()=>{
        const result = await table.find({}, { projection: { _id: 0 } })
            .sort({ date: -1 }).toArray();
            for (let index = 0; index < result.length; index++) {
                let element =  fill_up(result[index].data,result[index]);
                console.log(element);
                this.update(result[index].id,element);
            }
        // fill_up
    }
}

module.exports = Certificate;
/*
getCertificate()
getCertificateAll()
addCertificate()
update()
delete()
*/