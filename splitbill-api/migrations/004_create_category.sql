CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO categories (id, name, icon, color) VALUES
(1, 'Makanan', 'pizza', '#EF4444'),
(2, 'Transportasi', 'car', '#3B82F6'),
(3, 'Belanja', 'shopping-bag', '#10B981'),
(4, 'Tagihan', 'file-text', '#F59E0B'),
(5, 'Hiburan', 'film', '#8B5CF6'),
(6, 'Kesehatan', 'heart', '#EC4899'),
(7, 'Lainnya', 'more-horizontal', '#6B7280');