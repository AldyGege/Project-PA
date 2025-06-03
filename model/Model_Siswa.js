const connection = require('../config/Database');

class Model_Siswa {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT
siswa.*,
pendaftaran.nama_pendaftar,
COALESCE(siswa.nik, pendaftaran.nik) AS nik,
COALESCE(siswa.gambar_siswa, pendaftaran.gambar_pendaftar) AS gambar_siswa,
COALESCE(siswa.file_kk, daftar_ulang.file_kk) AS file_kk,
COALESCE(siswa.file_akta, daftar_ulang.file_akta) AS file_akta,
users.nama_users,
daftar_ulang.waktu_daftar_ulang,
daftar_ulang.status_daftar_ulang
FROM siswa
LEFT JOIN pendaftaran ON siswa.id_pendaftaran = pendaftaran.id_pendaftaran
LEFT JOIN users ON siswa.id_users = users.id_users
LEFT JOIN daftar_ulang ON daftar_ulang.id_pendaftaran = pendaftaran.id_pendaftaran
ORDER BY siswa.nama_siswa ASC
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
            connection.query('insert into siswa set ?', Data, function(err, result){
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
            connection.query('select * from siswa where id_siswa = ' + id, (err,rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    static async getByPendaftaran(id_pendaftaran) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM siswa WHERE id_pendaftaran = ?', [id_pendaftaran], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async getStatistikPerTahun() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT YEAR(waktu_siswa) AS tahun, COUNT(*) AS jumlah_siswa
      FROM siswa
      GROUP BY tahun
      ORDER BY tahun ASC
    `;
    connection.query(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

    


    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update siswa set ? where id_siswa =' + id, Data, function(err, result){
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
            connection.query('delete from siswa where id_siswa =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Siswa;