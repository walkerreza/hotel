import Pembayaran from "../models/pembayaran.models.js";
import Reservasi from "../models/reservasi.models.js";
import Kamar from "../models/kamar.models.js";
import User from "../models/user.models.js";


export const buatPembayaran = async (req, res) => {
    try {
        const { reservasi_ids, metode_pembayaran } = req.body;
        
        // Konversi single reservasi_id menjadi array
        const reservasiArray = Array.isArray(reservasi_ids) ? reservasi_ids : [reservasi_ids];
        
        let totalPembayaran = 0;
        const pembayaranResults = [];

        for (const reservasi_id of reservasiArray) {
            const reservasi = await Reservasi.findByPk(reservasi_id);
            if (!reservasi) {
                return res.status(404).json({ 
                    message: `Reservasi dengan ID ${reservasi_id} tidak ditemukan` 
                });
            }

            const kamar = await Kamar.findByPk(reservasi.kamar_id);
            if (!kamar) {
                return res.status(404).json({ 
                    message: `Kamar untuk reservasi ${reservasi_id} tidak ditemukan` 
                });
            }

            // Hitung durasi menginap
            const checkin = new Date(reservasi.tanggal_checkin);
            const checkout = new Date(reservasi.tanggal_checkout);
            const durasi = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
            
            // Hitung total per kamar
            const jumlahPerKamar = parseFloat((kamar.harga_per_malam * durasi).toFixed(2));

            // Validasi jumlah pembayaran agar tidak melebihi batas
            if (jumlahPerKamar < 0 || jumlahPerKamar > 99999999999999) { // Batas atas 99.999.999
                return res.status(400).json({ message: "Out of range value for column 'jumlah' at row 1" });
            }

            totalPembayaran += jumlahPerKamar;

            const status_pembayaran = metode_pembayaran === 'transfer' ? 'sukses' : 'pending';
            
            const pembayaran = await Pembayaran.create({
                reservasi_id,
                jumlah: jumlahPerKamar,
                metode_pembayaran,
                status_pembayaran,
                tanggal_pembayaran: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            });

            if (status_pembayaran === 'sukses') {
                await reservasi.update({ 
                    status_reservasi: 'selesai', 
                    updated_at: new Date() 
                });
                
                await Kamar.update(
                    { status_kamar: 'tersedia' },
                    { where: { id: reservasi.kamar_id } }
                );
            }

            pembayaranResults.push(pembayaran);
        }

        res.json({
            message: "Pembayaran berhasil dibuat",
            total_pembayaran: totalPembayaran,
            detail_pembayaran: pembayaranResults
        });

    } catch (error) {
        if (error.message.includes("notNull Violation")) {
            res.status(400).json({ message: "Data pembayaran tidak lengkap" });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};


export const daftarPembayaran = async (req, res) => {
    try {
        const pembayarans = await Pembayaran.findAll();
        res.json(pembayarans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const hapusPembayaran = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Hapus berdasarkan ID
            const pembayaran = await Pembayaran.findByPk(id);
            if (!pembayaran) {
                return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
            }
            if (pembayaran.status_pembayaran !== 'sukses') {
                return res.status(400).json({ message: "Pembayaran hanya dapat dihapus jika statusnya 'sukses'" });
            }
            await pembayaran.destroy();
            return res.json({ message: "Pembayaran berhasil dihapus" });
        } else {
            // Hapus semua pembayaran dengan status 'sukses'
            const deletedCount = await Pembayaran.destroy({
                where: { status_pembayaran: 'sukses' }
            });
            return res.json({ message: `${deletedCount} pembayaran berhasil dihapus` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateStatusPembayaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['pending', 'sukses', 'gagal'].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        const pembayaran = await Pembayaran.findByPk(id);
        if (!pembayaran) {
            return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
        }

        
        await pembayaran.update({ status_pembayaran: status, updated_at: new Date() });

     
        if (status === 'sukses') {
            const reservasi = await Reservasis.findByPk(pembayaran.reservasi_id);
            if (reservasi) {
                await reservasi.update({ status_reservasi: 'selesai', updated_at: new Date() });
            }
        }

        res.json({ message: `Status pembayaran berhasil diupdate menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const logPembayaranDanReservasi = async (req, res) => {
    try {
        const { id } = req.params; 
        const username = req.params.username; // Ambil username jika ada

        let result;
        if (id) {
            // Log berdasarkan ID
            result = await Reservasi.findOne({
                where: { id },
                include: [
                    {
                        model: Pembayaran, 
                        attributes: ['jumlah', 'metode_pembayaran', 'tanggal_pembayaran']
                    },
                    {
                        model: Kamar, 
                        attributes: ['tipe_kamar'] 
                    },
                    {
                        model: User, 
                        attributes: ['username'] 
                    }
                ],
                attributes: ['id', 'user_id', 'kamar_id', 'tanggal_checkin', 'tanggal_checkout', 'status_reservasi'] 
            });
        } else if (username) {
            // Log berdasarkan username
            result = await Reservasi.findOne({
                include: [
                    {
                        model: Pembayaran, 
                        attributes: ['jumlah', 'metode_pembayaran', 'tanggal_pembayaran']
                    },
                    {
                        model: Kamar, 
                        attributes: ['tipe_kamar'] 
                    },
                    {
                        model: User, 
                        where: { username },
                        attributes: ['username'] 
                    }
                ],
                attributes: ['id', 'user_id', 'kamar_id', 'tanggal_checkin', 'tanggal_checkout', 'status_reservasi'] 
            });
        }

        res.json(result); 
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
}