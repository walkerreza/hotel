import Pembayaran from "../models/pembayaran.models.js";
import Reservasi from "../models/reservasi.models.js";
import Kamar from "../models/kamar.models.js";
import User from "../models/user.models.js";
import Notification from "../models/notification.model.js";
import Log from "../models/log.model.js";
import { Op } from 'sequelize';

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

            const user = await User.findByPk(reservasi.user_id);
            if (!user) {
                return res.status(404).json({ 
                    message: `User untuk reservasi ${reservasi_id} tidak ditemukan` 
                });
            }

            // Hitung durasi menginap
            const checkin = new Date(reservasi.tanggal_checkin);
            const checkout = new Date(reservasi.tanggal_checkout);
            const durasi = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
            
            // Hitung total per kamar
            const jumlahPerKamar = parseFloat((kamar.harga_per_malam * durasi).toFixed(2));

            // Validasi jumlah pembayaran agar tidak melebihi batas
            if (jumlahPerKamar < 0 || jumlahPerKamar > 99999999999999) {
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

            // Tambah log pembayaran
            await Log.create({
                type: 'CREATE',
                description: `Pembayaran baru dibuat untuk reservasi kamar ${kamar.nama_kamar} oleh ${user.username}`,
                userId: user.id,
                metadata: {
                    pembayaranId: pembayaran.id,
                    reservasiId: reservasi_id,
                    jumlah: jumlahPerKamar,
                    metodePembayaran: metode_pembayaran,
                    statusPembayaran: status_pembayaran
                }
            });

            // Buat notifikasi untuk admin
            await Notification.create({
                message: `Pembayaran baru: ${user.username} membayar reservasi kamar ${kamar.nama_kamar} (${status_pembayaran})`,
                type: 'PEMBAYARAN',
                metadata: {
                    pembayaranId: pembayaran.id,
                    reservasiId: reservasi_id,
                    userId: user.id,
                    jumlah: jumlahPerKamar,
                    metodePembayaran: metode_pembayaran,
                    statusPembayaran: status_pembayaran
                }
            });

            if (status_pembayaran === 'sukses') {
                await reservasi.update({ 
                    updated_at: new Date() 
                });
                
                // Tidak perlu mengubah status kamar menjadi tersedia
                // karena kamar masih dalam masa pemesanan
            }

            pembayaranResults.push(pembayaran);
        }

        res.status(201).json({
            message: "Pembayaran berhasil dibuat",
            data: {
                pembayaran: pembayaranResults,
                total_pembayaran: totalPembayaran
            }
        });

    } catch (error) {
        console.error('Error dalam membuat pembayaran:', error);
        if (error.message.includes("notNull Violation")) {
            res.status(400).json({ message: "Data pembayaran tidak lengkap" });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};


export const daftarPembayaran = async (req, res) => {
    try {
        const pembayarans = await Pembayaran.findAll({
            include: [{
                model: Reservasi,
                as: 'Reservasi',
                required: true,
                include: [{
                    model: User,
                    as: 'User',
                    required: true,
                    attributes: ['id', 'username', 'email']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        // Log untuk debugging
        console.log('Raw pembayaran data:', JSON.stringify(pembayarans, null, 2));

        // Transform data untuk response
        const transformedPembayarans = pembayarans.map(pembayaran => {
            const plain = pembayaran.get({ plain: true });
            return {
                ...plain,
                user: plain.Reservasi?.User || null
            };
        });

        res.json(transformedPembayarans);
    } catch (error) {
        console.error('Error in daftarPembayaran:', error);
        res.status(500).json({
            message: "Gagal mengambil data pembayaran",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            const reservasi = await Reservasi.findByPk(pembayaran.reservasi_id);
            if (reservasi) {
                await reservasi.update({ 
                    updated_at: new Date() 
                });
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
};

export const daftarPembayaranByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status_pembayaran, tanggal_pembayaran } = req.query;
        
        let whereClause = {};
        
        // Add status filter if provided
        if (status_pembayaran && status_pembayaran !== 'all') {
            whereClause.status_pembayaran = status_pembayaran;
        }
        
        // Add date filter if provided
        if (tanggal_pembayaran) {
            const startDate = new Date(tanggal_pembayaran);
            const endDate = new Date(tanggal_pembayaran);
            endDate.setDate(endDate.getDate() ); // Include the entire day
            
            whereClause.tanggal_pembayaran = {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            };
        }
        
        const pembayaranList = await Pembayaran.findAll({
            where: whereClause,
            include: [
                {
                    model: Reservasi,
                    where: { user_id: userId },
                    include: [
                        {
                            model: Kamar,
                            attributes: ['nomor_kamar', 'tipe_kamar']
                        }
                    ]
                }
            ],
            order: [['tanggal_pembayaran', 'DESC']]
        });
        
        res.json(pembayaranList);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
};

export const daftarPembayaranByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status_pembayaran, tanggal_pembayaran } = req.query;
        
        console.log('Fetching payments for user:', userId, 'with filters:', { status_pembayaran, tanggal_pembayaran });

        let whereClause = {};
        
        // Filter berdasarkan status jika ada
        if (status_pembayaran && status_pembayaran !== 'all') {
            whereClause.status_pembayaran = status_pembayaran;
        }
        
        // Filter berdasarkan tanggal jika ada
        if (tanggal_pembayaran) {
            const startDate = new Date(tanggal_pembayaran);
            const endDate = new Date(tanggal_pembayaran);
            endDate.setHours(23, 59, 59, 999);
            
            whereClause.tanggal_pembayaran = {
                [Op.between]: [startDate, endDate]
            };
        }

        const pembayarans = await Pembayaran.findAll({
            where: whereClause,
            include: [{
                model: Reservasi,
                as: 'Reservasi',
                required: true,
                where: { user_id: userId },
                include: [{
                    model: Kamar,
                    attributes: ['nomor_kamar', 'tipe_kamar']
                }]
            }],
            order: [['tanggal_pembayaran', 'DESC']]
        });

        console.log(`Found ${pembayarans.length} payments for user ${userId}`);
        
        // Transform data untuk response
        const transformedData = pembayarans.map(pembayaran => ({
            id: pembayaran.id,
            reservasi_id: pembayaran.reservasi_id,
            metode_pembayaran: pembayaran.metode_pembayaran,
            jumlah: pembayaran.jumlah,
            status_pembayaran: pembayaran.status_pembayaran,
            tanggal_pembayaran: pembayaran.tanggal_pembayaran,
            kamar: pembayaran.Reservasi?.Kamar ? {
                nomor_kamar: pembayaran.Reservasi.Kamar.nomor_kamar,
                tipe_kamar: pembayaran.Reservasi.Kamar.tipe_kamar
            } : null
        }));

        res.json(transformedData);
    } catch (error) {
        console.error('Error in daftarPembayaranByUser:', error);
        res.status(500).json({ 
            message: "Gagal mengambil data pembayaran",
            error: error.message 
        });
    }
};