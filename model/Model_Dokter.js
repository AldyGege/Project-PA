const connection = require('../config/database');

class Model_Dokter {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(`select a.*, b.keahlian from dokter as a
                join keahlian as b on a.id_keahlian=b.id_keahlian
                order by id_dokter DESC`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('insert into dokter set ?', Data, function (err, result) {
                if (err) {
                    reject(err);
                    console.log(Data)
                    console.log(err)
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query(`select a.*, b.keahlian from dokter as a
                join keahlian as b on a.id_keahlian=b.id_keahlian
                where id_dokter = ` + id, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update dokter set ? where id_dokter =' + id, Data, function (err, result) {
                if (err) {
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                    console.log(Data);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from dokter where id_dokter =' + id, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getDokter(hari, id_keahlian) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT a.*, b.*, c.* from jadwal as a 
                join dokter as b on b.id_dokter=a.id_dokter
                join keahlian as c on c.id_keahlian=b.id_keahlian
                where ${hari} != "-" && c.id_keahlian=?`, [id_keahlian], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            });
        });
    }

    static async getDokter2() {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT a.*, b.*, c.* from jadwal as a 
                join dokter as b on b.id_dokter=a.id_dokter
                join keahlian as c on c.id_keahlian=b.id_keahlian`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            });
        });
    }

    static async getDokterHari(hari) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT a.*, b.*, c.* from jadwal as a 
                left join dokter as b on b.id_dokter=a.id_dokter
                left join keahlian as c on c.id_keahlian=b.id_keahlian
                where ${hari}`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            });
        });
    }

    static async getDokterKeahlian(id_keahlian) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT a.*, b.*, c.* from jadwal as a 
                left join dokter as b on b.id_dokter=a.id_dokter
                left join keahlian as c on c.id_keahlian=b.id_keahlian
                where c.id_keahlian=?`, [id_keahlian], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            });
        });
    }

   

    static async getDokterOne(nama_dokter) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT a.*, b.*, c.* from jadwal as a 
                join dokter as b on b.id_dokter=a.id_dokter
                join keahlian as c on c.id_keahlian=b.id_keahlian
                where a.id_dokter=?`, [nama_dokter], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log('dokter one', rows);
                }
            });
        });
    }

}


module.exports = Model_Dokter;