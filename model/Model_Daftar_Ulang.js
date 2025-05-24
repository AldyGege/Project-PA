const connection = require('../config/Database');

class Model_Daftar_Ulang {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                daftar_ulang.*, 
                pendaftaran.nama_pendaftar, 
                pendaftaran.nik, 
                pendaftaran.status_pendaftaran,
                users.nama_users AS nama_user,
                users.nama_users
                FROM daftar_ulang
                INNER JOIN pendaftaran ON daftar_ulang.id_pendaftaran = pendaftaran.id_pendaftaran
                INNER JOIN users ON daftar_ulang.id_users = users.id_users
                ORDER BY daftar_ulang.waktu_daftar_ulang ASC;
                `, 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
    

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into daftar_ulang set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM daftar_ulang WHERE id_daftar_ulang = ?', 
                [parseInt(id)], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
    
    
    static async UpdateStatusByPendaftaranId(id_pendaftaran, status_daftar_ulang) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE daftar_ulang SET status_daftar_ulang = ? WHERE id_pendaftaran = ?',
                [status_daftar_ulang, id_pendaftaran],
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
    
      
    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update daftar_ulang set ? where id_daftar_ulang =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }
    
    static async getByPendaftaran(id_pendaftaran) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM daftar_ulang WHERE id_pendaftaran = ?',
                [id_pendaftaran],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
    
    

    static async UpdateStatus(id, status_daftar_ulang) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE daftar_ulang SET status_daftar_ulang = ? WHERE id_daftar_ulang = ?', 
                [status_daftar_ulang, id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    static async UpdateStatusWithAlasan(id, status_daftar_ulang, alasan) {
    return new Promise((resolve, reject) => {
        connection.query(
            'UPDATE daftar_ulang SET status_daftar_ulang = ?, alasan = ? WHERE id_daftar_ulang = ?',
            [status_daftar_ulang, alasan, id],
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

    
    static async getByUserId(id_users) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM daftar_ulang WHERE id_users = ? ORDER BY waktu_daftar_ulang DESC', 
                [id_users], 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    static async countBaru() {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT COUNT(*) AS total FROM daftar_ulang WHERE status_daftar_ulang = 'proses'`,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0].total);
                }
            }
        );
    });
}

    
    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from daftar_ulang where id_daftar_ulang =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Daftar_Ulang;