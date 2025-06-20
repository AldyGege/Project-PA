const connection = require('../config/Database');

class Model_Keuangan {

static async getAll() {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT keuangan.*, admin.nama_admin 
             FROM keuangan 
             INNER JOIN admin ON keuangan.id_admin = admin.id_admin 
             ORDER BY keuangan.waktu_keuangan DESC`, 
            (err, rows) => {
                if(err) {
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
            connection.query('insert into keuangan set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id){
        return new Promise((resolve, reject) => {
            connection.query('select * from keuangan where id_keuangan = ' + id, (err,rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

static async getSaldoSaatIni() {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT 
        (SELECT IFNULL(SUM(nominal), 0) FROM keuangan WHERE jenis_keuangan = 'pemasukan' AND status_validasi = 'disetujui') -
        (SELECT IFNULL(SUM(nominal), 0) FROM keuangan WHERE jenis_keuangan = 'pengeluaran' AND status_validasi = 'disetujui') AS saldo`,
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0].saldo);
      }
    );
  });
}

static async getGrafikKeuanganPerBulan(tahun) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT 
        MONTH(waktu_keuangan) AS bulan,
        YEAR(waktu_keuangan) AS tahun,
        SUM(CASE WHEN jenis_keuangan = 'pemasukan' AND status_validasi = 'disetujui' THEN nominal ELSE 0 END) AS total_pemasukan,
        SUM(CASE WHEN jenis_keuangan = 'pengeluaran' AND status_validasi = 'disetujui' THEN nominal ELSE 0 END) AS total_pengeluaran
      FROM keuangan
      WHERE YEAR(waktu_keuangan) = ? AND status_validasi = 'disetujui'
      GROUP BY YEAR(waktu_keuangan), MONTH(waktu_keuangan)
      ORDER BY bulan`,
      [tahun],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

static async getDistinctBulanByYear(tahun) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT MONTH(waktu_keuangan) as bulan
      FROM keuangan
      WHERE YEAR(waktu_keuangan) = ? AND status_validasi = 'disetujui'
      ORDER BY bulan
    `;
    connection.query(sql, [tahun], (err, results) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const bulanList = results.map(r => r.bulan);
        resolve(bulanList);
      }
    });
  });
}
static async getDistinctYears() {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT DISTINCT YEAR(waktu_keuangan) as tahun 
       FROM keuangan 
       WHERE status_validasi = 'disetujui'
       ORDER BY tahun DESC`,
      (err, results) => {
        if (err) reject(err);
        else resolve(results.map(r => r.tahun));
      }
    );
  });
}

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update keuangan set ? where id_keuangan =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }
    
    static async UpdateStatusValidasi(id, status_validasi) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE keuangan SET status_validasi = ? WHERE id_keuangan = ?';
        connection.query(query, [status_validasi, id], (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from keuangan where id_keuangan =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Keuangan;