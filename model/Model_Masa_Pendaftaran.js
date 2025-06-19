const connection = require('../config/Database');

class Model_Masa_Pendaftaran {

    static async get() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM masa_pendaftaran LIMIT 1', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]); // hanya ambil satu baris pertama
                }
            });
        });
    }

    static async update(tanggal_mulai, tanggal_akhir) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE masa_pendaftaran SET tanggal_mulai = ?, tanggal_akhir = ? WHERE id = 1',
                [tanggal_mulai, tanggal_akhir],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

}

module.exports = Model_Masa_Pendaftaran;
