// Import thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.log('Lỗi kết nối MongoDB:', err));

// Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Định nghĩa schema cho sản phẩm
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String
});

const Product = mongoose.model('Product', productSchema);

// Dữ liệu giỏ hàng (sẽ được lưu trong session sau)
let cart = [];

// Redirect từ '/' sang '/product'
app.get('/', (req, res) => {
    res.redirect('/product');
});

// Route danh sách sản phẩm
app.get('/product', async (req, res) => {
    try {
        const products = await Product.find(); // Lấy sản phẩm từ MongoDB
        res.render('product-list', { products });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách sản phẩm");
    }
});

// Route thông tin chi tiết sản phẩm
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('product-detail', { product });
    } catch (err) {
        res.status(500).send("Lỗi lấy chi tiết sản phẩm");
    }
});

// Route thêm sản phẩm vào giỏ hàng
app.post('/cart/add/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            cart.push(product);
        }
        res.redirect('/product');
    } catch (err) {
        res.status(500).send("Lỗi thêm vào giỏ hàng");
    }
});

// Route xóa sản phẩm khỏi giỏ hàng (xóa từng sản phẩm)
app.post('/cart/remove/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (!isNaN(index) && index >= 0 && index < cart.length) {
        cart.splice(index, 1);
    }
    res.redirect('/cart');
});

// Route hiển thị giỏ hàng
app.get('/cart', (req, res) => {
    res.render('cart', { cart });
});

// Lắng nghe cổng
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
