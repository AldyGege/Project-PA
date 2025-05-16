const connection = require('../config/Database');

class Model_Keuangan {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('SELECT keuangan.*, admin.nama_admin FROM keuangan INNER JOIN admin ON keuangan.id_admin = admin.id_admin ORDER BY keuangan.id_keuangan DESC', (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
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
        (SELECT IFNULL(SUM(nominal), 0) FROM keuangan WHERE jenis_keuangan = 'pemasukan') -
        (SELECT IFNULL(SUM(nominal), 0) FROM keuangan WHERE jenis_keuangan = 'pengeluaran') AS saldo`,
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
        SUM(CASE WHEN jenis_keuangan = 'pemasukan' THEN nominal ELSE 0 END) AS total_pemasukan,
        SUM(CASE WHEN jenis_keuangan = 'pengeluaran' THEN nominal ELSE 0 END) AS total_pengeluaran
      FROM keuangan
      WHERE YEAR(waktu_keuangan) = ?
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