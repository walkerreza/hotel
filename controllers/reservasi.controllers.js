import Reservasis from "../models/reservasi.models.js";
import Kamars from "../models/kamar.models.js";
import Users from "../models/user.models.js"; 
import Log from "../models/log.model.js";
import Notification from "../models/notification.model.js";
import { Op } from 'sequelize'; // op dari squilize

export const buatReservasi = async (req, res) => {
    try {
        const { user_id, kamar_id, tanggal_checkin, tanggal_checkout } = req.body;

        // Validasi input
        if (!user_id || !kamar_id || !tanggal_checkin || !tanggal_checkout) {
            return res.status(400).json({ 
                message: "Semua field harus diisi",
                received: { user_id, kamar_id, tanggal_checkin, tanggal_checkout }
            });
        }

        // Validasi apakah user ada
        const user = await Users.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Validasi apakah kamar ada
        const kamar = await Kamars.findByPk(kamar_id);
        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }

        // Cek ketersediaan kamar
        const existingReservasi = await Reservasis.findOne({
            where: {
                kamar_id,
                tanggal_checkin: {
                    [Op.lte]: tanggal_checkout
                },
                tanggal_checkout: {
                    [Op.gte]: tanggal_checkin
                },
                status_reservasi: 'dipesan' 
            }
        });

        if (existingReservasi) {
            return res.status(400).json({ message: `Kamar sudah dipesan untuk tanggal tersebut` });
        }

        // Buat reservasi baru
        const reservasi = await Reservasis.create({
            user_id,
            kamar_id,
            tanggal_checkin,
            tanggal_checkout,
            status_reservasi: 'dipesan',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Tambah log untuk pembuatan reservasi
        await Log.create({
            type: 'CREATE',
            description: `Reservasi baru dibuat untuk kamar ${kamar.nama_kamar || kamar.nomor_kamar} oleh ${user.username}`,
            userId: user_id,
            metadata: {
                reservasiId: reservasi.id,
                kamarId: kamar_id,
                tanggalCheckin: tanggal_checkin,
                tanggalCheckout: tanggal_checkout
            }
        });

        // Buat notifikasi untuk admin
        await Notification.create({
            message: `Reservasi baru: ${user.username} memesan kamar ${kamar.nama_kamar || kamar.nomor_kamar}`,
            type: 'RESERVASI',
            metadata: {
                reservasiId: reservasi.id,
                kamarId: kamar_id,
                userId: user_id,
                tanggalCheckin: tanggal_checkin,
                tanggalCheckout: tanggal_checkout
            }
        });

        await Kamars.update(
            { status_kamar: 'dipesan' },
            { where: { id: kamar_id } }
        );

        res.status(201).json({ 
            message: "Reservasi berhasil dibuat",
            data: reservasi
        });

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ 
            message: "Terjadi kesalahan saat membuat reservasi",
            error: error.message 
        });
    }
};

export const daftarReservasi = async (req, res) => {
    try {
        const reservasis = await Reservasis.findAll({
            include: [
                { model: Users, attributes: ['username'] },
                { model: Kamars, attributes: ['nomor_kamar', 'tipe_kamar'] }
            ]
        });

        // Tambah log untuk melihat daftar reservasi
        await Log.create({
            type: 'READ',
            description: 'Mengakses daftar reservasi',
            userId: req.user.id,
            metadata: { count: reservasis.length }
        });

        res.json(reservasis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const hapusReservasi = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Hapus berdasarkan ID
            const reservasi = await Reservasis.findByPk(id);
            if (!reservasi) {
                return res.status(404).json({ message: "Reservasi tidak ditemukan" });
            }
            if (reservasi.status_reservasi !== 'selesai') {
                return res.status(400).json({ message: "Reservasi hanya dapat dihapus jika statusnya 'selesai'" });
            }
            await reservasi.destroy();

            // Tambah log untuk penghapusan reservasi
            await Log.create({
                type: 'DELETE',
                description: `Reservasi ${id} dihapus`,
                userId: req.user.id,
                metadata: { reservasi_id: id }
            });

            await Kamars.update(
                { status_kamar: 'tersedia' },
                { where: { id: reservasi.kamar_id } }
            );

            return res.json({ message: "Reservasi berhasil dihapus" });
        } else {
            // Hapus semua reservasi dengan status 'selesai'
            const deletedCount = await Reservasis.destroy({
                where: { status_reservasi: 'selesai' }
            });

            // Tambah log untuk penghapusan semua reservasi
            await Log.create({
                type: 'DELETE',
                description: 'Semua reservasi dihapus',
                userId: req.user.id
            });

            return res.json({ message: `${deletedCount} reservasi berhasil dihapus` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateStatusReservasi = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

    
        if (!['dipesan', 'dibatalkan', 'selesai'].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        const reservasi = await Reservasis.findByPk(id);
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

     
        await reservasi.update({ status_reservasi: status, updated_at: new Date() });

        // Tambah log untuk update status reservasi
        await Log.create({
            type: 'UPDATE',
            description: `Status reservasi ${id} diubah menjadi ${status}`,
            userId: req.user.id,
            metadata: { 
                reservasi_id: id,
                status_baru: status
            }
        });

        if (status === 'dibatalkan') {
            await Kamars.update(
                { status_kamar: 'tersedia' },
                { where: { id: reservasi.kamar_id } }
            );
        }

        res.json({ message: `Reservasi berhasil diupdate menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservasiByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Fetching reservasi for userId:', userId);

        // Validasi input
        if (!userId) {
            return res.status(400).json({ 
                message: "User ID tidak valid" 
            });
        }

        // Cari reservasi berdasarkan user ID dengan include detail kamar
        const reservasis = await Reservasis.findAll({
            where: { user_id: userId },
            include: [
                { 
                    model: Kamars, 
                    attributes: ['nomor_kamar', 'tipe_kamar', 'harga_per_malam'] 
                },
                { 
                    model: Users, 
                    attributes: ['username'] 
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Log aktivitas
        await Log.create({
            type: 'READ',
            description: `Mengakses daftar reservasi untuk user ${userId}`,
            userId: req.user.id,
            metadata: { 
                requestedUserId: userId,
                reservasiCount: reservasis.length 
            }
        });

        // Tambah log untuk debugging
        console.log('Reservasi found:', reservasis.length);

        if (reservasis.length === 0) {
            return res.status(404).json({ 
                message: "Tidak ada reservasi ditemukan untuk user ini" 
            });
        }

        res.json(reservasis);
    } catch (error) {
        console.error('Error dalam getReservasiByUserId:', error);
        res.status(500).json({ 
            message: "Gagal mengambil reservasi", 
            error: error.message,
            stack: error.stack 
        });
    }
};

export const daftarReservasiByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const reservasiList = await Reservasis.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: Kamars,
                    attributes: ['nomor_kamar', 'tipe_kamar', 'harga_per_malam']
                }
            ]
        });
        res.json(reservasiList);
    } catch (error) {
        console.error('Error fetching reservation history:', error);
        res.status(500).json({ message: 'Failed to fetch reservation history' });
    }
};

// Endpoint untuk mengecek status kamar
export const checkKamarStatus = async (req, res) => {
    try {
        const { kamarId } = req.params;
        const currentDate = new Date();

        const existingReservasi = await Reservasis.findOne({
            where: {
                kamar_id: kamarId,
                tanggal_checkin: {
                    [Op.lte]: currentDate
                },
                tanggal_checkout: {
                    [Op.gte]: currentDate
                },
                status_reservasi: 'dipesan'
            }
        });

        const kamar = await Kamars.findByPk(kamarId);
        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }

        res.json({ 
            isBooked: !!existingReservasi,
            status: kamar.status_kamar 
        });

    } catch (error) {
        console.error('Error checking kamar status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Endpoint untuk mengubah status reservasi saat checkout
export const checkoutReservasi = async (req, res) => {
    try {
        const { id } = req.params;
        const reservasi = await Reservasis.findByPk(id);
        
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        // Cek apakah sudah melewati tanggal dan jam checkout
        const currentDate = new Date();
        const checkoutDate = new Date(reservasi.tanggal_checkout);
        
        // Set jam checkout ke 6:00 pagi
        checkoutDate.setHours(6, 0, 0, 0);

        if (currentDate >= checkoutDate) {
            // Update status reservasi menjadi selesai
            await reservasi.update({ 
                status_reservasi: 'selesai',
                updated_at: new Date()
            });

            // Update status kamar menjadi tersedia
            await Kamars.update(
                { status_kamar: 'tersedia' },
                { where: { id: reservasi.kamar_id } }
            );

            // Tambah log untuk checkout
            await Log.create({
                type: 'UPDATE',
                description: `Reservasi ${id} telah selesai (checkout)`,
                userId: req.user.id,
                metadata: { 
                    reservasi_id: id,
                    tanggal_checkout: checkoutDate,
                    jam_checkout: '06:00'
                }
            });

            res.json({ 
                message: "Checkout berhasil, reservasi telah selesai",
                jam_checkout: '06:00'
            });
        } else {
            res.status(400).json({ 
                message: "Belum dapat checkout, waktu checkout adalah jam 06:00 pagi",
                tanggal_checkout: checkoutDate,
                jam_checkout: '06:00'
            });
        }
    } catch (error) {
        console.error('Error in checkoutReservasi:', error);
        res.status(500).json({ message: error.message });
    }
};

// Fungsi untuk mengecek dan mengupdate status reservasi yang sudah lewat checkout
export const updateExpiredReservations = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Ambil semua reservasi yang masih berstatus 'dipesan'
        const expiredReservations = await Reservasis.findAll({
            where: {
                status_reservasi: 'dipesan',
                tanggal_checkout: {
                    [Op.lt]: currentDate // Tanggal checkout kurang dari waktu sekarang
                }
            }
        });

        // Update status reservasi dan kamar
        for (const reservasi of expiredReservations) {
            const checkoutDate = new Date(reservasi.tanggal_checkout);
            checkoutDate.setHours(6, 0, 0, 0); // Set jam checkout ke 6 pagi

            if (currentDate >= checkoutDate) {
                // Update status reservasi
                await reservasi.update({
                    status_reservasi: 'selesai',
                    updated_at: new Date()
                });

                // Update status kamar
                await Kamars.update(
                    { status_kamar: 'tersedia' },
                    { where: { id: reservasi.kamar_id } }
                );

                // Tambah log
                await Log.create({
                    type: 'UPDATE',
                    description: `Reservasi ${reservasi.id} telah selesai (auto-checkout)`,
                    userId: reservasi.user_id,
                    metadata: {
                        reservasi_id: reservasi.id,
                        tanggal_checkout: checkoutDate,
                        jam_checkout: '06:00'
                    }
                });
            }
        }

        res.json({ 
            message: "Status reservasi berhasil diperbarui",
            updated_count: expiredReservations.length
        });
    } catch (error) {
        console.error('Error in updateExpiredReservations:', error);
        res.status(500).json({ message: error.message });
    }
};

// Fungsi untuk membatalkan reservasi
export const batalkanReservasi = async (req, res) => {
    try {
        const reservasiId = req.params.id;
        const userId = req.user.id; // dari token

        // Cari reservasi
        const reservasi = await Reservasis.findOne({
            where: {
                id: reservasiId,
                user_id: userId // Pastikan user yang membatalkan adalah pemilik reservasi
            }
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        // Cek apakah reservasi sudah dibatalkan atau selesai
        if (reservasi.status_reservasi === 'dibatalkan' || reservasi.status_reservasi === 'selesai') {
            return res.status(400).json({ 
                message: `Tidak dapat membatalkan reservasi dengan status ${reservasi.status_reservasi}` 
            });
        }

        // Update status reservasi
        await reservasi.update({ 
            status_reservasi: 'dibatalkan',
            updated_at: new Date()
        });

        // Update status kamar menjadi tersedia
        await Kamars.update(
            { status_kamar: 'tersedia' },
            { where: { id: reservasi.kamar_id } }
        );

        try {
            // Buat notifikasi
            await Notification.create({
                user_id: userId,
                title: 'Reservasi Dibatalkan',
                message: `Reservasi #${reservasiId} telah dibatalkan`,
                type: 'info'
            });

            // Catat ke log
            await Log.create({
                user_id: userId,
                action: 'CANCEL',
                description: `Membatalkan reservasi #${reservasiId}`,
                ip_address: req.ip
            });
        } catch (notifError) {
            console.error('Error creating notification/log:', notifError);
            // Lanjutkan eksekusi meskipun ada error di notifikasi/log
        }

        // Set timer untuk menghapus reservasi setelah 30 detik
        setTimeout(async () => {
            try {
                await Reservasis.destroy({
                    where: {
                        id: reservasiId,
                        status_reservasi: 'dibatalkan'
                    }
                });
                console.log(`Reservasi #${reservasiId} telah dihapus otomatis setelah 30 detik`);
            } catch (deleteError) {
                console.error('Error deleting cancelled reservation:', deleteError);
            }
        }, 30000); // 30 detik

        res.status(200).json({ 
            message: "Reservasi berhasil dibatalkan",
            reservasi,
            deleteAfter: 30 // Informasikan ke frontend bahwa reservasi akan dihapus dalam 30 detik
        });
    } catch (error) {
        console.error('Error in batalkanReservasi:', error);
        res.status(500).json({ 
            message: "Terjadi kesalahan saat membatalkan reservasi",
            error: error.message 
        });
    }
};
